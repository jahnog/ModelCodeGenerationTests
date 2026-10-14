"""Measure a code tree, redact text, and classify a TypeScript check."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

SKIP_DIRS = {".git", "node_modules", "dist", ".grok", ".claude", ".cursor"}
NAME_WORDS = (
    "domain",
    "application",
    "infrastructure",
    "port",
    "adapter",
    "entity",
    "usecase",
    "use-case",
    "command",
    "query",
    "event",
)
SCAN_WORDS = ("function", "class", "interface", "type", "enum")
SOURCE_SUFFIXES = {".ts", ".tsx", ".js", ".mjs", ".cjs"}
IMPORT_RE = re.compile(
    r"""(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]"""
)
SCAN_RE = {word: re.compile(rf"\b{word}\b") for word in SCAN_WORDS}

# Needles are concatenated so this file does not contain an assembled prefix.
def secret_prefixes() -> tuple[str, ...]:
    return ("sk" + "-", "ghp" + "_", "github" + "_pat_", "xai" + "-", "AK" + "IA")


def path_markers() -> tuple[str, ...]:
    return ("/" + "home/", "/" + "Users/", "/" + "mnt/")


_KEY_RE = re.compile(
    "-----BEGIN [A-Z ]*"
    + "PRIVATE KEY-----"
    + r"[\s\S]*?-----END [A-Z ]*"
    + "PRIVATE KEY-----"
)
_BEARER_RE = re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._~+/=-]{8,}")


def redact_text(text: str, extra_paths: list[str] | None = None) -> str:
    """Remove secrets and absolute locations from text that may be published."""
    cleaned = _KEY_RE.sub("[redacted-private-key]", text)
    cleaned = _BEARER_RE.sub("Bearer [redacted]", cleaned)
    for prefix in secret_prefixes():
        cleaned = re.sub(
            re.escape(prefix) + r"[A-Za-z0-9_\-]{4,}",
            "[redacted]",
            cleaned,
        )
    paths = [path for path in (extra_paths or []) if path]
    for path in sorted(paths, key=len, reverse=True):
        cleaned = cleaned.replace(path.rstrip("/") + "/", "")
        cleaned = cleaned.replace(path, "")
    for marker in path_markers():
        cleaned = re.sub(re.escape(marker) + r"\S*", "[redacted-path]", cleaned)
    return cleaned


def findings(text: str, extra_paths: list[str] | None = None) -> list[str]:
    found: list[str] = []
    if _KEY_RE.search(text):
        found.append("private key")
    if _BEARER_RE.search(text):
        found.append("bearer token")
    if any(prefix in text for prefix in secret_prefixes()):
        found.append("api key")
    if any(marker in text for marker in path_markers()):
        found.append("home path")
    if any(path and path in text for path in (extra_paths or [])):
        found.append("local path")
    return found


def _walk(root: Path):
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        current = Path(dirpath)
        dirnames[:] = [
            name
            for name in dirnames
            if name not in SKIP_DIRS and not (current / name).is_symlink()
        ]
        yield current, list(dirnames), filenames


def is_test_path(rel: Path) -> bool:
    name = rel.name.lower()
    if ".test." in name or ".spec." in name:
        return True
    return any(part in {"test", "tests", "__tests__"} for part in rel.parts)


def is_secret_name(name: str) -> bool:
    lower = name.lower()
    if lower == ".env" or lower.startswith(".env."):
        return True
    if lower.endswith(".pem") or lower.endswith(".key"):
        return True
    return name in {"id_rsa", "id_ed25519", "credentials.json"}


def is_web_name(name: str) -> bool:
    return Path(name).suffix.lower() in {".html", ".htm", ".svg", ".xhtml"}


def omission_reason(rel: str, size: int, is_link: bool) -> str | None:
    if is_link:
        return "symlink"
    if rel.startswith("/") or "\\" in rel or ".." in Path(rel).parts:
        return "escape"
    name = Path(rel).name
    if is_secret_name(name):
        return "secret"
    if is_web_name(name):
        return "web"
    if size > 200_000:
        return "size"
    return None


def classify_path(rel: Path) -> str:
    name = rel.name.lower()
    if is_test_path(rel):
        return "tests"
    if name.endswith(".md"):
        return "docs"
    if _is_config(rel):
        return "config"
    if rel.suffix.lower() in SOURCE_SUFFIXES:
        return "source"
    return "other"


def _is_config(rel: Path) -> bool:
    name = rel.name.lower()
    if name in {
        "package.json",
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "bun.lock",
        "dockerfile",
        ".gitlab-ci.yml",
    }:
        return True
    if name.startswith("tsconfig") and name.endswith(".json"):
        return True
    if name.startswith("eslint.config") or name.startswith(".eslintrc"):
        return True
    if name.startswith("prettier.config") or name.startswith(".prettierrc"):
        return True
    if ".github" in rel.parts and "workflows" in rel.parts:
        return True
    return False


def names_found(paths: list[str]) -> list[str]:
    found: set[str] = set()
    for path in paths:
        sequences = re.findall(r"[a-z]+", path.lower())
        for index, sequence in enumerate(sequences):
            for word in NAME_WORDS:
                if word == "use-case":
                    continue
                if sequence == word or sequence == word + "s":
                    found.add(word)
            if (
                sequence == "use"
                and index + 1 < len(sequences)
                and sequences[index + 1] == "case"
            ):
                found.add("use-case")
    return [word for word in NAME_WORDS if word in found]


def import_specifiers(text: str) -> list[str]:
    found: list[str] = []
    for match in IMPORT_RE.finditer(text):
        specifier = match.group(1)
        if specifier.startswith(".") or specifier in found:
            continue
        found.append(specifier)
        if len(found) >= 20:
            break
    return found


def _nonblank(text: str) -> int:
    return sum(1 for line in text.splitlines() if line.strip())


def _read_text(path: Path) -> str | None:
    data = path.read_bytes()
    if b"\0" in data:
        return None
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return None


def measure_tree(root: Path) -> dict[str, Any]:
    files: list[Path] = []
    directories: list[Path] = []
    if root.exists():
        for current, dirnames, filenames in _walk(root):
            for name in dirnames:
                directories.append(current / name)
            for name in filenames:
                path = current / name
                if path.is_symlink():
                    continue
                files.append(path)
    groups = {"source": 0, "tests": 0, "docs": 0, "config": 0, "other": 0}
    source_lines = 0
    test_lines = 0
    doc_lines = 0
    scans = {word: 0 for word in SCAN_WORDS}
    imports: list[str] = []
    checklist = {
        "tests": False,
        "readme": False,
        "other_markdown": False,
        "package_json": False,
        "lockfile": False,
        "tsconfig": False,
        "eslint": False,
        "prettier": False,
        "ci": False,
        "dockerfile": False,
    }
    dependencies: set[str] = set()
    dev_dependencies: set[str] = set()
    max_depth = 0
    rel_paths: list[str] = []
    for path in files:
        rel = path.relative_to(root)
        rel_text = rel.as_posix()
        rel_paths.append(rel_text)
        max_depth = max(max_depth, len(rel.parts) - 1)
        group = classify_path(rel)
        groups[group] += 1
        name = rel.name.lower()
        checklist["tests"] = checklist["tests"] or is_test_path(rel)
        checklist["readme"] = checklist["readme"] or name == "readme.md"
        checklist["other_markdown"] = checklist["other_markdown"] or (
            name.endswith(".md") and name != "readme.md"
        )
        checklist["package_json"] = checklist["package_json"] or name == "package.json"
        checklist["lockfile"] = checklist["lockfile"] or name in {
            "package-lock.json",
            "pnpm-lock.yaml",
            "yarn.lock",
            "bun.lock",
        }
        checklist["tsconfig"] = checklist["tsconfig"] or (
            name.startswith("tsconfig") and name.endswith(".json")
        )
        checklist["eslint"] = checklist["eslint"] or name.startswith(("eslint.config", ".eslintrc"))
        checklist["prettier"] = checklist["prettier"] or name.startswith(
            ("prettier.config", ".prettierrc")
        )
        checklist["dockerfile"] = checklist["dockerfile"] or name == "dockerfile"
        checklist["ci"] = checklist["ci"] or name == ".gitlab-ci.yml" or (
            ".github" in rel.parts and "workflows" in rel.parts
        )
        text = _read_text(path)
        if text is None:
            continue
        lines = _nonblank(text)
        if group == "source":
            source_lines += lines
            if rel.suffix.lower() == ".ts":
                for word, pattern in SCAN_RE.items():
                    scans[word] += len(pattern.findall(text))
        elif group == "tests":
            test_lines += lines
        elif group == "docs":
            doc_lines += lines
        if rel.suffix.lower() in {".ts", ".tsx", ".js"} and len(imports) < 20:
            for specifier in import_specifiers(text):
                if specifier not in imports:
                    imports.append(specifier)
                if len(imports) >= 20:
                    break
        if name == "package.json":
            deps, dev = _dependencies(text)
            dependencies.update(deps)
            dev_dependencies.update(dev)
    for directory in directories:
        rel = directory.relative_to(root)
        rel_paths.append(rel.as_posix())
        if any(part in {"test", "tests"} for part in rel.parts):
            checklist["tests"] = True
    top = sorted(path.name for path in directories if path.parent == root)[:20]
    return {
        "file_count": len(files),
        "directory_count": len(directories),
        "max_depth": max_depth,
        "source_lines": source_lines,
        "test_lines": test_lines,
        "doc_lines": doc_lines,
        "groups": groups,
        "scans": scans,
        "checklist": checklist,
        "dependencies": sorted(dependencies),
        "dev_dependencies": sorted(dev_dependencies),
        "top_dirs": top,
        "names_found": names_found(rel_paths),
        "imports": imports,
    }


def _dependencies(text: str) -> tuple[list[str], list[str]]:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return [], []
    if not isinstance(data, dict):
        return [], []

    def names(key: str) -> list[str]:
        value = data.get(key)
        if isinstance(value, dict):
            return [str(name) for name in value]
        return []

    return names("dependencies"), names("devDependencies")


def compiler_options(compiler_dir: Path) -> list[str]:
    path = compiler_dir / "tsconfig.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        options = data.get("compilerOptions", {})
    except (OSError, json.JSONDecodeError):
        return []
    if not isinstance(options, dict):
        return []
    rendered: list[str] = []
    for key, value in options.items():
        if isinstance(value, bool):
            rendered.append(key if value else f"{key} false")
        else:
            rendered.append(f"{key} {value}")
    return rendered


def _typescript_files(root: Path) -> tuple[bool, bool]:
    has_ts = False
    has_tsx = False
    if not root.exists():
        return False, False
    for current, _dirnames, filenames in _walk(root):
        for name in filenames:
            path = current / name
            if path.is_symlink():
                continue
            lower = name.lower()
            if lower.endswith(".tsx"):
                has_tsx = True
            elif lower.endswith(".ts") and not lower.endswith(".d.ts"):
                has_ts = True
    return has_ts, has_tsx


def _status_from_exit(started: bool, timed_out: bool, code: int | None) -> str:
    if not started or timed_out or code is None:
        return "error"
    if code == 0:
        return "pass"
    # noEmit reports a type error as exit 1. Exit 2 is the emit-and-diagnose code.
    if code in {1, 2}:
        return "fail"
    return "error"


def typecheck(code_dir: Path, compiler_dir: Path, timeout: int = 60) -> dict[str, Any]:
    version = _pinned_version(compiler_dir)
    options = compiler_options(compiler_dir)
    has_ts, has_tsx = _typescript_files(code_dir)
    base = {
        "compile_status": "no-typescript",
        "compile_error_count": 0,
        "compile_seconds": 0.0,
        "typescript_version": version,
        "diagnostics": [],
        "compiler_options": options,
    }
    if not has_ts and not has_tsx:
        return base
    if not has_ts and has_tsx:
        base["compile_status"] = "fail"
        base["diagnostics"] = ["A .tsx file is present."]
        base["compile_error_count"] = 1
        return base
    started_at = time.perf_counter()
    outcome = _run_tsc(code_dir, compiler_dir, timeout)
    elapsed = time.perf_counter() - started_at
    status = _status_from_exit(outcome["started"], outcome["timed_out"], outcome["code"])
    text = redact_text(
        outcome["output"],
        [str(code_dir.resolve()), str(compiler_dir.resolve()), outcome["config_path"]],
    )
    diagnostic_lines = [
        line.strip()
        for line in text.splitlines()
        if "error TS" in line or ": error " in line
    ]
    if not diagnostic_lines:
        diagnostic_lines = [line.strip() for line in text.splitlines() if line.strip()]
    diagnostics = [line[:500] for line in diagnostic_lines[:20]]
    error_count = text.count("error TS")
    if has_tsx and status in {"pass", "no-typescript"}:
        status = "fail"
        diagnostics = ["A .tsx file is present.", *diagnostics][:20]
        error_count = max(error_count, 1)
    if status == "fail" and error_count == 0:
        error_count = len(diagnostics) or 1
    return {
        "compile_status": status,
        "compile_error_count": error_count,
        "compile_seconds": round(elapsed, 3),
        "typescript_version": version,
        "diagnostics": diagnostics,
        "compiler_options": options,
    }


def _pinned_version(compiler_dir: Path) -> str:
    try:
        data = json.loads((compiler_dir / "package.json").read_text(encoding="utf-8"))
        version = data["dependencies"]["typescript"]
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return ""
    return version if isinstance(version, str) else ""


def _run_tsc(code_dir: Path, compiler_dir: Path, timeout: int) -> dict[str, Any]:
    tsc_js = compiler_dir / "node_modules" / "typescript" / "lib" / "tsc.js"
    node = shutil.which("node")
    result: dict[str, Any] = {
        "started": False,
        "timed_out": False,
        "code": None,
        "output": "",
        "config_path": "",
    }
    if node is None or not tsc_js.is_file():
        result["output"] = "tsc did not start"
        return result
    temp = Path(tempfile.mkdtemp(prefix="modeltests-tsc-"))
    config_path = temp / "tsconfig.json"
    result["config_path"] = str(config_path)
    include = str(code_dir.resolve())
    config_path.write_text(
        json.dumps(
            {
                "extends": str((compiler_dir / "tsconfig.json").resolve()),
                "include": [include + "/**/*.ts"],
                "exclude": [
                    include + "/**/*.d.ts",
                    include + "/**/node_modules/**",
                    include + "/**/dist/**",
                    include + "/**/.git/**",
                ],
            }
        ),
        encoding="utf-8",
    )
    try:
        proc = subprocess.Popen(
            [node, str(tsc_js), "-p", str(config_path), "--pretty", "false", "--noEmit"],
            cwd=code_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            start_new_session=True,
        )
        result["started"] = True
        try:
            out, err = proc.communicate(timeout=timeout)
        except subprocess.TimeoutExpired:
            result["timed_out"] = True
            os.killpg(proc.pid, 15)
            try:
                out, err = proc.communicate(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(proc.pid, 9)
                out, err = proc.communicate()
        result["code"] = proc.returncode
        result["output"] = (out or "") + (err or "")
    except OSError as exc:
        result["started"] = False
        result["output"] = str(exc)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    return result
