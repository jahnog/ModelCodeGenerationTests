"""Prompt text and the dated folder slug."""

from __future__ import annotations


def build_prompt(task: str, suffix: str, constraints: str) -> str:
    """Join the task, an optional suffix, and the constraints with one blank line."""
    parts = [task.rstrip()]
    if suffix.strip():
        parts.append(suffix.rstrip())
    parts.append(constraints.rstrip())
    return "\n\n".join(parts)


def _sanitize(value: str) -> str:
    chars: list[str] = []
    for char in value.lower():
        if (char.isascii() and char.isalnum()) or char == "-":
            chars.append(char)
        else:
            chars.append("-")
    slug = "".join(chars)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug


def slug_base(agent: str, model: str, effort: str, suffix_id: str) -> str:
    return "-".join(_sanitize(part) for part in (agent, model, effort, suffix_id))


def build_slug(agent: str, model: str, effort: str, suffix_id: str, day: str) -> str:
    # The date is appended after sanitizing, so its hyphens stay.
    return f"{slug_base(agent, model, effort, suffix_id)}-{day}"
