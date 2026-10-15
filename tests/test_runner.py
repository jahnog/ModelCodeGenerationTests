import json
import subprocess
from pathlib import Path

import pytest

from modeltests.config import Variant
from modeltests.publish import publish_site, read_json
from modeltests.runner import (
    ProcessResult,
    analyze_saved,
    argv_for,
    execute_agent,
    plan_cells,
    run_cells,
    sample_files,
    write_demos,
)

from support import add_attempt, load_project


def _fake_check(code_dir: Path, _compiler: Path, timeout: int = 60) -> dict:
    return {
        "compile_status": "pass",
        "compile_error_count": 0,
        "compile_seconds": 30,
        "typescript_version": "7.0.2",
        "diagnostics": [str(code_dir / "cart.ts") + "(1,1): error TS2322: no"],
        "compiler_options": ["strict"],
    }


def test_agent_filter_drops_a_disabled_agent(tmp_path):
    _ws, cfg = load_project(tmp_path)
    matched = plan_cells(cfg, agent="grok")
    assert matched
    assert {variant.agent for variant, _suffix in matched} == {"grok"}
    assert plan_cells(cfg, agent="claude") == []


def test_unknown_agent_is_rejected():
    variant = Variant("other", "other", "Other", "model", "medium", True)
    with pytest.raises(ValueError, match="unknown agent"):
        argv_for(variant, "prompt", Path("."))


def test_missing_agent_is_a_result_not_a_timeout(tmp_path):
    result = execute_agent(["modeltests-missing-agent-bin"], tmp_path, 5)
    assert result.timed_out is False
    assert result.exit_code is None
    assert "modeltests-missing-agent-bin" in result.error_text


def test_argv_passes_effort_only_for_grok_and_claude(tmp_path):
    folder = tmp_path / "output-code" / "slug"
    grok = Variant("grok-medium", "grok", "Grok Build", "grok-4.7", "medium", True)
    claude = Variant("claude-medium", "claude", "Claude Code", "opus", "medium", True)
    cursor = Variant("cursor-composer", "cursor", "Cursor Agent", "composer-2.5", "default", True)
    grok_argv = argv_for(grok, "prompt", folder)
    claude_argv = argv_for(claude, "prompt", folder)
    cursor_argv = argv_for(cursor, "prompt", folder)
    assert "--effort" in grok_argv and "medium" in grok_argv and "--no-plan" in grok_argv
    assert "--effort" in claude_argv and "--dangerously-skip-permissions" in claude_argv
    assert "--effort" not in cursor_argv
    assert "composer-2.5" in cursor_argv
    assert not any(str(item).startswith("[effort=") for item in cursor_argv)


def test_run_archives_code_redacts_logs_and_skips_a_fresh_cell(tmp_path, monkeypatch):
    monkeypatch.setattr("modeltests.runner.typecheck", _fake_check)
    ws, cfg = load_project(tmp_path)
    calls = {"count": 0}
    secret = ("sk" + "-") + "abcd"

    def execute(argv, cwd, timeout):
        calls["count"] += 1
        (cwd / "cart.ts").write_text("export const answer = 1;\n", encoding="utf-8")
        (cwd / "node_modules").mkdir()
        (cwd / "node_modules" / "pkg.js").write_text("export const hidden = 1;\n", encoding="utf-8")
        (cwd / "link.ts").symlink_to("cart.ts")
        payload = {
            "text": "see " + secret,
            "usage": {"input_tokens": 2, "output_tokens": 3},
            "total_cost_usd": 0.2,
            "num_turns": 1,
            "model": "grok-4.7",
        }
        return ProcessResult(0, False, json.dumps(payload), str(ws.root) + "\n")

    cells = plan_cells(cfg, variant="grok-medium", suffix="none")
    results = run_cells(ws, cfg, cells, today="2026-10-14", execute=execute)
    assert results[0]["action"] == "saved"
    assert calls["count"] == 1
    attempt = Path(results[0]["attempt"])
    assert (attempt / "code" / "cart.ts").is_file()
    assert not (attempt / "code" / "node_modules").exists()
    assert not (attempt / "code" / "link.ts").exists()
    metrics = read_json(attempt / "metrics.json")
    assert metrics["total_tokens"] == 5
    assert metrics["total_tokens_source"] == "summed_parts"
    assert metrics["cost_usd"] == 0.2
    assert metrics["compile_seconds"] == 30
    assert metrics["total_time_seconds"] < 5
    assert secret not in (attempt / "stdout.log").read_text(encoding="utf-8")
    assert str(ws.root) not in (attempt / "stderr.log").read_text(encoding="utf-8")
    assert str(attempt / "code") not in json.dumps(metrics["diagnostics"])
    slug = ws.output / results[0]["slug"]
    email = subprocess.check_output(
        ["git", "config", "--local", "user.email"],
        cwd=slug,
        text=True,
    ).strip()
    assert email == "modeltests@example.com"
    assert not (slug / "AGENTS.md").exists()

    again = run_cells(ws, cfg, cells, today="2026-10-14", execute=execute)
    assert again[0]["action"] == "skipped"
    assert calls["count"] == 1
    forced = run_cells(ws, cfg, cells, force=True, today="2026-10-14", execute=execute)
    assert forced[0]["action"] == "saved"
    assert calls["count"] == 2


def test_timeout_kills_the_process_group():
    result = execute_agent(["sleep", "30"], Path("."), 1)
    assert result.timed_out is True


def test_demo_skips_live_runs_and_a_matching_sample(tmp_path, monkeypatch):
    monkeypatch.setattr("modeltests.runner.typecheck", _fake_check)
    ws, cfg = load_project(tmp_path)
    add_attempt(ws, cfg, day="2020-01-01", stamp="2020-01-01T00-00-00Z", suffix_id="simple")
    first = write_demos(ws, cfg, today="2026-10-14")
    assert any(item["suffix_id"] == "simple" and item["action"] == "kept-live" for item in first)
    assert any(item["suffix_id"] == "none" and item["action"] == "saved" for item in first)
    assert (ws.runs / cfg.task_id / "grok-medium" / "simple" / "2020-01-01T00-00-00Z" / "code" / "cart.ts").is_file()
    second = write_demos(ws, cfg, today="2026-10-14")
    assert any(item["suffix_id"] == "none" and item["action"] == "kept-sample" for item in second)
    none_dir = ws.runs / cfg.task_id / "grok-medium" / "none"
    assert len([path for path in none_dir.iterdir() if path.is_dir()]) == 1
    matrix = publish_site(ws, cfg, today="2026-10-14")
    sample = next(item for item in matrix["cells"] if item["suffix_id"] == "none")
    assert sample["sample"] is True
    assert sample["cost_usd"] is None


def test_sample_program_typechecks(tmp_path):
    ws, cfg = load_project(tmp_path, link_compiler=True)
    from modeltests.config import load_config, workspace_from_config
    from support import config_text, write_project

    text = config_text(
        """
variants:
  - id: grok-medium
    agent: grok
    label: Grok Build
    model: grok-4.7
    effort: medium
suffixes:
  - id: hexagonal
    family: architecture
    label: Hexagonal
    text: "follow hexagonal architecture."
  - id: tdd
    family: principles
    label: TDD
    text: "use test-driven development."
"""
    )
    config = write_project(tmp_path / "real", text, link_compiler=True)
    real_ws = workspace_from_config(str(config))
    real_cfg = load_config(real_ws.config_path, real_ws.root)
    write_demos(real_ws, real_cfg, today="2026-10-14")
    for suffix_id in ("hexagonal", "tdd"):
        attempt = next((real_ws.runs / real_cfg.task_id / "grok-medium" / suffix_id).iterdir())
        metrics = read_json(attempt / "metrics.json")
        assert metrics["compile_status"] == "pass"
        assert metrics["cost_usd"] is None
        assert "compile_seconds" in metrics
        assert metrics["total_time_seconds"] < 30
    hexagonal = next((real_ws.runs / real_cfg.task_id / "grok-medium" / "hexagonal").iterdir())
    assert "domain" in read_json(hexagonal / "metrics.json")["names_found"]
    assert "port" in read_json(hexagonal / "metrics.json")["names_found"]
    assert "domain/cart.ts" in sample_files("hexagonal")
    assert ws.root != real_ws.root


def test_analyze_preserves_tokens_and_leaves_docs(tmp_path, monkeypatch):
    monkeypatch.setattr("modeltests.runner.typecheck", _fake_check)
    ws, cfg = load_project(tmp_path)
    add_attempt(
        ws,
        cfg,
        files={"cart.ts": "export const answer = 1;\n"},
        metrics={
            "total_time_seconds": 4,
            "total_tokens": 10,
            "total_tokens_source": "cli",
            "cost_usd": 0.5,
            "turn_count": 3,
            "final_text": "kept",
            "final_text_chars": 4,
            "source_lines": 999,
            "compile_status": "no-typescript",
            "diagnostics": [],
        },
    )
    ws.output.mkdir(exist_ok=True)
    (ws.output / "ignored.ts").write_text("export const ignored = 1;\n", encoding="utf-8")
    (ws.docs / "data").mkdir()
    (ws.docs / "data" / "matrix.json").write_text("{}\n", encoding="utf-8")
    assert analyze_saved(ws, cfg) == 1
    metrics = read_json(next((ws.runs / cfg.task_id / "grok-medium" / "none").iterdir()) / "metrics.json")
    assert metrics["total_tokens"] == 10
    assert metrics["cost_usd"] == 0.5
    assert metrics["total_time_seconds"] == 4
    assert metrics["final_text_chars"] == 4
    assert metrics["source_lines"] == 1
    assert metrics["compile_seconds"] == 30
    assert (ws.docs / "data" / "matrix.json").read_text(encoding="utf-8") == "{}\n"
