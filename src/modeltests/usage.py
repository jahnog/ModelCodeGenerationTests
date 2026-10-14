"""Read token, cost, and turn figures from the three agent JSON shapes."""

from __future__ import annotations

import json
from typing import Any


def last_json(text: str) -> dict[str, Any] | None:
    """Return the last JSON object in a log that may surround it."""
    decoder = json.JSONDecoder()
    index = 0
    found: dict[str, Any] | None = None
    while True:
        start = text.find("{", index)
        if start < 0:
            return found
        try:
            value, end = decoder.raw_decode(text, start)
        except json.JSONDecodeError:
            index = start + 1
            continue
        if isinstance(value, dict):
            found = value
        index = end


def _pick(mapping: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in mapping and mapping[key] is not None:
            return mapping[key]
    return None


def _number(value: Any) -> int | float | None:
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, str):
        try:
            return float(value) if "." in value else int(value)
        except ValueError:
            return None
    return None


def _usage_mapping(obj: dict[str, Any]) -> dict[str, Any]:
    usage = obj.get("usage")
    return usage if isinstance(usage, dict) else {}


def normalize_usage(obj: dict[str, Any] | None) -> dict[str, Any]:
    """Normalize one result object. Missing numbers stay null, never zero."""
    empty: dict[str, Any] = {
        "total_tokens": None,
        "total_tokens_source": None,
        "token_parts": {},
        "cost_usd": None,
        "turn_count": None,
        "cli_duration_ms": None,
        "reported_model": None,
        "final_text": None,
    }
    if not obj:
        return empty
    usage = _usage_mapping(obj)
    part_keys = {
        "input": ("input_tokens", "inputTokens"),
        "output": ("output_tokens", "outputTokens"),
        "cache_read": (
            "cache_read_input_tokens",
            "cacheReadTokens",
            "cacheReadInputTokens",
        ),
        "cache_write": (
            "cache_creation_input_tokens",
            "cacheWriteTokens",
            "cacheCreationInputTokens",
        ),
        "reasoning": ("reasoning_tokens", "reasoningTokens"),
    }
    parts: dict[str, int | float] = {}
    for name, keys in part_keys.items():
        number = _number(_pick(usage, *keys))
        if number is not None:
            parts[name] = number
    cli_total = _number(_pick(usage, "total_tokens", "totalTokens"))
    if cli_total is None:
        cli_total = _number(_pick(obj, "total_tokens", "totalTokens"))
    # A CLI total that leaves out cache is smaller than the parts. Keep the parts.
    if parts:
        summed = sum(parts.values())
        if cli_total is not None and cli_total > summed:
            total, source = cli_total, "cli"
        else:
            total, source = summed, "summed_parts"
    elif cli_total is not None:
        total, source = cli_total, "cli"
    else:
        total, source = None, None
    reported = _pick(obj, "model", "modelId")
    if not isinstance(reported, str):
        model_usage = obj.get("modelUsage")
        if isinstance(model_usage, dict) and model_usage:
            reported = next(iter(model_usage))
        else:
            reported = None
    final = _pick(obj, "text", "result")
    if not isinstance(final, str):
        final = None
    return {
        "total_tokens": total,
        "total_tokens_source": source,
        "token_parts": parts,
        "cost_usd": _number(_pick(obj, "total_cost_usd", "cost_usd", "costUSD")),
        "turn_count": _number(_pick(obj, "num_turns", "numTurns", "turn_count")),
        "cli_duration_ms": _number(_pick(obj, "duration_ms", "durationMs")),
        "reported_model": reported,
        "final_text": final,
    }


def normalize_output(text: str) -> dict[str, Any]:
    return normalize_usage(last_json(text))


def grok_usage(obj: dict[str, Any] | None) -> dict[str, Any]:
    return normalize_usage(obj)


def claude_usage(obj: dict[str, Any] | None) -> dict[str, Any]:
    return normalize_usage(obj)


def cursor_usage(obj: dict[str, Any] | None) -> dict[str, Any]:
    return normalize_usage(obj)


def usage_for(agent: str, obj: dict[str, Any] | None) -> dict[str, Any]:
    if agent == "claude":
        return claude_usage(obj)
    if agent == "cursor":
        return cursor_usage(obj)
    return grok_usage(obj)
