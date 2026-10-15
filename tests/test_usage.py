import json

from modeltests.usage import (
    claude_usage,
    copilot_usage,
    cursor_usage,
    grok_usage,
    normalize_output,
    normalize_usage,
)


def test_grok_total_below_the_parts_keeps_the_sum():
    result = grok_usage(
        {
            "model": "grok-4.7",
            "text": "done",
            "num_turns": 2,
            "total_cost_usd": 0.01,
            "usage": {
                "input_tokens": 1,
                "cache_read_input_tokens": 2,
                "cache_creation_input_tokens": 3,
                "output_tokens": 4,
                "reasoning_tokens": 5,
                "total_tokens": 10,
            },
        }
    )
    assert result["total_tokens"] == 15
    assert result["total_tokens_source"] == "summed_parts"
    assert result["cost_usd"] == 0.01
    assert result["turn_count"] == 2
    assert result["final_text"] == "done"
    assert result["reported_model"] == "grok-4.7"


def test_cli_total_equal_to_the_parts_keeps_the_sum():
    result = grok_usage({"usage": {"input_tokens": 2, "output_tokens": 3, "total_tokens": 5}})
    assert result["total_tokens"] == 5
    assert result["total_tokens_source"] == "summed_parts"


def test_a_boolean_token_count_stays_null():
    result = normalize_usage({"usage": {"input_tokens": True, "output_tokens": 1}})
    assert "input" not in result["token_parts"]
    assert result["total_tokens"] == 1
    assert result["total_tokens_source"] == "summed_parts"


def test_cli_total_above_the_parts_is_kept():
    result = grok_usage({"usage": {"input_tokens": 1, "output_tokens": 1, "total_tokens": 100}})
    assert result["total_tokens"] == 100
    assert result["total_tokens_source"] == "cli"


def test_claude_shape_reads_duration_and_result():
    result = claude_usage(
        {
            "result": "hi",
            "total_cost_usd": 0.2,
            "duration_ms": 50,
            "num_turns": 1,
            "usage": {"input_tokens": 2, "output_tokens": 3},
        }
    )
    assert result["total_tokens"] == 5
    assert result["final_text"] == "hi"
    assert result["cli_duration_ms"] == 50
    assert result["cost_usd"] == 0.2


def test_cursor_shape_keeps_a_present_zero():
    result = cursor_usage(
        {
            "result": "ok",
            "usage": {
                "inputTokens": 3,
                "outputTokens": 4,
                "cacheReadTokens": 1,
                "cacheWriteTokens": 0,
            },
        }
    )
    assert result["token_parts"]["cache_write"] == 0
    assert result["total_tokens"] == 8
    assert result["total_tokens_source"] == "summed_parts"
    assert result["cost_usd"] is None


def test_missing_token_fields_stay_null():
    result = normalize_usage({"result": "hi"})
    assert result["total_tokens"] is None
    assert result["total_tokens_source"] is None
    assert result["cost_usd"] is None
    assert result["turn_count"] is None
    assert result["token_parts"] == {}


def test_cost_is_not_taken_from_model_usage():
    result = claude_usage({"modelUsage": {"opus": {"total_cost_usd": 9}}, "usage": {"input_tokens": 1}})
    assert result["cost_usd"] is None
    assert result["reported_model"] == "opus"


def test_parser_uses_the_last_json_object():
    text = 'log {"a": 1}\n{"usage": {"output_tokens": 4}}\n'
    assert normalize_output(text)["total_tokens"] == 4


def test_copilot_jsonl_splits_cache_and_reasoning():
    text = "\n".join(
        [
            json.dumps({"type": "assistant.message", "data": {"content": "first"}}),
            json.dumps({"type": "assistant.message", "data": {"content": "built the cart"}}),
            json.dumps(
                {
                    "type": "session.shutdown",
                    "data": {
                        "currentModel": "gpt-6.1-sol-2026-09-22",
                        "totalApiDurationMs": 80,
                        "totalPremiumRequests": 1,
                        "modelMetrics": {
                            "gpt-6.1-sol-2026-09-22": {
                                "requests": {"count": 3, "cost": 1},
                                "usage": {
                                    "inputTokens": 100,
                                    "outputTokens": 50,
                                    "cacheReadTokens": 10,
                                    "cacheWriteTokens": 20,
                                    "reasoningTokens": 5,
                                },
                            }
                        },
                    },
                }
            ),
        ]
    )
    result = copilot_usage(text, "gpt-6.1-sol")
    assert result["token_parts"] == {
        "input": 70,
        "output": 45,
        "cache_read": 10,
        "cache_write": 20,
        "reasoning": 5,
    }
    assert result["total_tokens"] == 150
    assert result["total_tokens_source"] == "summed_parts"
    assert result["cost_usd"] is None
    assert result["reported_model"] == "gpt-6.1-sol-2026-09-22"
    assert result["final_text"] == "built the cart"
    assert result["cli_duration_ms"] == 80
    assert result["turn_count"] == 3


def test_copilot_prompt_mode_reads_the_usage_checkpoint():
    text = "\n".join(
        [
            json.dumps({"type": "assistant.message", "data": {"content": "built the cart"}}),
            json.dumps(
                {
                    "type": "session.usage_checkpoint",
                    "data": {
                        "accountingSnapshot": {
                            "currentModel": "gpt-6.1-sol",
                            "totalApiDurationMs": 90,
                            "modelMetrics": {
                                "gpt-6.1-sol": {
                                    "requests": {"count": 2, "cost": 1},
                                    "usage": {
                                        "inputTokens": 100,
                                        "outputTokens": 50,
                                        "cacheReadTokens": 10,
                                        "cacheWriteTokens": 20,
                                        "reasoningTokens": 5,
                                    },
                                }
                            },
                        }
                    },
                }
            ),
            json.dumps(
                {
                    "type": "result",
                    "exitCode": 0,
                    "usage": {"premiumRequests": 1, "totalApiDurationMs": 90},
                }
            ),
        ]
    )
    result = copilot_usage(text, "gpt-6.1-sol")
    assert result["total_tokens"] == 150
    assert result["cost_usd"] is None
    assert result["reported_model"] == "gpt-6.1-sol"
    assert result["final_text"] == "built the cart"
    assert result["turn_count"] == 2
