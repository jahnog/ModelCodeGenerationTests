"""Read token, cost, and turn figures from the agent JSON shapes."""

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


def _jsonl_objects(text: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("{"):
            continue
        try:
            value = json.loads(stripped)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            found.append(value)
    return found


def _at_least_zero(value: Any) -> int | float:
    number = _number(value)
    if number is None or number < 0:
        return 0
    return number


def _metric_key(metrics: dict[str, Any], model: str, current: Any) -> str | None:
    exact = [key for key in metrics if key == model]
    if exact:
        return exact[0]
    prefixed = [key for key in metrics if key.startswith(model)]
    if prefixed:
        return prefixed[0]
    if isinstance(current, str) and current in metrics:
        return current
    if len(metrics) == 1:
        return next(iter(metrics))
    return None


def _metrics_payload(event: dict[str, Any]) -> dict[str, Any] | None:
    """Return the object that holds modelMetrics. Prompt mode uses a checkpoint."""
    data = event.get("data")
    payload = data if isinstance(data, dict) else {}
    kind = event.get("type")
    if kind == "session.shutdown":
        return payload
    if kind == "session.usage_checkpoint":
        snapshot = payload.get("accountingSnapshot")
        if isinstance(snapshot, dict):
            return snapshot
    return None


def copilot_usage(text: str, model: str) -> dict[str, Any]:
    """Read a Copilot JSONL log. Cache and reasoning are split out of the totals."""
    events = _jsonl_objects(text)
    final: str | None = None
    payload: dict[str, Any] | None = None
    for event in events:
        data = event.get("data")
        body = data if isinstance(data, dict) else {}
        if event.get("type") == "assistant.message":
            content = body.get("content")
            if isinstance(content, str):
                final = content
        candidate = _metrics_payload(event)
        if isinstance(candidate, dict) and isinstance(candidate.get("modelMetrics"), dict):
            payload = candidate
    if payload is None:
        usage = normalize_usage(events[-1] if events else None)
        if usage["final_text"] is None:
            usage["final_text"] = final
        return usage
    metrics = payload.get("modelMetrics")
    chosen: dict[str, Any] | None = None
    reported: str | None = None
    if isinstance(metrics, dict) and metrics:
        reported = _metric_key(metrics, model, payload.get("currentModel"))
        if reported is not None and isinstance(metrics.get(reported), dict):
            chosen = metrics[reported]
    raw = chosen.get("usage") if isinstance(chosen, dict) else None
    if not isinstance(raw, dict):
        usage = normalize_usage(None)
        usage["final_text"] = final
        usage["reported_model"] = reported
        return usage
    # inputTokens already includes both cache buckets. outputTokens includes reasoning.
    cache_read = _at_least_zero(raw.get("cacheReadTokens"))
    cache_write = _at_least_zero(raw.get("cacheWriteTokens"))
    reasoning = _at_least_zero(raw.get("reasoningTokens"))
    uncached = _at_least_zero(_at_least_zero(raw.get("inputTokens")) - cache_read - cache_write)
    visible = _at_least_zero(_at_least_zero(raw.get("outputTokens")) - reasoning)
    parts: dict[str, int | float] = {}
    for name, number in (
        ("input", uncached),
        ("output", visible),
        ("cache_read", cache_read),
        ("cache_write", cache_write),
        ("reasoning", reasoning),
    ):
        if number:
            parts[name] = number
    requests = chosen.get("requests") if isinstance(chosen, dict) else None
    turn_count = None
    if isinstance(requests, dict):
        turn_count = _number(requests.get("count"))
    return {
        "total_tokens": sum(parts.values()) if parts else 0,
        "total_tokens_source": "summed_parts",
        "token_parts": parts,
        "cost_usd": None,
        "turn_count": turn_count,
        "cli_duration_ms": _number(payload.get("totalApiDurationMs")),
        "reported_model": reported,
        "final_text": final,
    }
