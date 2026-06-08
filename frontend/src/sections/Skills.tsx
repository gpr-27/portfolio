import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { skillGroups } from '../data/resume'

export function Skills() {
  return (
    <section className="section skills" id="skills">
      <div className="container">
        <SectionHeading
          eyebrow="Toolkit"
          index="§ 02"
          title={
            <>
              Skills &amp; <span className="coral">technologies</span>
            </>
          }
          description="The stack I reach for across AI research, backend systems, and front-end work."
        />

        <div className="ledger">
          {skillGroups.map((g, i) => (
            <Reveal key={g.label} delay={(i % 4) * 0.04}>
              <div className="ledger__row">
                <span className="ledger__term">{g.label}</span>
                <span className="ledger__def">
                  {g.items.map((s) => (
                    <span key={s} className="badge">
                      {s}
                    </span>
                  ))}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
