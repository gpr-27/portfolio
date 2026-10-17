"""Vercel serverless POST /api/chat — Groq chat (OpenAI-compatible REST, stdlib only)."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from typing import Any

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"
# Same order as backend/lib/groq.ts: on rate limits / outages, try the next model down.
MODELS = ("openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b")

RULES = """You are the assistant on Praneeth Reddy Gandra's portfolio website.
Speak in the first person as Praneeth — warm, natural, and concise.

RULES (strict):
- Answer ONLY using the FACTS below and what's on his site. Do not invent anything.
- Greetings and small talk ("hi", "how are you?", "what can you do?") are fine — reply briefly and friendly, then invite a question about his work.
- If a question is genuinely off-topic or not about Praneeth, politely decline and steer back to his work.
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


class ChatUnavailable(Exception):
    pass


def _call_groq(model: str, messages: list[dict[str, str]], api_key: str) -> dict[str, Any]:
    body = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": 0.5,
            # gpt-oss spends tokens on hidden reasoning — leave headroom.
            "max_tokens": 1024,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        GROQ_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "portfolio-chat/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def _handle_chat(body: dict[str, Any]) -> dict[str, Any]:
    messages = body.get("messages") or []
    session_id = body.get("sessionId")
    knowledge = str(body.get("knowledge") or "")
    model = body.get("model") if body.get("model") in MODELS else DEFAULT_MODEL

    trimmed = []
    for m in messages[-8:]:
        role = "user" if m.get("role") == "user" else "assistant"
        trimmed.append({"role": role, "content": str(m.get("content", ""))[:2000]})

    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        print("GROQ_API_KEY is not set", file=sys.stderr)
        raise ChatUnavailable()

    system_prompt = f"{RULES}\n\nFACTS:\n{knowledge[:6000]}"
    groq_messages = [{"role": "system", "content": system_prompt}, *trimmed]

    reply = ""
    usage: dict[str, Any] | None = None
    for candidate in (model, *[m for m in MODELS if m != model]):
        try:
            data = _call_groq(candidate, groq_messages, api_key)
            reply = str(data["choices"][0]["message"].get("content") or "").strip()
            if reply:
                model = candidate
                usage = data.get("usage")
                break
            print(f"groq {candidate}: empty completion", file=sys.stderr)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:300]
            print(f"groq {candidate} HTTP {exc.code}: {detail}", file=sys.stderr)
            # Bad key / bad request won't be fixed by another model.
            if exc.code in (400, 401, 403):
                break
        except Exception as exc:
            print(f"groq {candidate} error: {exc}", file=sys.stderr)

    if not reply:
        raise ChatUnavailable()

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
        except ChatUnavailable:
            # Non-200 makes the widget fall back to its offline answers.
            err = json.dumps({"error": "chat unavailable"}).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err)
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
