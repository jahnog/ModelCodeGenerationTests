"""Fixtures for harness tests. Paths stay inside the temporary directory."""

from __future__ import annotations

import json
from pathlib import Path

from modeltests.config import Config, load_config
from modeltests.prompt import build_slug
from modeltests.publish import write_json

REPO = Path(__file__).resolve().parents[1]

CONSTRAINTS = """\
Write every file in the current directory. Do not use sudo and do not change anything outside this directory.
The code must typecheck with TypeScript 7.0.2, strict, target ES2022, module ESNext, and moduleResolution bundler.
Write .ts files only. Do not write JSX. Do not import a package or a Node built-in module.
A relative import does not need a file extension.
Put an export in every .ts file so TypeScript treats the file as a module.
"""


def config_text(body: str) -> str:
    return (
        "timeout_seconds: 30\n"
        "task:\n"
        "  id: shopping-cart\n"
        "  text: \"Make a program.\"\n"
        "constraints: |\n"
        + "".join("  " + line + "\n" for line in CONSTRAINTS.splitlines())
        + body
    )


def small_config(*extra: str) -> str:
    variants = """\
variants:
  - id: grok-medium
    agent: grok
    label: Grok Build
    model: grok-4.7
    effort: medium
    enabled: true
  - id: paused
    agent: claude
    label: Claude Code
    model: opus
    effort: low
    enabled: false
"""
    suffixes = """\
suffixes:
  - id: none
    family: baseline
    label: None
    text: ""
    enabled: true
  - id: simple
    family: baseline
    label: Simple
    text: "generate code as simple as possible"
    enabled: true
  - id: parked
    family: principles
    label: Parked
    text: "follow solid."
    enabled: false
"""
    return config_text(variants + suffixes + "".join(extra))


def write_project(root: Path, text: str, *, link_compiler: bool = False) -> Path:
    config = root / "config" / "benchmark.yaml"
    config.parent.mkdir(parents=True, exist_ok=True)
    config.write_text(text, encoding="utf-8")
    compiler = root / "compiler"
    compiler.mkdir(exist_ok=True)
    (compiler / "package.json").write_text(
        json.dumps({"private": True, "dependencies": {"typescript": "7.0.2"}}) + "\n",
        encoding="utf-8",
    )
    real = REPO / "compiler" / "tsconfig.json"
    (compiler / "tsconfig.json").write_text(real.read_text(encoding="utf-8"), encoding="utf-8")
    if link_compiler:
        modules = compiler / "node_modules"
        if not modules.exists():
            modules.symlink_to(REPO / "compiler" / "node_modules", target_is_directory=True)
    (root / ".gitignore").write_text(
        "runs/\noutput-code/\ncompiler/node_modules/\n.env\n",
        encoding="utf-8",
    )
    (root / "docs").mkdir(exist_ok=True)
    return config


def load_project(root: Path, text: str | None = None, *, link_compiler: bool = False) -> tuple[Path, Config]:
    from modeltests.config import workspace_from_config

    config = write_project(root, text or small_config(), link_compiler=link_compiler)
    ws = workspace_from_config(str(config))
    return ws, load_config(ws.config_path, ws.root)


def add_attempt(
    ws,
    cfg: Config,
    *,
    variant_id: str = "grok-medium",
    suffix_id: str = "none",
    stamp: str = "2026-10-14T00-00-00Z",
    day: str = "2026-10-14",
    source: str = "live",
    exit_code: int | None = 0,
    timed_out: bool = False,
    files: dict[str, str | bytes] | None = None,
    metrics: dict | None = None,
    task_text: str | None = None,
    model: str | None = None,
    effort: str | None = None,
    agent: str | None = None,
) -> Path:
    variant = next(item for item in cfg.variants if item.id == variant_id)
    suffix = next(item for item in cfg.suffixes if item.id == suffix_id)
    path = ws.runs / cfg.task_id / variant_id / suffix_id / stamp
    code = path / "code"
    code.mkdir(parents=True, exist_ok=True)
    for rel, content in (files or {"cart.ts": "export const answer = 1;\n"}).items():
        target = code / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, bytes):
            target.write_bytes(content)
        else:
            target.write_text(content, encoding="utf-8")
    slug = build_slug(
        agent or variant.agent,
        model or variant.model,
        effort or variant.effort,
        suffix.id,
        day,
    )
    stored = metrics or {
        "total_time_seconds": 1.5,
        "total_tokens": 12,
        "total_tokens_source": "cli",
        "cost_usd": 0.01,
        "source_lines": 1,
        "compile_status": "pass",
        "compile_seconds": 0.2,
        "diagnostics": [],
        "final_text": "done",
        "final_text_chars": 4,
        "checklist": {},
        "token_parts": {},
    }
    write_json(
        path / "meta.json",
        {
            "variant_id": variant_id,
            "suffix_id": suffix_id,
            "agent": agent or variant.agent,
            "model": model or variant.model,
            "effort": effort or variant.effort,
            "slug": slug,
            "date": day,
            "source": source,
            "task_text": cfg.task_text if task_text is None else task_text,
            "constraints_text": cfg.constraints,
            "suffix_text": suffix.text,
            "exit_code": exit_code,
            "timed_out": timed_out,
            "global_rules_present": False,
            "error_text": "",
        },
    )
    write_json(path / "metrics.json", stored)
    (path / "prompt.txt").write_text("prompt\n", encoding="utf-8")
    return path
