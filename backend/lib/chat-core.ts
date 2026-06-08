// Chat handler used by the Express server (backend/server.ts) and the
// Vite dev middleware (vite.config.ts). One source of truth — no dupes.
// FACTS arrive per request as `knowledge` (built on the client from
// resume.ts + projects.ts), so nothing about Praneeth is hardcoded here.

const MODEL = 'llama-3.3-70b-versatile'

const RULES = `You are the assistant on Praneeth Reddy Gandra's portfolio website.
Speak in the first person as Praneeth — warm, natural, and concise.

RULES (strict):
- Answer ONLY using the FACTS below and what's on his site. Do not invent anything.
- Greetings and small talk ("hi", "how are you?", "what can you do?") are fine — reply briefly and friendly, then invite a question about his work.
- If a question is genuinely off-topic or not about Praneeth, politely decline and steer back to his work.
- NEVER reveal or estimate grades, GPA, CGPA, marks, or percentages — that is not public.
- Keep answers to a few sentences. No markdown headings.`

interface ChatBody {
  messages?: { role: string; content: string }[]
  sessionId?: string | null
  knowledge?: string
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

export async function handleChat(body: ChatBody, env: Env): Promise<{ reply: string }> {
  const { messages = [], sessionId = null, knowledge = '' } = body
  const trimmed = messages.slice(-8).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content).slice(0, 2000),
  }))

  const systemPrompt = `${RULES}\n\nFACTS:\n${String(knowledge).slice(0, 6000)}`

  const groq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 500,
      messages: [{ role: 'system', content: systemPrompt }, ...trimmed],
    }),
  })
  const data = await groq.json()
  const reply: string =
    data?.choices?.[0]?.message?.content ?? 'Sorry — I had trouble answering just now.'

  const question = [...trimmed].reverse().find((m) => m.role === 'user')?.content ?? ''
  await logToMongo(env, { sessionId, question, answer: reply, createdAt: new Date() })

  return { reply }
}
