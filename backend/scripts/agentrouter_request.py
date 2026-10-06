#!/usr/bin/env python3
"""AgentRouter bridge using the Anthropic Python SDK (TLS fingerprint AgentRouter accepts)."""

import json
import os
import sys

from anthropic import Anthropic

CLAUDE_CODE_BETA = (
    "claude-code-20250219,interleaved-thinking-2025-05-14,"
    "effort-2025-11-24,redact-thinking-2026-02-12"
)


def main() -> None:
    payload = json.load(sys.stdin)
    api_key = os.environ.get("AGENTROUTER_API_KEY", "").strip()
    if not api_key:
        print(json.dumps({"ok": False, "error": "AGENTROUTER_API_KEY missing"}))
        return

    base_url = os.environ.get("AGENTROUTER_BASE_URL", "https://agentrouter.org").rstrip("/")
    model = payload["model"]
    messages = payload.get("messages") or []
    system = payload.get("system")
    max_tokens = int(payload.get("max_tokens") or 1024)

    client = Anthropic(
        api_key=api_key,
        base_url=base_url,
        default_headers={
            "user-agent": "claude-cli/2.1.195 (external, cli)",
            "x-app": "cli",
            "anthropic-beta": CLAUDE_CODE_BETA,
            "anthropic-dangerous-direct-browser-access": "true",
        },
    )

    kwargs = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": messages,
        "extra_query": {"beta": "true"},
    }
    if system:
        kwargs["system"] = system

    try:
        msg = client.messages.create(**kwargs)
    except Exception as exc:  # noqa: BLE001 — surface provider errors to Node
        print(json.dumps({"ok": False, "error": str(exc)}))
        return

    text = ""
    reasoning = ""
    for block in msg.content:
        block_type = getattr(block, "type", None)
        if block_type == "text":
            text += getattr(block, "text", "") or ""
        elif block_type == "thinking":
            reasoning += getattr(block, "thinking", "") or ""

    if not text and reasoning:
        text = reasoning

    usage = getattr(msg, "usage", None)
    usage_out = None
    if usage is not None:
        usage_out = {
            "inputTokens": getattr(usage, "input_tokens", None),
            "outputTokens": getattr(usage, "output_tokens", None),
        }
        if usage_out["inputTokens"] is not None and usage_out["outputTokens"] is not None:
            usage_out["totalTokens"] = usage_out["inputTokens"] + usage_out["outputTokens"]

    print(
        json.dumps(
            {
                "ok": True,
                "model": model,
                "text": text,
                "reasoning": reasoning or None,
                "usage": usage_out,
            }
        )
    )


if __name__ == "__main__":
    main()
