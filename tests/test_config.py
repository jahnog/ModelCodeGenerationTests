import pytest

from modeltests.cli import main
from modeltests.config import ConfigError, load_config

from support import config_text, load_project, write_project


def test_missing_model_and_illegal_effort_are_rejected(tmp_path):
    missing = config_text(
        """
variants:
  - id: grok-medium
    agent: grok
    label: Grok Build
    model: ""
    effort: medium
suffixes:
  - id: none
    family: baseline
    label: None
    text: ""
"""
    )
    config = write_project(tmp_path, missing)
    with pytest.raises(ConfigError, match="needs a model"):
        load_config(config, tmp_path)

    illegal = config_text(
        """
variants:
  - id: grok-medium
    agent: grok
    label: Grok Build
    model: grok-4.7
    effort: default
suffixes:
  - id: none
    family: baseline
    label: None
    text: ""
"""
    )
    other = tmp_path / "other"
    other.mkdir()
    path = write_project(other, illegal)
    with pytest.raises(ConfigError, match="not a Grok effort"):
        load_config(path, other)


def test_enabled_flag_stays_in_the_file_and_out_of_the_plan(tmp_path):
    _ws, cfg = load_project(tmp_path)
    assert any(item.id == "paused" and item.enabled is False for item in cfg.variants)
    assert any(item.id == "parked" and item.enabled is False for item in cfg.suffixes)
    assert [item.id for item in cfg.enabled_variants()] == ["grok-medium"]
    assert [item.id for item in cfg.enabled_suffixes()] == ["none", "simple"]
    from modeltests.runner import plan_cells

    assert plan_cells(cfg, variant="paused") == []
    assert plan_cells(cfg, suffix="parked") == []
    assert [suffix.id for _variant, suffix in plan_cells(cfg, family="baseline")] == ["none", "simple"]


def test_list_prints_enabled_cells_and_disabled_rows(tmp_path, capsys):
    _ws, _cfg = load_project(tmp_path)
    config = tmp_path / "config" / "benchmark.yaml"
    assert main(["--config", str(config), "list"]) == 0
    out = capsys.readouterr().out
    assert "task shopping-cart" in out
    assert "enabled cells: 2" in out
    assert "Make a program." in out
    assert "disabled variants:" in out
    assert "paused" in out
    assert "disabled suffixes:" in out
    assert "parked" in out


def test_cursor_effort_mismatch_warns_but_loads(tmp_path):
    text = config_text(
        """
variants:
  - id: cursor-grok
    agent: cursor
    label: Cursor Agent
    model: grok-4.7-medium
    effort: high
suffixes:
  - id: none
    family: baseline
    label: None
    text: ""
"""
    )
    config = write_project(tmp_path, text)
    cfg = load_config(config, tmp_path)
    assert cfg.warnings
    assert "high" in cfg.warnings[0]


def test_refusal_does_not_publish(tmp_path):
    text = config_text(
        """
variants:
  - id: one
    agent: grok
    label: One
    model: grok-4.7
    effort: medium
  - id: two
    agent: grok
    label: Two
    model: grok-4.7
    effort: medium
suffixes:
  - id: none
    family: baseline
    label: None
    text: ""
"""
    )
    config = write_project(tmp_path, text)
    assert main(["--config", str(config), "demo"]) == 2
    assert not (tmp_path / "docs" / "data").exists()
