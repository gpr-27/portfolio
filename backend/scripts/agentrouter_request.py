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


def get_https_proxy() -> str | None:
    proxy = (
        os.environ.get("AGENTROUTER_HTTPS_PROXY", "")
        or os.environ.get("HTTPS_PROXY", "")
        or os.environ.get("HTTP_PROXY", "")
    ).strip()
    return proxy or None


def _anthropic_client_headers(api_key: str) -> dict[str, str]:
    return {
        "content-type": "application/json",
        "accept": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": api_key,
        "authorization": f"Bearer {api_key}",
        "user-agent": "Anthropic/Python 1.0.0",
        "x-stainless-lang": "python",
        "x-stainless-os": "Linux" if os.environ.get("VERCEL") == "1" else "MacOS",
        "x-stainless-arch": "x64" if os.environ.get("VERCEL") == "1" else "arm64",
        "x-stainless-runtime": "CPython",
    }


def _parse_anthropic_content(content: object) -> tuple[str, str]:
    text = ""
    reasoning = ""
    if isinstance(content, str):
        return content, ""
    if not isinstance(content, list):
        return "", ""

    for block in content:
        if isinstance(block, str):
            text += block
            continue
        if isinstance(block, dict):
            block_type = block.get("type")
            if block_type == "text":
                text += block.get("text") or ""
            elif block_type == "thinking":
                reasoning += block.get("thinking") or ""
            continue
        block_type = getattr(block, "type", None)
        if block_type == "text":
            text += getattr(block, "text", "") or ""
        elif block_type == "thinking":
            reasoning += getattr(block, "thinking", "") or ""

    return text, reasoning


def call_anthropic_raw(payload: dict, api_key: str, base_url: str) -> dict:
    import httpx

    model = payload["model"]
    messages = payload.get("messages") or []
    system = payload.get("system")
    max_tokens = int(payload.get("max_tokens") or 1024)
    temperature = payload.get("temperature")

    body: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        body["system"] = system
    if temperature is not None:
        body["temperature"] = temperature

    proxy = get_https_proxy()
    with httpx.Client(proxy=proxy, timeout=120.0) as client:
        response = client.post(
            f"{base_url}/v1/messages",
            headers=_anthropic_client_headers(api_key),
            json=body,
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

    text, reasoning = _parse_anthropic_content(data.get("content"))
    if not text and reasoning:
        text = reasoning

    usage_raw = data.get("usage") or {}
    inp = usage_raw.get("input_tokens")
    out = usage_raw.get("output_tokens")
    usage_out = {
        "inputTokens": inp,
        "outputTokens": out,
        "totalTokens": inp + out if isinstance(inp, int) and isinstance(out, int) else None,
    }

    return {
        "ok": True,
        "model": model,
        "text": text,
        "reasoning": reasoning or None,
        "usage": usage_out,
    }


def _anthropic_result_from_json(model: str, data: dict) -> dict:
    text, reasoning = _parse_anthropic_content(data.get("content"))
    if not text and reasoning:
        text = reasoning

    usage_raw = data.get("usage") or {}
    inp = usage_raw.get("input_tokens")
    out = usage_raw.get("output_tokens")
    usage_out = {
        "inputTokens": inp,
        "outputTokens": out,
        "totalTokens": inp + out if isinstance(inp, int) and isinstance(out, int) else None,
    }

    return {
        "ok": True,
        "model": model,
        "text": text,
        "reasoning": reasoning or None,
        "usage": usage_out,
    }


def _anthropic_from_raw_http(model: str, body_text: str, status: int) -> dict:
    if status < 200 or status >= 300:
        detail = body_text[:500]
        try:
            parsed = json.loads(body_text)
            detail = parsed.get("error", {}).get("message") or json.dumps(parsed)[:500]
        except Exception:
            pass
        return {"ok": False, "error": f"HTTP {status}: {detail}"}

    try:
        data = json.loads(body_text)
    except json.JSONDecodeError:
        lowered = body_text.lower()
        if "<!doctype html" in lowered or "aliyun_waf" in lowered:
            return {"ok": False, "error": "AgentRouter blocked request (Aliyun WAF)"}
        return {"ok": False, "error": f"Non-JSON response: {body_text[:200]}"}

    return _anthropic_result_from_json(model, data)


def call_anthropic(payload: dict, api_key: str, base_url: str) -> dict:
    import httpx
    from anthropic import Anthropic

    model = payload["model"]
    messages = payload.get("messages") or []
    system = payload.get("system")
    max_tokens = int(payload.get("max_tokens") or 1024)

    proxy = get_https_proxy()
    http_client = httpx.Client(proxy=proxy, timeout=120.0) if proxy else None
    client = Anthropic(auth_token=api_key, base_url=base_url, http_client=http_client)

    kwargs: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        kwargs["system"] = system

    try:
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
    except Exception:
        try:
            raw = client.messages.with_raw_response.create(**kwargs)
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

        return _anthropic_from_raw_http(
            model,
            raw.http_response.text,
            raw.http_response.status_code,
        )


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

    proxy = get_https_proxy()
    with httpx.Client(proxy=proxy, timeout=120.0) as client:
        response = client.post(
            f"{base_url}/v1/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": payload_messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False,
            },
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
