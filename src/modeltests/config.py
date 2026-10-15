"""Load the benchmark file and reject a config that cannot be run."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from modeltests.prompt import slug_base

SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
GROK_EFFORTS = {"none", "minimal", "low", "medium", "high", "xhigh", "max"}
CLAUDE_EFFORTS = {"low", "medium", "high", "xhigh", "max"}
COPILOT_EFFORTS = {"none", "minimal", "low", "medium", "high", "xhigh", "max"}
EFFORT_WORDS = GROK_EFFORTS | CLAUDE_EFFORTS | COPILOT_EFFORTS
AGENTS = {"grok", "claude", "cursor", "copilot"}


class ConfigError(Exception):
    pass


@dataclass
class Variant:
    id: str
    agent: str
    label: str
    model: str
    effort: str
    enabled: bool


@dataclass
class Suffix:
    id: str
    family: str
    label: str
    text: str
    enabled: bool


@dataclass
class Config:
    timeout_seconds: int
    task_id: str
    task_text: str
    constraints: str
    variants: list[Variant]
    suffixes: list[Suffix]
    warnings: list[str] = field(default_factory=list)

    def enabled_variants(self) -> list[Variant]:
        return [item for item in self.variants if item.enabled]

    def enabled_suffixes(self) -> list[Suffix]:
        return [item for item in self.suffixes if item.enabled]

    def cells(self) -> list[tuple[Variant, Suffix]]:
        return [
            (variant, suffix)
            for variant in self.enabled_variants()
            for suffix in self.enabled_suffixes()
        ]


@dataclass(frozen=True)
class Workspace:
    root: Path
    config_path: Path

    @property
    def runs(self) -> Path:
        return self.root / "runs"

    @property
    def output(self) -> Path:
        return self.root / "output-code"

    @property
    def docs(self) -> Path:
        return self.root / "docs"

    @property
    def compiler(self) -> Path:
        return self.root / "compiler"


def workspace_from_config(config_arg: str) -> Workspace:
    path = Path(config_arg)
    if not path.is_absolute():
        path = Path.cwd() / path
    path = path.resolve()
    root = path.parent.parent if path.parent.name == "config" else path.parent
    return Workspace(root, path)


def pinned_typescript(root: Path) -> str:
    path = root / "compiler" / "package.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        version = data["dependencies"]["typescript"]
    except (OSError, json.JSONDecodeError, KeyError, TypeError) as exc:
        raise ConfigError(f"cannot read the pinned TypeScript version from {path.name}") from exc
    if not isinstance(version, str) or not version.strip():
        raise ConfigError("the pinned TypeScript version is empty")
    return version


def _slug(value: object, label: str) -> str:
    if not isinstance(value, str) or not SLUG.fullmatch(value):
        raise ConfigError(f"{label} must be a lowercase slug")
    return value


def _text(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ConfigError(f"{label} is required")
    return value


def _enabled(raw: dict, label: str) -> bool:
    if "enabled" not in raw:
        return True
    value = raw["enabled"]
    if not isinstance(value, bool):
        raise ConfigError(f"{label} enabled must be true or false")
    return value


def _effort_tail(model: str) -> str | None:
    token = re.split(r"[^A-Za-z0-9]+", model)[-1].lower()
    if token in EFFORT_WORDS:
        return token
    return None


def load_config(path: Path, root: Path | None = None) -> Config:
    path = path.resolve()
    root = (root or path.parent.parent).resolve()
    try:
        loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ConfigError(f"cannot read the config file") from exc
    except yaml.YAMLError as exc:
        raise ConfigError(f"cannot parse the config file: {exc}") from exc
    if not isinstance(loaded, dict):
        raise ConfigError("the config file must be a mapping")
    timeout = loaded.get("timeout_seconds")
    if not isinstance(timeout, int) or isinstance(timeout, bool) or timeout <= 0:
        raise ConfigError("timeout_seconds must be a positive integer")
    task = loaded.get("task")
    if not isinstance(task, dict):
        raise ConfigError("task is required")
    task_id = _slug(task.get("id"), "task id")
    task_text = _text(task.get("text"), "task text")
    constraints = _text(loaded.get("constraints"), "constraints")
    pinned = pinned_typescript(root)
    if pinned not in constraints:
        raise ConfigError(
            f"the constraints name TypeScript {pinned}, matching compiler/package.json"
        )
    variants_raw = loaded.get("variants")
    suffixes_raw = loaded.get("suffixes")
    if not isinstance(variants_raw, list) or not variants_raw:
        raise ConfigError("variants must be a non-empty list")
    if not isinstance(suffixes_raw, list) or not suffixes_raw:
        raise ConfigError("suffixes must be a non-empty list")
    variants = [_variant(item, index) for index, item in enumerate(variants_raw, start=1)]
    suffixes = [_suffix(item, index) for index, item in enumerate(suffixes_raw, start=1)]
    _unique(variants, "variant")
    _unique(suffixes, "suffix")
    config = Config(timeout, task_id, task_text, constraints, variants, suffixes)
    _reject_slug_collisions(config)
    config.warnings.extend(_cursor_warnings(config))
    return config


def _unique(items: list[Variant] | list[Suffix], kind: str) -> None:
    seen: set[str] = set()
    for item in items:
        if item.id in seen:
            raise ConfigError(f"duplicate {kind} id {item.id}")
        seen.add(item.id)


def _variant(raw: object, index: int) -> Variant:
    if not isinstance(raw, dict):
        raise ConfigError(f"variant {index} must be a mapping")
    identifier = _slug(raw.get("id"), f"variant {index} id")
    agent = raw.get("agent")
    if agent not in AGENTS:
        raise ConfigError(f"variant {identifier} agent must be grok, claude, cursor, or copilot")
    model = raw.get("model")
    effort = raw.get("effort")
    if not isinstance(model, str) or not model.strip():
        raise ConfigError(f"variant {identifier} needs a model")
    if not isinstance(effort, str) or not effort.strip():
        raise ConfigError(f"variant {identifier} needs an effort")
    if agent == "grok" and effort not in GROK_EFFORTS:
        raise ConfigError(f"variant {identifier} effort is not a Grok effort")
    if agent == "claude" and effort not in CLAUDE_EFFORTS:
        raise ConfigError(f"variant {identifier} effort is not a Claude effort")
    if agent == "copilot" and effort not in COPILOT_EFFORTS:
        raise ConfigError(f"variant {identifier} effort is not a Copilot effort")
    label = raw.get("label")
    if not isinstance(label, str) or not label.strip():
        label = identifier
    return Variant(identifier, agent, label, model.strip(), effort.strip(), _enabled(raw, identifier))


def _suffix(raw: object, index: int) -> Suffix:
    if not isinstance(raw, dict):
        raise ConfigError(f"suffix {index} must be a mapping")
    identifier = _slug(raw.get("id"), f"suffix {index} id")
    family = raw.get("family")
    label = raw.get("label")
    text = raw.get("text")
    if not isinstance(family, str) or not family.strip():
        raise ConfigError(f"suffix {identifier} needs a family")
    if not isinstance(label, str) or not label.strip():
        raise ConfigError(f"suffix {identifier} needs a label")
    if not isinstance(text, str):
        raise ConfigError(f"suffix {identifier} needs text")
    return Suffix(identifier, family.strip(), label.strip(), text, _enabled(raw, identifier))


def _reject_slug_collisions(config: Config) -> None:
    seen: dict[str, str] = {}
    for variant, suffix in config.cells():
        base = slug_base(variant.agent, variant.model, variant.effort, suffix.id)
        previous = seen.get(base)
        if previous is not None:
            raise ConfigError(
                f"{variant.id}/{suffix.id} and {previous} use the same folder slug before the date"
            )
        seen[base] = f"{variant.id}/{suffix.id}"


def _cursor_warnings(config: Config) -> list[str]:
    warnings: list[str] = []
    for variant in config.variants:
        if variant.agent != "cursor":
            continue
        tail = _effort_tail(variant.model)
        if tail and tail != variant.effort.lower():
            warnings.append(
                f"variant {variant.id} model ends in {tail}, but effort is {variant.effort}"
            )
    return warnings
