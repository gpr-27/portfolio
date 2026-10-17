import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { experience } from '../data/resume'

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
          description="Production ML serving, multi-agent LLM platforms, and research — three internships across quant finance, agentic AI, and IIT Madras."
        />

        <ol className="xp">
          {experience.map((e, i) => (
            <Reveal key={e.company} delay={i * 0.05}>
              <li className="xp__row">
                <div className="xp__meta">
                  <span className="xp__period mono">{e.period}</span>
                  <span className="xp__focus mono">{e.focus}</span>
                </div>
                <div className="xp__body">
                  <h3 className="xp__title">
                    {e.company}
                    <span className="xp__role"> · {e.role}</span>
                  </h3>
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
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
