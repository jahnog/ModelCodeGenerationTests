import json

import pytest

from modeltests.prompt import build_slug
from modeltests.publish import (
    PublishError,
    attempt_status,
    is_fresh,
    is_stale,
    listed_relative_path,
    publish_site,
    select_files,
)

from support import add_attempt, load_project


def test_timeout_status_wins_over_a_nonzero_exit():
    assert attempt_status({"timed_out": True, "exit_code": 1}) == "timeout"
    assert attempt_status({"timed_out": False, "exit_code": 0}) == "complete"
    assert attempt_status({"exit_code": 1}) == "error"


def test_fresh_compares_agent_model_and_effort(tmp_path):
    _ws, cfg = load_project(tmp_path)
    variant = cfg.enabled_variants()[0]
    suffix = cfg.enabled_suffixes()[0]
    meta = {
        "source": "live",
        "date": "2026-10-14",
        "agent": variant.agent,
        "model": "other-model",
        "effort": variant.effort,
        "task_text": cfg.task_text,
        "constraints_text": cfg.constraints,
        "suffix_text": suffix.text,
    }
    assert is_fresh(meta, cfg, variant.agent, variant.model, variant.effort, suffix.text, "2026-10-14") is False
    meta["model"] = variant.model
    assert is_fresh(meta, cfg, variant.agent, variant.model, variant.effort, suffix.text, "2026-10-14") is True
    meta["source"] = "demo"
    assert is_stale(meta, cfg, variant.agent, variant.model, variant.effort, suffix.text, "2026-10-14") is False


def test_publish_omits_unsafe_files_and_keeps_the_newest_code(tmp_path):
    ws, cfg = load_project(tmp_path)
    variant = cfg.enabled_variants()[0]
    suffix = next(item for item in cfg.suffixes if item.id == "none")
    slug = build_slug(variant.agent, variant.model, variant.effort, suffix.id, "2026-10-14")
    add_attempt(
        ws,
        cfg,
        stamp="2026-10-14T00-00-00Z",
        files={"cart.ts": "export const older = 1;\n"},
    )
    newer = add_attempt(
        ws,
        cfg,
        stamp="2026-10-14T00-00-02Z",
        files={"cart.ts": "export const newer = 1;\n"},
        metrics={
            "total_time_seconds": 2,
            "total_tokens": 20,
            "total_tokens_source": "cli",
            "cost_usd": None,
            "source_lines": 1,
            "compile_status": "pass",
            "diagnostics": [str(ws.root) + "/runs/bad.ts(1,1): error TS2322: no"],
            "checklist": {},
            "final_text": "done",
        },
    )
    code = newer / "code"
    (code / "page.html").write_text("<p>hi</p>\n", encoding="utf-8")
    (code / ".env").write_text("name=value\n", encoding="utf-8")
    (code / "id_rsa").write_text("local\n", encoding="utf-8")
    (code / "big.ts").write_bytes(b"export const big = 1;\n" + b"x" * 200_001)
    (code / "link.ts").symlink_to("cart.ts")
    home_marker = "/" + "home/" + "person"
    metrics_path = newer / "metrics.json"
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    metrics["diagnostics"].append(home_marker + "/x.ts(1,1): error TS2322: no")
    metrics_path.write_text(json.dumps(metrics), encoding="utf-8")
    add_attempt(
        ws,
        cfg,
        stamp="2026-10-14T00-00-03Z",
        source="demo",
        files={"cart.ts": "export const sample = 1;\n"},
    )
    chosen, counts = select_files(
        [("cart.ts", 10, False), ("../secret.ts", 10, False), ("a\\b.ts", 10, False)]
    )
    assert chosen == ["cart.ts"]
    assert counts["secret"] == 0

    matrix = publish_site(ws, cfg, today="2026-10-14")
    copied = (ws.docs / "code" / slug / "cart.ts").read_text(encoding="utf-8")
    assert "newer" in copied
    assert "sample" not in copied
    published = ws.docs / "code" / slug
    assert not (published / "page.html").exists()
    assert not (published / ".env").exists()
    assert not (published / "id_rsa").exists()
    assert not (published / "big.ts").exists()
    assert not (published / "link.ts").exists()
    cell = json.loads((ws.docs / "data" / "cells" / f"{slug}.json").read_text(encoding="utf-8"))
    dumped = json.dumps(cell)
    assert cell["omitted"]["secret"] >= 1
    assert cell["omitted"]["web"] >= 1
    assert cell["omitted"]["size"] >= 1
    assert cell["omitted"]["symlink"] >= 1
    assert "id_rsa" not in dumped
    assert ".env" not in dumped
    assert str(ws.root) not in dumped
    assert home_marker not in dumped
    assert "error TS2322" in dumped
    assert "global_rules_hash" not in cell
    assert "argv" not in cell
    assert cell["cost_usd"] is None
    assert any(item["slug"] == slug and item["sample"] is False for item in matrix["cells"])


def test_failed_scan_leaves_the_previous_site(tmp_path):
    ws, cfg = load_project(tmp_path)
    (ws.docs / "data").mkdir()
    (ws.docs / "data" / "matrix.json").write_text('{"keep": true}\n', encoding="utf-8")
    (ws.docs / "code").mkdir()
    (ws.docs / "code" / "keep.txt").write_text("keep\n", encoding="utf-8")
    secret = ("sk" + "-") + "abcd"
    add_attempt(ws, cfg, files={"cart.ts": 'export const key = "' + secret + '";\n'})
    with pytest.raises(PublishError, match="scan failed"):
        publish_site(ws, cfg, today="2026-10-14")
    assert json.loads((ws.docs / "data" / "matrix.json").read_text(encoding="utf-8"))["keep"] is True
    assert (ws.docs / "code" / "keep.txt").read_text(encoding="utf-8") == "keep\n"
    assert secret not in (ws.docs / "code" / "keep.txt").read_text(encoding="utf-8")


def test_added_config_rows_appear_and_disabled_rows_do_not(tmp_path):
    from support import config_text, write_project
    from modeltests.config import load_config, workspace_from_config

    text = config_text(
        """
variants:
  - id: grok-medium
    agent: grok
    label: Grok Build
    model: grok-4.7
    effort: medium
    enabled: true
  - id: extra-model
    agent: claude
    label: Claude Code
    model: opus
    effort: high
    enabled: true
  - id: paused
    agent: cursor
    label: Cursor Agent
    model: composer-2.5
    effort: default
    enabled: false
suffixes:
  - id: none
    family: baseline
    label: None
    text: ""
  - id: hexagonal
    family: architecture
    label: Hexagonal
    text: "follow hexagonal architecture."
  - id: parked
    family: principles
    label: Parked
    text: "follow solid."
    enabled: false
"""
    )
    config = write_project(tmp_path, text)
    ws = workspace_from_config(str(config))
    cfg = load_config(ws.config_path, ws.root)
    matrix = publish_site(ws, cfg, today="2026-10-14")
    assert [item["id"] for item in matrix["variants"]] == ["grok-medium", "extra-model"]
    assert [item["id"] for item in matrix["suffixes"]] == ["none", "hexagonal"]
    assert [item["family"] for item in matrix["suffixes"]] == ["baseline", "architecture"]
    assert all(item.id != "paused" for item in cfg.enabled_variants())
    assert any(item.id == "paused" for item in cfg.variants)


def test_listed_path_must_be_relative_and_present():
    files = [{"path": "src/cart.ts", "text": True}]
    assert listed_relative_path(files, "src/cart.ts") is True
    assert listed_relative_path(files, "../secret.ts") is False
    assert listed_relative_path(files, "/tmp/cart.ts") is False
    assert listed_relative_path(files, "other.ts") is False


def test_older_day_is_not_stale_and_a_changed_model_drops_off(tmp_path):
    ws, cfg = load_project(tmp_path)
    add_attempt(
        ws,
        cfg,
        day="2026-10-13",
        stamp="2026-10-13T00-00-00Z",
        task_text="old task",
        files={"cart.ts": "export const history = 1;\n"},
    )
    add_attempt(
        ws,
        cfg,
        model="other-model",
        stamp="2026-10-14T00-00-01Z",
        files={"cart.ts": "export const other = 1;\n"},
    )
    matrix = publish_site(ws, cfg, today="2026-10-14")
    assert len(matrix["cells"]) == 1
    assert matrix["cells"][0]["date"] == "2026-10-13"
    assert matrix["cells"][0]["stale"] is False
    variant = cfg.enabled_variants()[0]
    suffix = cfg.enabled_suffixes()[0]
    assert is_stale(
        {
            "source": "live",
            "date": "2026-10-14",
            "agent": variant.agent,
            "model": variant.model,
            "effort": variant.effort,
            "task_text": "changed",
            "constraints_text": cfg.constraints,
            "suffix_text": suffix.text,
        },
        cfg,
        variant.agent,
        variant.model,
        variant.effort,
        suffix.text,
        "2026-10-14",
    )
