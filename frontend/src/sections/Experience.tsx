import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { experience, type Experience as Xp } from '../data/resume'

function Row({ e }: { e: Xp }) {
  const [open, setOpen] = useState(false)
  return (
    <li className={`xp__row${open ? ' is-open' : ''}`}>
      <button className="xp__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="xp__title">
          {e.company}
          <span className="xp__role"> · {e.role}</span>
        </span>
        <span className="xp__focus mono">{e.focus}</span>
        <span className="xp__period mono">{e.period}</span>
        <span className="xp__toggle" aria-hidden>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 6l5 5 5-5" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="xp__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="xp__points">
              {e.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <div className="xp__stack">
              {e.stack.map((s) => (
                <span key={s} className="badge">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export function Experience() {
  return (
    <section className="section experience" id="experience">
      <div className="container">
        <SectionHeading
          eyebrow="Experience"
          index="§ 01"
          title={
            <>
              Where I&rsquo;ve <span className="coral">shipped</span>
            </>
          }
          description="Production ML serving, multi-agent LLM platforms, and research: three internships across quant finance, agentic AI, and IIT Madras. Open any role for the details."
        />

        <ol className="xp">
          {experience.map((e, i) => (
            <Reveal key={e.company} delay={i * 0.05}>
              <Row e={e} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
