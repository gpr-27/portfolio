import { chat, type UnifiedUsage } from './providers.js'

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
}

export interface ChatResponse {
  reply: string
  provider?: string
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
  const { messages = [], sessionId = null, knowledge = '' } = body

  const trimmed = messages.slice(-8).map((m) => ({
    role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: String(m.content).slice(0, 2000),
  }))

  const systemPrompt = `${RULES}\n\nFACTS:\n${String(knowledge).slice(0, 24000)}`

  let result: Awaited<ReturnType<typeof chat>>
  try {
    result = await chat({ messages: trimmed, system: systemPrompt }, env)
  } catch (err: unknown) {
    // Surface as an error so the widget falls back to its offline answers.
    console.error('chat error:', (err as Error)?.message || err)
    throw new ChatUnavailableError()
  }
  const { text: reply, provider, model, usage } = result

  const question = [...trimmed].reverse().find((m) => m.role === 'user')?.content ?? ''
  await logToMongo(env, {
    sessionId,
    question,
    answer: reply,
    provider,
    model,
    usage,
    createdAt: new Date(),
  })

  return { reply, provider, model, usage }
}
