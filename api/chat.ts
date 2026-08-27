import type { IncomingMessage, ServerResponse } from 'http'
import { handleChat } from '../backend/lib/chat-core.js'

export const config = {
  regions: ['sin1'],
}

export default async function handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  try {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        body = {}
      }
    } else if (!body) {
      const buffers: Buffer[] = []
      for await (const chunk of req) {
        buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }
      const raw = Buffer.concat(buffers).toString()
      body = raw ? JSON.parse(raw) : {}
    }

    const out = await handleChat(body || {}, process.env)
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(out))
  } catch (err: unknown) {
    res.statusCode = 500
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal Server Error' }))
  }
}
