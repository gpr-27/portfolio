// Contact-form handler — stores submissions in MongoDB (`contact_messages`)
// AND (if RESEND_API_KEY is set) emails a notification to the owner, with the
// visitor's address as reply-to so you can reply straight from Gmail.

import { getDb } from './mongo'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const OWNER_EMAIL = 'praneethg1830@gmail.com'

interface ContactBody {
  name?: string
  email?: string
  message?: string
  company?: string // honeypot
}
type Env = Record<string, string | undefined>

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )

async function notifyEmail(env: Env, m: { name: string; email: string; message: string }) {
  if (!env.RESEND_API_KEY) return // not configured → DB-only
  const to = env.CONTACT_TO || OWNER_EMAIL
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
        to: [to],
        reply_to: m.email,
        subject: `New portfolio message from ${m.name}`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#141413">
            <h2 style="font-weight:600">📬 New message from your portfolio</h2>
            <p><strong>Name:</strong> ${esc(m.name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></p>
            <p><strong>Message:</strong></p>
            <p style="white-space:pre-wrap;background:#faf9f5;border:1px solid #e6dfd8;border-radius:8px;padding:12px">${esc(
              m.message,
            )}</p>
            <p style="color:#6c6a64;font-size:13px">Reply to this email to respond to ${esc(m.name)} directly.</p>
          </div>`,
      }),
    })
  } catch {
    // best-effort — never block the response on email
  }
}

export async function handleContact(
  body: ContactBody,
  env: Env,
): Promise<{ ok: boolean; error?: string }> {
  if (body?.company) return { ok: true } // honeypot

  const name = String(body?.name ?? '').trim().slice(0, 200)
  const email = String(body?.email ?? '').trim().slice(0, 200)
  const message = String(body?.message ?? '').trim().slice(0, 5000)

  if (!name || !email || !message) return { ok: false, error: 'Please fill in every field.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'That email doesn’t look right.' }

  try {
    const db = await getDb(env)
    await db.collection('contact_messages').insertOne({ name, email, message, createdAt: new Date() })
  } catch {
    return { ok: false, error: 'Couldn’t send right now — please email me directly.' }
  }

  await notifyEmail(env, { name, email, message })
  return { ok: true }
}
