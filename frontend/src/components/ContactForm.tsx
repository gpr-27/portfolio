import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { CONTACT_ENDPOINT, profile } from '../data/resume'
import { ArrowUpRight } from './Icons'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // honeypot — bots fill hidden fields
    if (data.get('company')) return

    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (!name || !email || !message) {
      setStatus('error')
      setError('Please fill in every field.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      setError('That email doesn’t look right.')
      return
    }

    try {
      setStatus('submitting')
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || 'Request failed')
      }
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error && err.message !== 'Request failed'
          ? err.message
          : `Couldn’t send — please email me at ${profile.email}.`,
      )
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        className="form-success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="form-success__check">✓</div>
        <h3>Message on its way</h3>
        <p>Thanks for reaching out — I’ll get back to you soon.</p>
        <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
          Send another
        </button>
      </motion.div>
    )
  }

  return (
    <form className="cform" onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        name="company"
        className="cform__hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <div className="cform__row">
        <label className="field">
          <span className="field__label">Name</span>
          <input name="name" type="text" placeholder="Your name" autoComplete="name" required />
        </label>
        <label className="field">
          <span className="field__label">Email</span>
          <input name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
        </label>
      </div>
      <label className="field">
        <span className="field__label">Message</span>
        <textarea name="message" rows={4} placeholder="Tell me about the opportunity…" required />
      </label>
      {status === 'error' && (
        <p className="cform__error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary cform__submit"
        disabled={status === 'submitting'}
        data-cursor
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
        <ArrowUpRight width={18} height={18} />
      </button>
    </form>
  )
}
