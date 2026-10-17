// Groq chat provider (OpenAI-compatible REST, no SDK needed).
// Used by chat-core.ts for the Express server and the Vite dev middleware.
// The key stays server-side: GROQ_API_KEY from .env / the host's env vars.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const AVAILABLE_MODELS: Record<string, string> = {
  'openai/gpt-oss-120b': 'GPT-OSS 120B',
  'openai/gpt-oss-20b': 'GPT-OSS 20B',
  'qwen/qwen3.8-27b': 'Qwen 3.8 27B',
}

export const DEFAULT_MODEL_ID = 'openai/gpt-oss-120b'

// On rate limits / outages, try the next model down before giving up.
const FALLBACK_ORDER = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b']

export interface UnifiedUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface ChatRequest {
  model: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  system: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResult {
  text: string
  model: string
  usage?: UnifiedUsage
}

type Env = Record<string, string | undefined>

async function callGroq(req: ChatRequest, model: string, apiKey: string): Promise<ChatResult> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: req.system }, ...req.messages],
      temperature: req.temperature ?? 0.5,
      // gpt-oss spends tokens on hidden reasoning — leave headroom.
      max_tokens: req.maxTokens ?? 1024,
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw Object.assign(new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`), { status: res.status })
  }
  const data = await res.json()
  const text = String(data.choices?.[0]?.message?.content ?? '').trim()
  if (!text) throw new Error(`Groq ${model}: empty completion`)
  return {
    text,
    model,
    usage: data.usage && {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  }
}

export async function chat(req: ChatRequest, env: Env): Promise<ChatResult> {
  const apiKey = env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const order = [req.model, ...FALLBACK_ORDER.filter((m) => m !== req.model)]
  let lastErr: unknown
  for (const model of order) {
    try {
      return await callGroq(req, model, apiKey)
    } catch (err) {
      lastErr = err
      const status = (err as { status?: number }).status
      // Bad key / bad request won't be fixed by another model.
      if (status === 400 || status === 401 || status === 403) break
    }
  }
  throw lastErr
}
