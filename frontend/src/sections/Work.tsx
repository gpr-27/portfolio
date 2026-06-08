import { SectionHeading } from '../components/SectionHeading'
import { IndexEntry } from '../components/IndexEntry'
import { projects } from '../data/projects'

export function Work() {
  return (
    <section className="section work" id="work">
      <div className="container">
        <SectionHeading
          eyebrow="Selected work"
          index="§ 01"
          title={
            <>
              Things I&rsquo;ve <span className="coral">built</span>
            </>
          }
          description="Fine-tuned models, RAG systems, computer-vision pipelines, and full-stack AI apps — most with live demos and source. Open any entry to read the full case study."
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
