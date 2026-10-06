#!/usr/bin/env python3
"""AgentRouter bridge — Anthropic SDK + httpx (TLS/fingerprint AgentRouter accepts)."""

import json
import os
import sys


def get_api_key() -> str:
    return (
        os.environ.get("AGENTROUTER_API_KEY", "")
        or os.environ.get("AXON_API_KEY", "")
    ).strip()


def call_anthropic(payload: dict, api_key: str, base_url: str) -> dict:
    from anthropic import Anthropic

    model = payload["model"]
    messages = payload.get("messages") or []
    system = payload.get("system")
    max_tokens = int(payload.get("max_tokens") or 1024)
    temperature = payload.get("temperature")

    client = Anthropic(auth_token=api_key, base_url=base_url)

    kwargs: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        kwargs["system"] = system
    msg = client.messages.create(**kwargs)

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
        inp, out = usage_out["inputTokens"], usage_out["outputTokens"]
        if inp is not None and out is not None:
            usage_out["totalTokens"] = inp + out

    return {
        "ok": True,
        "model": model,
        "text": text,
        "reasoning": reasoning or None,
        "usage": usage_out,
    }


def call_openai_compatible(payload: dict, api_key: str, base_url: str) -> dict:
    import httpx

    model = payload["model"]
    messages = payload.get("messages") or []
    system = payload.get("system")
    max_tokens = int(payload.get("max_tokens") or 1024)
    temperature = float(payload.get("temperature") if payload.get("temperature") is not None else 0.7)

    payload_messages: list[dict] = []
    if system:
        payload_messages.append({"role": "system", "content": system})
    payload_messages.extend(messages)

    headers = {
        "authorization": f"Bearer {api_key}",
        "content-type": "application/json",
        "user-agent": "Anthropic/Python 1.0.0",
        "x-stainless-lang": "python",
        "x-stainless-os": "MacOS",
        "x-stainless-arch": "arm64",
        "x-stainless-runtime": "CPython",
    }

    response = httpx.post(
        f"{base_url}/v1/chat/completions",
        headers=headers,
        json={
            "model": model,
            "messages": payload_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        },
        timeout=120.0,
    )

    raw = response.text
    if response.status_code < 200 or response.status_code >= 300:
        detail = raw[:500]
        try:
            parsed = response.json()
            detail = parsed.get("error", {}).get("message") or json.dumps(parsed)[:500]
        except Exception:
            pass
        return {"ok": False, "error": f"HTTP {response.status_code}: {detail}"}

    try:
        data = response.json()
    except json.JSONDecodeError:
        if "<!doctype html" in raw.lower() or "aliyun_waf" in raw.lower():
            return {"ok": False, "error": "AgentRouter blocked request (Aliyun WAF)"}
        return {"ok": False, "error": f"Non-JSON response: {raw[:200]}"}

    choice = (data.get("choices") or [{}])[0]
    message = choice.get("message") or {}
    text = message.get("content") or ""
    reasoning = message.get("reasoning_content") or message.get("reasoning") or ""

    if not text and reasoning:
        text = reasoning

    usage_raw = data.get("usage") or {}
    usage_out = {
        "inputTokens": usage_raw.get("prompt_tokens"),
        "outputTokens": usage_raw.get("completion_tokens"),
        "totalTokens": usage_raw.get("total_tokens"),
    }

    return {
        "ok": True,
        "model": model,
        "text": text,
        "reasoning": reasoning or None,
        "usage": usage_out,
    }


def main() -> None:
    payload = json.load(sys.stdin)
    api_key = get_api_key()
    if not api_key:
        print(json.dumps({"ok": False, "error": "AGENTROUTER_API_KEY missing"}))
        return

    base_url = os.environ.get("AGENTROUTER_BASE_URL", "https://agentrouter.org").rstrip("/")
    protocol = payload.get("protocol") or "anthropic"

    try:
        if protocol == "openai-compatible":
            result = call_openai_compatible(payload, api_key, base_url)
        else:
            result = call_anthropic(payload, api_key, base_url)
    except Exception as exc:  # noqa: BLE001 — surface provider errors to Node
        print(json.dumps({"ok": False, "error": str(exc)}))
        return

    if result.get("ok") and not (result.get("text") or "").strip():
        print(json.dumps({"ok": False, "error": f"Empty completion for model {payload.get('model')}"}))
        return

    print(json.dumps(result))


if __name__ == "__main__":
    main()
