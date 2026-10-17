import { SectionHeading } from '../components/SectionHeading'
import { IndexEntry } from '../components/IndexEntry'
import { projects } from '../data/projects'

export function Work() {
  return (
    <section className="section work" id="work">
      <div className="container">
        <SectionHeading
          eyebrow="Selected work"
          index="§ 02"
          title={
            <>
              Things I&rsquo;ve <span className="coral">built</span>
            </>
          }
          description="AI agents, fine-tuned models, RAG systems, computer-vision pipelines, and full-stack AI apps — every one linked to its source on GitHub. Open any entry to read the full case study."
        />

        <div className="index" role="list">
          {projects.map((p, i) => (
            <IndexEntry key={p.id} project={p} index={i} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
