from modeltests.usage import claude_usage, cursor_usage, grok_usage, normalize_output, normalize_usage


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
