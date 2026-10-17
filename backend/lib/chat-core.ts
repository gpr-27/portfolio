import {
  chat,
  DEFAULT_MODEL_ID,
  AVAILABLE_MODELS,
  type UnifiedUsage,
} from './groq.js'

// Chat handler used by the Express server (backend/server.ts) and the
// Vite dev middleware (vite.config.ts). One source of truth — no dupes.
// FACTS arrive per request as `knowledge` (built on the client from
// resume.ts + projects.ts), so nothing about Praneeth is hardcoded here.

const RULES = `You are the assistant on Praneeth Reddy Gandra's portfolio website.
Speak in the first person as Praneeth — warm, natural, and concise.

RULES (strict):
- Answer ONLY using the FACTS below and what's on his site. Do not invent anything.
- Greetings and small talk ("hi", "how are you?", "what can you do?") are fine — reply briefly and friendly, then invite a question about his work.
- If a question is genuinely off-topic or not about Praneeth, politely decline and steer back to his work.
- Keep responses well-structured and readable. When listing projects or skills, use clean bullet points with bold titles (e.g. "- **Project Name** — description").`

interface ChatBody {
  messages?: { role: string; content: string }[]
  sessionId?: string | null
  knowledge?: string
  model?: string
}

export interface ChatResponse {
  reply: string
  model?: string
  usage?: UnifiedUsage
}

export class ChatUnavailableError extends Error {
  constructor() {
    super('chat unavailable')
  }
}

type Env = Record<string, string | undefined>

let cached: unknown = null
async function logToMongo(env: Env, doc: Record<string, unknown>) {
  if (!env.MONGODB_URI) return
  try {
    const { MongoClient } = await import('mongodb')
    if (!cached) {
      const client = new MongoClient(env.MONGODB_URI)
      await client.connect()
      cached = client
    }
    await (cached as InstanceType<typeof MongoClient>)
      .db(env.MONGODB_DB || 'portfolio')
      .collection('chat_logs')
      .insertOne(doc)
  } catch {
    // best-effort logging — never block the reply
  }
}

export async function handleChat(body: ChatBody, env: Env): Promise<ChatResponse> {
  const { messages = [], sessionId = null, knowledge = '', model } = body
  const selectedModel = (model && AVAILABLE_MODELS[model]) ? model : DEFAULT_MODEL_ID

  const trimmed = messages.slice(-8).map((m) => ({
    role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: String(m.content).slice(0, 2000),
  }))

  const systemPrompt = `${RULES}\n\nFACTS:\n${String(knowledge).slice(0, 6000)}`

  let reply: string
  let usedModel = selectedModel
  let usage: UnifiedUsage | undefined

  try {
    const result = await chat(
      {
        model: selectedModel,
        messages: trimmed,
        system: systemPrompt,
        temperature: 0.5,
        maxTokens: 1024,
      },
      env
    )
    reply = result.text
    usedModel = result.model
    usage = result.usage
  } catch (err: unknown) {
    // Surface as an error so the widget falls back to its offline answers.
    console.error('Groq chat error:', (err as Error)?.message || err)
    throw new ChatUnavailableError()
  }

  const question = [...trimmed].reverse().find((m) => m.role === 'user')?.content ?? ''
  await logToMongo(env, {
    sessionId,
    question,
    answer: reply,
    model: usedModel,
    usage,
    createdAt: new Date(),
  })

  return { reply, model: usedModel, usage }
}
