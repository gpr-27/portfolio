import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrandMark } from './BrandMark'
import { FormattedMessage } from './FormattedMessage'
import { buildKnowledge, CHAT_ENDPOINT, GREETING, localAnswer, SUGGESTIONS } from '../data/assistant'

interface Msg {
  role: 'assistant' | 'user'
  content: string
  // Model that generated this reply (assistant messages from the live API only).
  model?: string
}

function newSessionId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
  }
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // In-memory only → every visit AND every reload starts a fresh chat.
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const sessionId = useRef(newSessionId())
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, open, expanded])

  async function respond(history: Msg[]) {
    setBusy(true)
    try {
      if (CHAT_ENDPOINT) {
        const res = await fetch(CHAT_ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            sessionId: sessionId.current,
            knowledge: buildKnowledge(),
          }),
        })
        if (!res.ok) throw new Error('bad response')
        const data = await res.json()
        const reply = data.reply ?? data.answer ?? ''
        const model = typeof data.model === 'string' && data.model ? data.model : undefined
        setMessages((m) => [...m, { role: 'assistant', content: reply || '…', model }])
      } else {
        // Offline, on-page-only fallback with a natural beat.
        const last = history[history.length - 1]?.content ?? ''
        await new Promise((r) => setTimeout(r, 420))
        setMessages((m) => [...m, { role: 'assistant', content: localAnswer(last) }])
      }
    } catch {
      const last = history[history.length - 1]?.content ?? ''
      setMessages((m) => [...m, { role: 'assistant', content: localAnswer(last) }])
    } finally {
      setBusy(false)
    }
  }

  function send(text: string) {
    const value = text.trim()
    if (!value || busy) return
    const next: Msg[] = [...messages, { role: 'user', content: value }]
    setMessages(next)
    setInput('')
    void respond(next)
  }

  return (
    <>
      <button
        className={`chat-fab${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Ask the AI assistant'}
        data-cursor
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <>
            <BrandMark size={20} />
            <span>Ask me</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={`chat${expanded ? ' is-expanded' : ''}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Ask about Praneeth"
          >
            <header className="chat__head">
              <div className="chat__head-info">
                <span className="chat__id">
                  <BrandMark size={18} />
                  <span>
                    <strong>Ask about Praneeth</strong>
                  </span>
                </span>
              </div>

              <div className="chat__head-actions">
                <button
                  type="button"
                  className="chat__action-btn"
                  onClick={() => setExpanded((prev) => !prev)}
                  title={expanded ? 'Minimize chat size' : 'Expand chat window'}
                  aria-label={expanded ? 'Minimize chat size' : 'Expand chat window'}
                >
                  {expanded ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  )}
                </button>
                <button className="chat__close" onClick={() => setOpen(false)} aria-label="Close">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </header>

            <div className="chat__body" ref={bodyRef} data-lenis-prevent>
              {messages.map((m, i) => (
                <div key={i} className={`bubble bubble--${m.role}`}>
                  <FormattedMessage content={m.content} />
                  {m.model && <span className="bubble__model">{m.model}</span>}
                </div>
              ))}
              {busy && (
                <div className="bubble bubble--assistant bubble--typing" aria-label="Thinking">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              {messages.length <= 1 && !busy && (
                <div className="chat__suggest">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chat__chip" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="chat__input"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my work…"
                aria-label="Message"
              />
              <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
