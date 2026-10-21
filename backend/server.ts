import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleChat } from './lib/chat-core.js'
import { handleContact } from './lib/contact-core.js'

// Locally, secrets come from the single root .env. On Vercel they come from
// Project Settings → Environment Variables (the file is never deployed).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true })

const app = express()
app.use(express.json({ limit: '1mb' }))

app.post('/api/chat', async (req, res) => {
  try {
    res.json(await handleChat(req.body || {}, process.env))
  } catch {
    // Non-200 makes the widget fall back to its offline answers.
    res.status(502).json({ error: 'chat unavailable' })
  }
})

app.post('/api/contact', async (req, res) => {
  try {
    const out = await handleContact(req.body || {}, process.env)
    res.status(out.ok ? 200 : 400).json(out)
  } catch {
    res.status(400).json({ ok: false, error: 'bad request' })
  }
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not found' })
})

export default app

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3000
  app.listen(port, () => console.log(`API on http://localhost:${port}`))
}
