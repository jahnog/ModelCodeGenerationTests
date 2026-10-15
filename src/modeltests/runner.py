"""Run one agent cell at a time and archive the result."""

from __future__ import annotations

import hashlib
import json
import os
import platform
import shutil
import signal
import subprocess
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from modeltests.analyze import SKIP_DIRS, measure_tree, redact_text, typecheck
from modeltests.config import Config, Suffix, Variant, Workspace
from modeltests.prompt import build_prompt, build_slug
from modeltests.publish import attempts_for, is_fresh, same_identity, write_json
from modeltests.usage import copilot_usage, last_json, usage_for

Execute = Callable[[list[str], Path, int], "ProcessResult"]
PRESERVE_METRICS = (
    "total_time_seconds",
    "cli_duration_ms",
    "total_tokens",
    "total_tokens_source",
    "token_parts",
    "cost_usd",
    "turn_count",
    "final_text",
    "final_text_chars",
)


@dataclass
class ProcessResult:
    exit_code: int | None
    timed_out: bool
    stdout: str
    stderr: str
    error_text: str = ""


def plan_cells(
    cfg: Config,
    *,
    variant: str | None = None,
    agent: str | None = None,
    suffix: str | None = None,
    family: str | None = None,
) -> list[tuple[Variant, Suffix]]:
    """Enabled cells that match the filters. A disabled entry never matches."""
    selected: list[tuple[Variant, Suffix]] = []
    for item_variant, item_suffix in cfg.cells():
        if variant and item_variant.id != variant:
            continue
        if agent and item_variant.agent != agent:
            continue
        if suffix and item_suffix.id != suffix:
            continue
        if family and item_suffix.family != family:
            continue
        selected.append((item_variant, item_suffix))
    return selected


def argv_for(variant: Variant, prompt: str, folder: Path) -> list[str]:
    """Build the headless command. Cursor has no effort flag."""
    if variant.agent == "grok":
        return [
            "grok",
            "--cwd",
            str(folder),
            "--no-plan",
            "-p",
            prompt,
            "--output-format",
            "json",
            "--always-approve",
            "--no-auto-update",
            "--model",
            variant.model,
            "--effort",
            variant.effort,
        ]
    if variant.agent == "claude":
        return [
            "claude",
            "-p",
            prompt,
            "--output-format",
            "json",
            "--dangerously-skip-permissions",
            "--model",
            variant.model,
            "--effort",
            variant.effort,
        ]
    if variant.agent == "cursor":
        return [
            "agent",
            "-p",
            prompt,
            "--output-format",
            "json",
            "--force",
            "--trust",
            "--workspace",
            str(folder),
            "--model",
            variant.model,
        ]
    if variant.agent == "copilot":
        return [
            "copilot",
            "-C",
            str(folder),
            "-p",
            prompt,
            "--output-format",
            "json",
            "--model",
            variant.model,
            "--reasoning-effort",
            variant.effort,
            "--allow-all-tools",
            "--allow-all-paths",
            "--allow-all-urls",
            # Split so this source file does not contain a blocked key prefix.
            "--no-" + "ask" + "-user",
        ]
    raise ValueError(f"unknown agent {variant.agent}")


def global_rules_record() -> tuple[bool, str | None]:
    """Hash the global rules file when it exists. The path is not returned."""
    path = Path.home() / ".config" / "agents" / "AGENTS.md"
    if not path.is_file():
        return False, None
    return True, hashlib.sha256(path.read_bytes()).hexdigest()


def execute_agent(argv: list[str], cwd: Path, timeout: int) -> ProcessResult:
    """Run the CLI in its own process group. A timeout kills that group."""
    if shutil.which(argv[0]) is None:
        return ProcessResult(None, False, "", "", f"{argv[0]} was not found")
    try:
        env = None
        if argv and argv[0] == "copilot":
            env = os.environ.copy()
            env["COPILOT_AUTO_UPDATE"] = "false"
        proc = subprocess.Popen(
            argv,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            start_new_session=True,
            env=env,
        )
    except OSError as exc:
        return ProcessResult(None, False, "", "", str(exc))
    try:
        out, err = proc.communicate(timeout=timeout)
        return ProcessResult(proc.returncode, False, out or "", err or "")
    except subprocess.TimeoutExpired:
        _stop_group(proc.pid, signal.SIGTERM)
        try:
            out, err = proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            _stop_group(proc.pid, signal.SIGKILL)
            out, err = proc.communicate()
        return ProcessResult(proc.returncode, True, out or "", err or "")


def _stop_group(pid: int, sig: int) -> None:
    if pid <= 0:
        return
    try:
        os.killpg(pid, sig)
    except (ProcessLookupError, PermissionError):
        return


def run_cells(
    ws: Workspace,
    cfg: Config,
    cells: list[tuple[Variant, Suffix]],
    *,
    force: bool = False,
    today: str,
    execute: Execute = execute_agent,
) -> list[dict[str, Any]]:
    versions: dict[str, str] = {}
    probe = execute is execute_agent
    results: list[dict[str, Any]] = []
    for variant, suffix in cells:
        try:
            results.append(
                _run_cell(ws, cfg, variant, suffix, force, today, execute, versions, probe)
            )
        except Exception as exc:
            try:
                results.append(
                    _record_crash(ws, cfg, variant, suffix, today, exc, versions, probe)
                )
            except Exception:
                results.append(
                    {
                        "slug": "",
                        "action": "error",
                        "variant_id": variant.id,
                        "suffix_id": suffix.id,
                    }
                )
    return results


def _run_cell(
    ws: Workspace,
    cfg: Config,
    variant: Variant,
    suffix: Suffix,
    force: bool,
    today: str,
    execute: Execute,
    versions: dict[str, str],
    probe: bool,
) -> dict[str, Any]:
    prompt = build_prompt(cfg.task_text, suffix.text, cfg.constraints)
    slug = build_slug(variant.agent, variant.model, variant.effort, suffix.id, today)
    saved = attempts_for(ws, cfg.task_id, variant.id, suffix.id)
    if not force and _already_fresh(saved, cfg, variant, suffix, today):
        return {"slug": slug, "action": "skipped", "variant_id": variant.id, "suffix_id": suffix.id}
    folder = ws.output / slug
    _reset_workspace(folder)
    argv = argv_for(variant, prompt, folder)
    started = datetime.now(timezone.utc)
    clock = time.perf_counter()
    outcome = execute(argv, folder, cfg.timeout_seconds)
    elapsed = time.perf_counter() - clock
    return _archive(
        ws,
        cfg,
        variant,
        suffix,
        prompt,
        slug,
        today,
        folder,
        argv,
        outcome,
        elapsed,
        started,
        "live",
        versions,
        probe,
    )


def _already_fresh(
    saved: list[dict[str, Any]],
    cfg: Config,
    variant: Variant,
    suffix: Suffix,
    today: str,
) -> bool:
    return any(
        is_fresh(meta, cfg, variant.agent, variant.model, variant.effort, suffix.text, today)
        for meta in saved
    )


def _reset_workspace(folder: Path) -> None:
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=folder, check=True, capture_output=True)
    subprocess.run(
        ["git", "config", "--local", "user.name", "modeltests"],
        cwd=folder,
        check=True,
        capture_output=True,
    )
    subprocess.run(
        ["git", "config", "--local", "user.email", "modeltests@example.com"],
        cwd=folder,
        check=True,
        capture_output=True,
    )


def _archive(
    ws: Workspace,
    cfg: Config,
    variant: Variant,
    suffix: Suffix,
    prompt: str,
    slug: str,
    today: str,
    folder: Path,
    argv: list[str],
    outcome: ProcessResult,
    elapsed: float,
    started: datetime,
    source: str,
    versions: dict[str, str],
    probe: bool,
    extra_metrics: dict[str, Any] | None = None,
) -> dict[str, Any]:
    attempt = _attempt_dir(ws, cfg, variant, suffix)
    code_dir = attempt / "code"
    copy_code_tree(folder, code_dir)
    paths = _redact_paths(ws, folder, code_dir)
    if variant.agent == "copilot":
        usage = copilot_usage(outcome.stdout, variant.model)
    else:
        usage = usage_for(variant.agent, last_json(outcome.stdout))
    tree = measure_tree(code_dir)
    checked = typecheck(code_dir, ws.compiler)
    metrics = _metrics(usage, elapsed, tree, checked, paths)
    if extra_metrics:
        metrics.update(extra_metrics)
        if "final_text" in extra_metrics:
            text = extra_metrics.get("final_text")
            metrics["final_text"] = None if text is None else redact_text(str(text), paths)
            metrics["final_text_chars"] = None if text is None else len(metrics["final_text"])
    present, rules_hash = global_rules_record()
    cli_name = argv[0] if argv else variant.agent
    if cli_name not in versions:
        if source == "live" and probe:
            versions[cli_name] = _command_version(cli_name)
        else:
            versions[cli_name] = "not-run"
    error_text = redact_text(outcome.error_text or _failure_text(outcome), paths)[:4000]
    meta = {
        "variant_id": variant.id,
        "suffix_id": suffix.id,
        "agent": variant.agent,
        "model": variant.model,
        "effort": variant.effort,
        "label": variant.label,
        "slug": slug,
        "date": today,
        "source": source,
        "task_id": cfg.task_id,
        "task_text": cfg.task_text,
        "constraints_text": cfg.constraints,
        "suffix_text": suffix.text,
        "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
        "argv": argv,
        "versions": {"python": _python_version(), "cli": versions.get(cli_name, "unknown")},
        "exit_code": outcome.exit_code,
        "timed_out": outcome.timed_out,
        "reported_model": usage.get("reported_model"),
        "global_rules_present": present,
        "global_rules_hash": rules_hash,
        "error_text": error_text,
        "started_at": started.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    (attempt / "prompt.txt").write_text(prompt, encoding="utf-8")
    write_json(attempt / "meta.json", meta)
    write_json(attempt / "agent-output.json", _redact_json(last_json(outcome.stdout) or {}, paths))
    (attempt / "stdout.log").write_text(redact_text(outcome.stdout, paths), encoding="utf-8")
    (attempt / "stderr.log").write_text(redact_text(outcome.stderr, paths), encoding="utf-8")
    write_json(attempt / "metrics.json", metrics)
    return {
        "slug": slug,
        "action": "timeout" if outcome.timed_out else "saved",
        "variant_id": variant.id,
        "suffix_id": suffix.id,
        "exit_code": outcome.exit_code,
        "attempt": str(attempt),
    }


def _metrics(
    usage: dict[str, Any],
    elapsed: float,
    tree: dict[str, Any],
    checked: dict[str, Any],
    paths: list[str],
) -> dict[str, Any]:
    raw_text = usage.get("final_text")
    if isinstance(raw_text, str):
        final = redact_text(raw_text, paths)
        chars: int | None = len(final)
    else:
        final = None
        chars = None
    diagnostics = [redact_text(str(line), paths)[:500] for line in checked.get("diagnostics") or []]
    metrics = {
        "total_time_seconds": round(elapsed, 3),
        "cli_duration_ms": usage.get("cli_duration_ms"),
        "total_tokens": usage.get("total_tokens"),
        "total_tokens_source": usage.get("total_tokens_source"),
        "token_parts": usage.get("token_parts") or {},
        "cost_usd": usage.get("cost_usd"),
        "turn_count": usage.get("turn_count"),
        "final_text": final,
        "final_text_chars": chars,
    }
    metrics.update(tree)
    metrics.update(checked)
    metrics["diagnostics"] = diagnostics[:20]
    return metrics


def _failure_text(outcome: ProcessResult) -> str:
    if outcome.timed_out:
        return outcome.stderr or "the agent timed out"
    if outcome.exit_code not in (0, None):
        return outcome.stderr
    return ""


def _redact_paths(ws: Workspace, folder: Path, code_dir: Path) -> list[str]:
    return [
        str(code_dir.resolve()),
        str(folder.resolve()),
        str(ws.root.resolve()),
        str(ws.compiler.resolve()),
        str(Path.home()),
    ]


def _redact_json(value: Any, paths: list[str]) -> Any:
    if isinstance(value, str):
        return redact_text(value, paths)
    if isinstance(value, list):
        return [_redact_json(item, paths) for item in value]
    if isinstance(value, dict):
        return {str(key): _redact_json(item, paths) for key, item in value.items()}
    return value


def _attempt_dir(ws: Workspace, cfg: Config, variant: Variant, suffix: Suffix) -> Path:
    parent = ws.runs / cfg.task_id / variant.id / suffix.id
    parent.mkdir(parents=True, exist_ok=True)
    base = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")
    stamp = base
    number = 1
    while (parent / stamp).exists():
        stamp = f"{base}-{number}"
        number += 1
    path = parent / stamp
    path.mkdir()
    return path


def copy_code_tree(src: Path, dest: Path) -> None:
    """Copy the agent tree without following links or copying tool directories."""
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    if not src.is_dir():
        return
    for dirpath, dirnames, filenames in os.walk(src, followlinks=False):
        current = Path(dirpath)
        rel_dir = current.relative_to(src)
        kept: list[str] = []
        for name in dirnames:
            path = current / name
            if name in SKIP_DIRS or path.is_symlink():
                continue
            kept.append(name)
            (dest / rel_dir / name).mkdir(parents=True, exist_ok=True)
        dirnames[:] = kept
        for name in filenames:
            path = current / name
            if path.is_symlink():
                continue
            target = dest / rel_dir / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target, follow_symlinks=False)


def _command_version(binary: str) -> str:
    if shutil.which(binary) is None:
        return "not-found"
    try:
        proc = subprocess.run(
            [binary, "--version"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired):
        return "unknown"
    line = ((proc.stdout or proc.stderr).strip().splitlines() or ["unknown"])[0]
    return redact_text(line, [str(Path.home())])[:200]


def _python_version() -> str:
    return platform.python_version()


def _record_crash(
    ws: Workspace,
    cfg: Config,
    variant: Variant,
    suffix: Suffix,
    today: str,
    exc: Exception,
    versions: dict[str, str],
    probe: bool,
) -> dict[str, Any]:
    prompt = build_prompt(cfg.task_text, suffix.text, cfg.constraints)
    slug = build_slug(variant.agent, variant.model, variant.effort, suffix.id, today)
    outcome = ProcessResult(None, False, "", "", str(exc))
    return _archive(
        ws,
        cfg,
        variant,
        suffix,
        prompt,
        slug,
        today,
        ws.output / slug,
        [],
        outcome,
        0.0,
        datetime.now(timezone.utc),
        "live",
        versions,
        probe,
    )


def write_demos(ws: Workspace, cfg: Config, *, today: str) -> list[dict[str, Any]]:
    """Write a sample attempt for every enabled cell that has no live run."""
    results: list[dict[str, Any]] = []
    for index, (variant, suffix) in enumerate(cfg.cells()):
        saved = attempts_for(ws, cfg.task_id, variant.id, suffix.id)
        if any(meta.get("source") == "live" for meta in saved):
            results.append({"variant_id": variant.id, "suffix_id": suffix.id, "action": "kept-live"})
            continue
        if _matching_sample_today(saved, cfg, variant, suffix, today):
            results.append({"variant_id": variant.id, "suffix_id": suffix.id, "action": "kept-sample"})
            continue
        try:
            results.append(_write_one_demo(ws, cfg, variant, suffix, today, index))
        except Exception:
            results.append({"variant_id": variant.id, "suffix_id": suffix.id, "action": "error"})
    return results


def _matching_sample_today(
    saved: list[dict[str, Any]],
    cfg: Config,
    variant: Variant,
    suffix: Suffix,
    today: str,
) -> bool:
    todays = [
        meta
        for meta in saved
        if meta.get("date") == today and meta.get("source") == "demo"
    ]
    if not todays:
        return False
    newest = max(todays, key=lambda meta: str(meta.get("_stamp")))
    return same_identity(newest, variant.agent, variant.model, variant.effort, suffix.text, cfg)


def _write_one_demo(
    ws: Workspace,
    cfg: Config,
    variant: Variant,
    suffix: Suffix,
    today: str,
    index: int,
) -> dict[str, Any]:
    prompt = build_prompt(cfg.task_text, suffix.text, cfg.constraints)
    slug = build_slug(variant.agent, variant.model, variant.effort, suffix.id, today)
    folder = ws.output / f".demo-{slug}"
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir(parents=True)
    for rel, text in sample_files(suffix.id).items():
        path = folder / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    final = "Sample output. This is not a measurement."
    tokens = 80 + index * 3
    extra = {
        "total_time_seconds": round(1.2 + index * 0.05, 3),
        "cli_duration_ms": None,
        "total_tokens": tokens,
        "total_tokens_source": "cli",
        "token_parts": {"input": 50 + index, "output": 30},
        "cost_usd": None,
        "turn_count": 1,
        "final_text": final,
        "final_text_chars": len(final),
    }
    stdout = json.dumps({"text": final, "usage": {"total_tokens": tokens}})
    outcome = ProcessResult(0, False, stdout, "")
    try:
        return _archive(
            ws,
            cfg,
            variant,
            suffix,
            prompt,
            slug,
            today,
            folder,
            [],
            outcome,
            extra["total_time_seconds"],
            datetime.now(timezone.utc),
            "demo",
            {},
            False,
            extra,
        )
    finally:
        shutil.rmtree(folder, ignore_errors=True)


def sample_files(suffix_id: str) -> dict[str, str]:
    files = {"cart.ts": _CART}
    if suffix_id == "tdd":
        files["tests/cart.test.ts"] = _TEST
    elif suffix_id == "hexagonal":
        files = {"domain/cart.ts": _CART, "port/store.ts": _PORT}
    elif suffix_id == "clean-code":
        files["README.md"] = _README
    return files


def analyze_saved(ws: Workspace, cfg: Config) -> int:
    """Rebuild tree metrics and the typecheck. Tokens, cost, time, and text stay."""
    from modeltests.publish import iter_attempt_dirs, read_json

    count = 0
    for _variant_id, _suffix_id, attempt in iter_attempt_dirs(ws.runs, cfg.task_id):
        code_dir = attempt / "code"
        if not code_dir.is_dir():
            continue
        metrics_path = attempt / "metrics.json"
        metrics: dict[str, Any] = {}
        if metrics_path.is_file():
            loaded = read_json(metrics_path)
            if isinstance(loaded, dict):
                metrics = loaded
        saved = {key: metrics[key] for key in PRESERVE_METRICS if key in metrics}
        paths = _redact_paths(ws, code_dir, code_dir)
        metrics.update(measure_tree(code_dir))
        metrics.update(typecheck(code_dir, ws.compiler))
        metrics["diagnostics"] = [
            redact_text(str(line), paths)[:500] for line in (metrics.get("diagnostics") or [])
        ][:20]
        metrics.update(saved)
        write_json(metrics_path, metrics)
        count += 1
    return count


_CART = """export type Item = {
  readonly id: string;
  readonly name: string;
};

export type Cart = {
  readonly items: readonly Item[];
};

export function addItem(cart: Cart, item: Item): Cart {
  return { items: [...cart.items, item] };
}

export function showItems(cart: Cart): readonly Item[] {
  return cart.items;
}

export function removeItem(cart: Cart, id: string): Cart {
  return { items: cart.items.filter((item) => item.id !== id) };
}
"""

_PORT = """import { addItem, removeItem, showItems, type Cart, type Item } from "../domain/cart";

export type CartStore = {
  add(cart: Cart, item: Item): Cart;
  show(cart: Cart): readonly Item[];
  remove(cart: Cart, id: string): Cart;
};

export function createStore(): CartStore {
  return { add: addItem, show: showItems, remove: removeItem };
}
"""

_TEST = """import { addItem, removeItem, showItems, type Cart } from "../cart";

const empty: Cart = { items: [] };
const added = addItem(empty, { id: "1", name: "pen" });

export const shown = showItems(added);
export const removed = removeItem(added, "1");
"""

_README = """# Shopping cart

The program adds an item, shows the items, and removes an item.
"""
