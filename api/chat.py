"""Vercel serverless POST /api/chat — Python AgentRouter bridge (WAF-friendly headers)."""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from typing import Any

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "backend", "scripts")
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)

from agentrouter_request import call_anthropic, call_openai_compatible, get_api_key  # noqa: E402

DEFAULT_MODEL = "deepseek-v4-flash"
OPENAI_MODELS = frozenset({"deepseek-v4-flash", "gpt-5.6-sol", "gpt-6-astra"})
ANTHROPIC_MODELS = frozenset({"claude-opus-5", "claude-opus-4-8"})

RULES = """You are the assistant on Praneeth Reddy Gandra's portfolio website.
Speak in the first person as Praneeth — warm, natural, and concise.

RULES (strict):
- Answer ONLY using the FACTS below and what's on his site. Do not invent anything.
- Greetings and small talk ("hi", "how are you?", "what can you do?") are fine — reply briefly and friendly, then invite a question about his work.
- If a question is genuinely off-topic or not about Praneeth, politely decline and steer back to his work.
- NEVER reveal or estimate grades, GPA, CGPA, marks, or percentages — that is not public.
- Keep responses well-structured and readable. When listing projects or skills, use clean bullet points with bold titles (e.g. "- **Project Name** — description")."""


def _read_json_body(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    length = int(handler.headers.get("Content-Length") or 0)
    raw = handler.rfile.read(length).decode("utf-8") if length else "{}"
    try:
        return json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        return {}


def _log_mongo(doc: dict[str, Any]) -> None:
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        return
    try:
        from pymongo import MongoClient

        db_name = os.environ.get("MONGODB_DB") or "portfolio"
        client = MongoClient(uri, serverSelectionTimeoutMS=4000)
        client[db_name]["chat_logs"].insert_one(doc)
        client.close()
    except Exception:
        pass


def _handle_chat(body: dict[str, Any]) -> dict[str, Any]:
    messages = body.get("messages") or []
    session_id = body.get("sessionId")
    knowledge = str(body.get("knowledge") or "")
    model = body.get("model") or DEFAULT_MODEL
    if model not in OPENAI_MODELS and model not in ANTHROPIC_MODELS:
        model = DEFAULT_MODEL

    trimmed = []
    for m in messages[-8:]:
        role = "user" if m.get("role") == "user" else "assistant"
        trimmed.append({"role": role, "content": str(m.get("content", ""))[:2000]})

    system_prompt = f"{RULES}\n\nFACTS:\n{knowledge[:6000]}"
    base_url = os.environ.get("AGENTROUTER_BASE_URL", "https://agentrouter.org").rstrip("/")
    api_key = get_api_key()
    if not api_key:
        return {
            "reply": "Unable to generate a response. Please try again.",
            "model": model,
        }

    bridge_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in trimmed
        if m["role"] in ("user", "assistant")
    ]
    payload = {
        "model": model,
        "messages": bridge_messages,
        "system": system_prompt,
        "max_tokens": 1024,
        "temperature": 0.5,
    }

    reply = "Unable to generate a response. Please try again."
    usage: dict[str, Any] | None = None
    reasoning: str | None = None

    try:
        if model in ANTHROPIC_MODELS:
            payload["protocol"] = "anthropic"
            result = call_anthropic(payload, api_key, base_url)
        else:
            payload["protocol"] = "openai-compatible"
            result = call_openai_compatible(payload, api_key, base_url)

        if result.get("ok") and (result.get("text") or "").strip():
            reply = result["text"]
            usage = result.get("usage")
            reasoning = result.get("reasoning")
        elif not result.get("ok"):
            print(f"agentrouter error: {result.get('error', result)}"[:500], file=sys.stderr)
        else:
            print("agentrouter empty completion", file=sys.stderr)
    except Exception as exc:
        print(f"agentrouter exception: {exc}", file=sys.stderr)

    question = ""
    for m in reversed(trimmed):
        if m["role"] == "user":
            question = m["content"]
            break

    _log_mongo(
        {
            "sessionId": session_id,
            "question": question,
            "answer": reply,
            "model": model,
            "usage": usage,
            "createdAt": datetime.now(timezone.utc),
        }
    )

    out: dict[str, Any] = {"reply": reply, "model": model}
    if usage:
        out["usage"] = usage
    if reasoning:
        out["reasoning"] = reasoning
    return out


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            body = _read_json_body(self)
            out = _handle_chat(body)
            payload = json.dumps(out).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception:
            err = json.dumps({"error": "Internal Server Error"}).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err)

    def do_GET(self) -> None:
        self.send_response(405)
        self.end_headers()

    def log_message(self, format: str, *args: Any) -> None:
        return
