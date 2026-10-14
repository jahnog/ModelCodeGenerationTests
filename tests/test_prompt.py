from modeltests.config import ConfigError, load_config, workspace_from_config
from modeltests.prompt import build_prompt, build_slug

from support import REPO


def test_empty_suffix_adds_no_extra_sentence():
    prompt = build_prompt("Make a program.\n", "  ", "Stay here.\n")
    assert prompt == "Make a program.\n\nStay here."
    assert prompt.count("\n\n") == 1


def test_suffix_is_its_own_paragraph():
    prompt = build_prompt("Make a program.", "follow ddd.", "Stay here.")
    assert prompt == "Make a program.\n\nfollow ddd.\n\nStay here."


def test_slug_keeps_the_date_and_turns_dots_into_hyphens():
    assert (
        build_slug("grok", "grok-4.7", "medium", "simple", "2026-10-14")
        == "grok-grok-4-7-medium-simple-2026-10-14"
    )
    assert (
        build_slug("claude", "opus", "medium", "none", "2026-10-14")
        == "claude-opus-medium-none-2026-10-14"
    )
    assert (
        build_slug("cursor", "composer-2.5", "default", "clean-architecture", "2026-10-14")
        == "cursor-composer-2-5-default-clean-architecture-2026-10-14"
    )


def test_shipped_config_builds_prompts_from_the_file():
    ws = workspace_from_config(str(REPO / "config" / "benchmark.yaml"))
    cfg = load_config(ws.config_path, ws.root)
    none = next(item for item in cfg.suffixes if item.id == "none")
    simple = next(item for item in cfg.suffixes if item.id == "simple")
    plain = build_prompt(cfg.task_text, none.text, cfg.constraints)
    styled = build_prompt(cfg.task_text, simple.text, cfg.constraints)
    assert "TypeScript 7.0.2" in plain
    assert "moduleResolution bundler" in plain
    assert plain.count("\n\n") == 1
    assert simple.text in styled
    assert styled.count("\n\n") == 2
    assert len(cfg.cells()) == 48


def test_duplicate_pre_date_slug_is_rejected(tmp_path):
    from support import config_text, write_project

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
    try:
        load_config(config, tmp_path)
    except ConfigError as exc:
        assert "same folder slug" in str(exc)
    else:
        raise AssertionError("expected a slug collision")
