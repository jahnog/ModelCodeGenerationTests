"""Build the static site in docs/ from saved attempts."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from datetime import date
from pathlib import Path
from typing import Any

from modeltests.analyze import (
    classify_path,
    findings,
    omission_reason,
    redact_text,
)
from modeltests.config import Config, Workspace

FILE_CAP = 200


class PublishError(Exception):
    pass


def local_today() -> str:
    return date.today().isoformat()


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def iter_attempt_dirs(runs: Path, task_id: str):
    root = runs / task_id
    if not root.is_dir():
        return
    for variant_dir in sorted(path for path in root.iterdir() if path.is_dir()):
        for suffix_dir in sorted(path for path in variant_dir.iterdir() if path.is_dir()):
            for attempt in sorted(path for path in suffix_dir.iterdir() if path.is_dir()):
                yield variant_dir.name, suffix_dir.name, attempt


def load_attempt(path: Path, variant_id: str, suffix_id: str) -> dict[str, Any] | None:
    meta_path = path / "meta.json"
    if not meta_path.is_file():
        return None
    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(meta, dict):
        return None
    metrics_path = path / "metrics.json"
    metrics: dict[str, Any] = {}
    if metrics_path.is_file():
        try:
            loaded = json.loads(metrics_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            loaded = {}
        if isinstance(loaded, dict):
            metrics = loaded
    prompt_path = path / "prompt.txt"
    prompt = ""
    if prompt_path.is_file():
        prompt = prompt_path.read_text(encoding="utf-8")
    meta["_path"] = path
    meta["_metrics"] = metrics
    meta["_prompt"] = prompt
    meta["_stamp"] = path.name
    meta.setdefault("variant_id", variant_id)
    meta.setdefault("suffix_id", suffix_id)
    return meta


def attempts_for(ws: Workspace, task_id: str, variant_id: str, suffix_id: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    root = ws.runs / task_id / variant_id / suffix_id
    if not root.is_dir():
        return found
    for path in sorted(item for item in root.iterdir() if item.is_dir()):
        loaded = load_attempt(path, variant_id, suffix_id)
        if loaded is not None:
            found.append(loaded)
    return found


def same_identity(
    meta: dict[str, Any],
    variant_agent: str,
    model: str,
    effort: str,
    suffix_text: str,
    cfg: Config,
) -> bool:
    return (
        meta.get("agent") == variant_agent
        and meta.get("model") == model
        and meta.get("effort") == effort
        and meta.get("task_text") == cfg.task_text
        and meta.get("constraints_text") == cfg.constraints
        and meta.get("suffix_text") == suffix_text
    )


def matches_config(
    meta: dict[str, Any],
    cfg: Config,
    variant_agent: str,
    model: str,
    effort: str,
    suffix_text: str,
) -> bool:
    return same_identity(meta, variant_agent, model, effort, suffix_text, cfg)


def is_fresh(
    meta: dict[str, Any],
    cfg: Config,
    variant_agent: str,
    model: str,
    effort: str,
    suffix_text: str,
    today: str,
) -> bool:
    """A live attempt from today whose instructions still match the config."""
    if meta.get("source") != "live" or meta.get("date") != today:
        return False
    return matches_config(meta, cfg, variant_agent, model, effort, suffix_text)


def is_stale(
    meta: dict[str, Any],
    cfg: Config,
    variant_agent: str,
    model: str,
    effort: str,
    suffix_text: str,
    today: str,
) -> bool:
    if meta.get("source") != "live" or meta.get("date") != today:
        return False
    return not matches_config(meta, cfg, variant_agent, model, effort, suffix_text)


def attempt_status(meta: dict[str, Any]) -> str:
    if meta.get("timed_out"):
        return "timeout"
    if meta.get("exit_code") == 0:
        return "complete"
    return "error"


def choose_attempts(ws: Workspace, cfg: Config) -> list[dict[str, Any]]:
    """One attempt per enabled cell per day. A live attempt wins over a sample that day."""
    variants = {item.id: item for item in cfg.enabled_variants()}
    suffixes = {item.id: item for item in cfg.enabled_suffixes()}
    grouped: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for variant_id, suffix_id, path in iter_attempt_dirs(ws.runs, cfg.task_id):
        variant = variants.get(variant_id)
        suffix = suffixes.get(suffix_id)
        if variant is None or suffix is None:
            continue
        meta = load_attempt(path, variant_id, suffix_id)
        if meta is None or not (path / "code").is_dir():
            continue
        if (
            meta.get("agent") != variant.agent
            or meta.get("model") != variant.model
            or meta.get("effort") != variant.effort
        ):
            continue
        day = str(meta.get("date") or "")
        if not day:
            continue
        grouped.setdefault((variant_id, suffix_id, day), []).append(meta)
    chosen: list[dict[str, Any]] = []
    for bucket in grouped.values():
        live = [item for item in bucket if item.get("source") != "demo"]
        pool = live or bucket
        chosen.append(max(pool, key=lambda item: str(item.get("_stamp"))))
    chosen.sort(key=lambda item: (str(item.get("variant_id")), str(item.get("suffix_id")), str(item.get("date"))))
    return chosen


def select_files(entries: list[tuple[str, int, bool]]) -> tuple[list[str], dict[str, int]]:
    counts = {"size": 0, "symlink": 0, "secret": 0, "web": 0, "count": 0}
    chosen: list[str] = []
    for rel, size, is_link in sorted(entries, key=lambda item: item[0]):
        reason = omission_reason(rel, size, is_link)
        if reason == "escape":
            continue
        if reason:
            counts[reason] += 1
            continue
        if len(chosen) >= FILE_CAP:
            counts["count"] += 1
            continue
        chosen.append(rel)
    return chosen, counts


def _file_entries(code_dir: Path) -> list[tuple[str, int, bool]]:
    entries: list[tuple[str, int, bool]] = []
    if not code_dir.is_dir():
        return entries
    for dirpath, dirnames, filenames in os.walk(code_dir, followlinks=False):
        current = Path(dirpath)
        kept: list[str] = []
        for name in dirnames:
            path = current / name
            if path.is_symlink():
                rel = path.relative_to(code_dir).as_posix()
                entries.append((rel, 0, True))
            else:
                kept.append(name)
        dirnames[:] = kept
        for name in filenames:
            path = current / name
            rel = path.relative_to(code_dir).as_posix()
            if path.is_symlink():
                entries.append((rel, 0, True))
                continue
            entries.append((rel, path.stat().st_size, False))
    return entries


def _is_text(path: Path) -> bool:
    data = path.read_bytes()
    if b"\0" in data:
        return False
    try:
        data.decode("utf-8")
    except UnicodeDecodeError:
        return False
    return True


def _scrub_paths(ws: Workspace, code_dir: Path) -> list[str]:
    return [str(code_dir.resolve()), str(ws.root.resolve()), str(Path.home())]


def _summary(meta: dict[str, Any], metrics: dict[str, Any], stale: bool) -> dict[str, Any]:
    checklist = metrics.get("checklist") if isinstance(metrics.get("checklist"), dict) else {}
    return {
        "slug": meta.get("slug"),
        "variant_id": meta.get("variant_id"),
        "suffix_id": meta.get("suffix_id"),
        "date": meta.get("date"),
        "sample": meta.get("source") == "demo",
        "stale": stale,
        "status": attempt_status(meta),
        "total_time_seconds": metrics.get("total_time_seconds"),
        "total_tokens": metrics.get("total_tokens"),
        "total_tokens_source": metrics.get("total_tokens_source"),
        "cost_usd": metrics.get("cost_usd"),
        "source_lines": metrics.get("source_lines"),
        "compile_status": metrics.get("compile_status"),
        "tests": bool(checklist.get("tests")),
        "docs": bool(checklist.get("readme") or checklist.get("other_markdown")),
    }


def _cell(
    meta: dict[str, Any],
    metrics: dict[str, Any],
    cfg: Config,
    variant_label: str,
    suffix_label: str,
    family: str,
    stale: bool,
    prompt: str,
    files: list[dict[str, Any]],
    omitted: dict[str, int],
    paths: list[str],
) -> dict[str, Any]:
    diagnostics = metrics.get("diagnostics")
    if not isinstance(diagnostics, list):
        diagnostics = []
    scrubbed = [redact_text(str(item), paths)[:500] for item in diagnostics[:20]]
    final_text = redact_text(str(metrics.get("final_text") or ""), paths)
    return {
        "slug": meta.get("slug"),
        "variant_id": meta.get("variant_id"),
        "suffix_id": meta.get("suffix_id"),
        "agent": meta.get("agent"),
        "label": variant_label,
        "model": meta.get("model"),
        "effort": meta.get("effort"),
        "reported_model": meta.get("reported_model"),
        "family": family,
        "suffix_label": suffix_label,
        "date": meta.get("date"),
        "sample": meta.get("source") == "demo",
        "stale": stale,
        "status": attempt_status(meta),
        "prompt": redact_text(prompt, paths),
        "final_text": final_text,
        "global_rules_present": bool(meta.get("global_rules_present")),
        "total_time_seconds": metrics.get("total_time_seconds"),
        "cli_duration_ms": metrics.get("cli_duration_ms"),
        "total_tokens": metrics.get("total_tokens"),
        "total_tokens_source": metrics.get("total_tokens_source"),
        "token_parts": metrics.get("token_parts") or {},
        "cost_usd": metrics.get("cost_usd"),
        "turn_count": metrics.get("turn_count"),
        "final_text_chars": metrics.get("final_text_chars"),
        "compile_status": metrics.get("compile_status"),
        "compile_error_count": metrics.get("compile_error_count"),
        "compile_seconds": metrics.get("compile_seconds"),
        "typescript_version": metrics.get("typescript_version"),
        "diagnostics": scrubbed,
        "compiler_options": metrics.get("compiler_options") or [],
        "source_lines": metrics.get("source_lines"),
        "test_lines": metrics.get("test_lines"),
        "doc_lines": metrics.get("doc_lines"),
        "file_count": metrics.get("file_count"),
        "directory_count": metrics.get("directory_count"),
        "max_depth": metrics.get("max_depth"),
        "scans": metrics.get("scans") or {},
        "dependencies": metrics.get("dependencies") or [],
        "dev_dependencies": metrics.get("dev_dependencies") or [],
        "checklist": metrics.get("checklist") or {},
        "top_dirs": metrics.get("top_dirs") or [],
        "names_found": metrics.get("names_found") or [],
        "imports": metrics.get("imports") or [],
        "error_text": redact_text(str(meta.get("error_text") or ""), paths),
        "files": files,
        "omitted": omitted,
    }


def build_site(ws: Workspace, cfg: Config, today: str | None = None) -> tuple[dict[str, Any], dict[str, dict[str, Any]], dict[str, Path]]:
    today = today or local_today()
    variants = {item.id: item for item in cfg.enabled_variants()}
    suffixes = {item.id: item for item in cfg.enabled_suffixes()}
    summaries = []
    cells: dict[str, dict[str, Any]] = {}
    code_dirs: dict[str, Path] = {}
    for meta in choose_attempts(ws, cfg):
        variant = variants[str(meta["variant_id"])]
        suffix = suffixes[str(meta["suffix_id"])]
        metrics = meta["_metrics"]
        stale = is_stale(meta, cfg, variant.agent, variant.model, variant.effort, suffix.text, today)
        code_dir = Path(meta["_path"]) / "code"
        paths = _scrub_paths(ws, code_dir)
        chosen, omitted = select_files(_file_entries(code_dir))
        files = []
        for rel in chosen:
            source = code_dir / rel
            files.append(
                {
                    "path": rel,
                    "bytes": source.stat().st_size,
                    "text": _is_text(source),
                    "group": classify_path(Path(rel)),
                }
            )
        slug = str(meta.get("slug"))
        summaries.append(_summary(meta, metrics, stale))
        cells[slug] = _cell(
            meta,
            metrics,
            cfg,
            variant.label,
            suffix.label,
            suffix.family,
            stale,
            str(meta.get("_prompt") or ""),
            files,
            omitted,
            paths,
        )
        code_dirs[slug] = code_dir
    matrix = {
        "task_id": cfg.task_id,
        "task_text": cfg.task_text.strip(),
        "constraints": cfg.constraints.strip(),
        "variants": [
            {
                "id": item.id,
                "agent": item.agent,
                "label": item.label,
                "model": item.model,
                "effort": item.effort,
            }
            for item in cfg.enabled_variants()
        ],
        "suffixes": [
            {"id": item.id, "family": item.family, "label": item.label}
            for item in cfg.enabled_suffixes()
        ],
        "cells": summaries,
    }
    return matrix, cells, code_dirs


def listed_relative_path(files: list[dict[str, Any]], rel: str) -> bool:
    """True only for a relative path the cell JSON already lists."""
    if not isinstance(rel, str) or not rel or omission_reason(rel, 0, False) == "escape":
        return False
    return any(isinstance(item, dict) and item.get("path") == rel for item in files)


def copy_published_code(code_dir: Path, dest: Path) -> dict[str, int]:
    chosen, omitted = select_files(_file_entries(code_dir))
    dest.mkdir(parents=True, exist_ok=True)
    root = dest.resolve()
    for rel in chosen:
        if omission_reason(rel, 0, False):
            continue
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            target.resolve().relative_to(root)
        except ValueError:
            continue
        shutil.copy2(code_dir / rel, target, follow_symlinks=False)
    return omitted


def scan_files(root: Path, extra_paths: list[str]) -> list[str]:
    errors: list[str] = []
    if not root.exists():
        return errors
    for dirpath, _dirnames, filenames in os.walk(root, followlinks=False):
        for name in filenames:
            path = Path(dirpath) / name
            rel = path.relative_to(root).as_posix()
            if path.is_symlink():
                errors.append(f"{rel}: symlink")
                continue
            text = path.read_bytes().decode("utf-8", errors="replace")
            kinds = findings(text, extra_paths)
            if kinds:
                errors.append(f"{rel}: {kinds[0]}")
    return errors


def _tracked_files(root: Path) -> list[Path]:
    if (root / ".git").is_dir() and shutil.which("git"):
        proc = subprocess.run(
            ["git", "ls-files", "-co", "--exclude-standard", "-z"],
            cwd=root,
            capture_output=True,
        )
        if proc.returncode == 0:
            return [root / part.decode() for part in proc.stdout.split(b"\0") if part]
    ignored = _ignore_prefixes(root)
    found: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        current = Path(dirpath)
        dirnames[:] = [
            name
            for name in dirnames
            if not _ignored(current / name, root, ignored) and name != ".git"
        ]
        for name in filenames:
            path = current / name
            if not _ignored(path, root, ignored):
                found.append(path)
    return found


def _ignore_prefixes(root: Path) -> list[str]:
    path = root / ".gitignore"
    if not path.is_file():
        return []
    prefixes: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        prefixes.append(line.rstrip("/"))
    return prefixes


def _ignored(path: Path, root: Path, prefixes: list[str]) -> bool:
    rel = path.relative_to(root).as_posix()
    for prefix in prefixes:
        if rel == prefix or rel.startswith(prefix + "/"):
            return True
        if prefix.startswith("*.") and rel.endswith(prefix[1:]):
            return True
    return False


def scan_repo(root: Path) -> list[str]:
    errors: list[str] = []
    gitignore = root / ".gitignore"
    try:
        lines = {line.strip() for line in gitignore.read_text(encoding="utf-8").splitlines()}
    except OSError:
        return ["gitignore is missing"]
    for required in ("runs/", "output-code/"):
        if required not in lines:
            errors.append(f"gitignore does not ignore {required}")
    extra = [str(root.resolve()), str(Path.home())]
    for path in _tracked_files(root):
        if not path.is_file() or path.is_symlink():
            continue
        try:
            text = path.read_bytes().decode("utf-8", errors="replace")
        except OSError:
            continue
        kinds = findings(text, extra)
        if kinds:
            errors.append(f"{path.relative_to(root).as_posix()}: {kinds[0]}")
    return errors


def publish_site(ws: Workspace, cfg: Config, today: str | None = None) -> dict[str, Any]:
    """Write docs/data and docs/code. A failed scan leaves the previous site in place."""
    matrix, cells, code_dirs = build_site(ws, cfg, today)
    extra = [str(ws.root.resolve()), str(Path.home())]
    with tempfile.TemporaryDirectory(prefix="modeltests-site-") as temp_name:
        temp = Path(temp_name)
        data = temp / "data"
        code_root = temp / "code"
        code_root.mkdir()
        write_json(data / "matrix.json", matrix)
        for slug, cell in cells.items():
            write_json(data / "cells" / f"{slug}.json", cell)
            copy_published_code(code_dirs[slug], code_root / slug)
        problems = scan_files(temp, extra)
        if problems:
            raise PublishError("publish scan failed: " + "; ".join(problems[:8]))
        _replace(ws.docs / "data", data)
        _replace(ws.docs / "code", code_root)
    return matrix


def _replace(dest: Path, src: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
