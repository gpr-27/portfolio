import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Project, ProjectMetric } from '../data/projects'
import { ProjectLinks } from './ProjectLinks'
import { Trophy } from './Icons'

function fmt(m: ProjectMetric) {
  const num = m.decimals ? m.value.toFixed(m.decimals) : `${m.value}`
  return `${m.prefix ?? ''}${num}${m.suffix ?? ''}`
}

export function IndexEntry({
  project,
  index,
  defaultOpen = false,
}: {
  project: Project
  index: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const metrics: ProjectMetric[] = project.chart
    ? project.chart.items.map((i) => ({
        value: i.value,
        suffix: i.suffix ?? '%',
        decimals: i.value % 1 !== 0 ? 2 : 0,
        label: i.label,
      }))
    : project.metrics ?? []

  return (
    <div className={`entry${open ? ' is-open' : ''}`}>
      <button className="entry__row" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="entry__num mono">{String(index + 1).padStart(2, '0')}</span>
        <span className="entry__title">{project.title}</span>
        <span className="entry__kind">{project.kind}</span>
        <span className="entry__year mono">{project.period}</span>
        <span className="entry__toggle" aria-hidden>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" className="entry__plus-v" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="entry__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="entry__inner">
              <div className="entry__main">
                <p className="entry__tagline">{project.tagline}</p>

                {project.award && (
                  <p className="entry__award">
                    <Trophy width={14} height={14} /> {project.award}
                  </p>
                )}

                <div className="entry__case">
                  {project.problem && (
                    <p>
                      <span className="entry__label">Problem</span>
                      {project.problem}
                    </p>
                  )}
                  {project.approach && (
                    <p>
                      <span className="entry__label">Approach</span>
                      {project.approach}
                    </p>
                  )}
                  {project.outcome && (
                    <p>
                      <span className="entry__label">Result</span>
                      {project.outcome}
                    </p>
                  )}
                </div>

                <ul className="entry__highlights">
                  {project.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>

                <div className="entry__tags">
                  {project.stack.map((s) => (
                    <span key={s} className="badge">
                      {s}
                    </span>
                  ))}
                </div>

                <ProjectLinks links={project.links} compact />
              </div>

              {metrics.length > 0 && (
                <aside className="entry__side">
                  {metrics.map((m) => (
                    <div key={m.label} className="entry__metric">
                      <span className="entry__metric-val">{fmt(m)}</span>
                      <span className="entry__metric-label mono">{m.label}</span>
                    </div>
                  ))}
                </aside>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
