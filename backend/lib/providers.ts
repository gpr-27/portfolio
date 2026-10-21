// Chat providers, tried strictly in this order (one key per step):
//   1. Anthropic  ANTHROPIC_API_KEY
//   2. Groq       GROQ_API_KEY
//   3. Groq       GROQ_API_KEY_2
//   4. Gemini     GEMINI_API_KEY
//   5. Gemini     GEMINI_API_KEY_2
// Keys stay server-side (.env locally, Project Settings on Vercel).
// Mirrors api/chat.py, which serves /api/chat in production.

import Anthropic from '@anthropic-ai/sdk'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const CLAUDE_MODELS = ['claude-opus-5-5']
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-flash-latest']

// Per-call cap, and an overall budget that fits Vercel's 60s function limit.
const CALL_TIMEOUT_MS = 25_000
const TOTAL_BUDGET_MS = 50_000

export interface UnifiedUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  system: string
  maxTokens?: number
}

export interface ChatResult {
  text: string
  provider: string
  model: string
  usage?: UnifiedUsage
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[]
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]
  usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number }
}

type Env = Record<string, string | undefined>
type Caller = (req: ChatRequest, model: string, apiKey: string) => Promise<ChatResult>

class ProviderError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
  }
}

async function callClaude(req: ChatRequest, model: string, apiKey: string): Promise<ChatResult> {
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: CALL_TIMEOUT_MS })
  try {
    const res = await client.messages.create({
      model,
      max_tokens: req.maxTokens ?? 4096,
      // Short, grounded chat — low effort keeps replies fast and cheap.
      output_config: { effort: 'low' },
      // The fact sheet is the same on every request, so cache it.
      cache_control: { type: 'ephemeral' },
      system: req.system,
      messages: req.messages,
    })
    if (res.stop_reason === 'refusal') throw new ProviderError(`${model}: refusal`)
    const text = res.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()
    if (!text) throw new ProviderError(`${model}: empty completion`)
    return {
      text,
      provider: 'anthropic',
      model,
      usage: {
        promptTokens: res.usage.input_tokens,
        completionTokens: res.usage.output_tokens,
        totalTokens: res.usage.input_tokens + res.usage.output_tokens,
      },
    }
  } catch (err) {
    if (err instanceof Anthropic.APIError) throw new ProviderError(err.message, err.status)
    throw err
  }
}

async function callGroq(req: ChatRequest, model: string, apiKey: string): Promise<ChatResult> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: req.system }, ...req.messages],
      temperature: 0.5,
      // gpt-oss spends tokens on hidden reasoning — leave headroom.
      max_tokens: req.maxTokens ?? 2048,
    }),
    signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new ProviderError(`Groq ${res.status}: ${detail.slice(0, 200)}`, res.status)
  }
  const data = (await res.json()) as GroqResponse
  const text = String(data.choices?.[0]?.message?.content ?? '').trim()
  if (!text) throw new ProviderError(`Groq ${model}: empty completion`)
  return {
    text,
    provider: 'groq',
    model,
    usage: data.usage && {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  }
}

async function callGemini(req: ChatRequest, model: string, apiKey: string): Promise<ChatResult> {
  const res = await fetch(`${GEMINI_URL}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: req.maxTokens ?? 2048,
        // Default thinking is slow (~1 min); low keeps it inside the time budget.
        thinkingConfig: { thinkingLevel: 'low' },
      },
    }),
    signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new ProviderError(`Gemini ${res.status}: ${detail.slice(0, 200)}`, res.status)
  }
  const data = (await res.json()) as GeminiResponse
  const parts = data.candidates?.[0]?.content?.parts ?? []
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? '')
    .join('')
    .trim()
  if (!text) throw new ProviderError(`Gemini ${model}: empty completion`)
  const u = data.usageMetadata
  return {
    text,
    provider: 'gemini',
    model,
    usage: u && {
      promptTokens: u.promptTokenCount,
      completionTokens: u.candidatesTokenCount,
      totalTokens: u.totalTokenCount,
    },
  }
}

function chain(env: Env): { name: string; key?: string; models: string[]; call: Caller }[] {
  return [
    { name: 'anthropic', key: env.ANTHROPIC_API_KEY, models: CLAUDE_MODELS, call: callClaude },
    { name: 'groq #1', key: env.GROQ_API_KEY, models: GROQ_MODELS, call: callGroq },
    { name: 'groq #2', key: env.GROQ_API_KEY_2, models: GROQ_MODELS, call: callGroq },
    { name: 'gemini #1', key: env.GEMINI_API_KEY, models: GEMINI_MODELS, call: callGemini },
    { name: 'gemini #2', key: env.GEMINI_API_KEY_2, models: GEMINI_MODELS, call: callGemini },
  ]
}

export async function chat(req: ChatRequest, env: Env): Promise<ChatResult> {
  const deadline = Date.now() + TOTAL_BUDGET_MS
  let lastErr: unknown = new Error('no chat provider keys are set')
  for (const step of chain(env)) {
    const apiKey = step.key?.trim()
    if (!apiKey) continue
    for (const model of step.models) {
      if (Date.now() > deadline) throw lastErr
      try {
        return await step.call(req, model, apiKey)
      } catch (err) {
        lastErr = err
        console.error(`chat ${step.name} ${model}:`, (err as Error)?.message || err)
        // A rejected key won't work for its other models — move to the next key.
        const status = (err as ProviderError).status
        if (status === 401 || status === 403) break
      }
    }
  }
  throw lastErr
}
