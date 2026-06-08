import { achievement, certifications, education, profile } from '../data/resume'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { CodeWindow } from '../components/CodeWindow'
import { ExternalLink, GraduationCap, Trophy } from '../components/Icons'

export function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <SectionHeading
          eyebrow="About"
          index="§ 03"
          title={
            <>
              Turning <span className="coral">research-grade AI</span> into things that run.
            </>
          }
        />

        <div className="about__grid">
          <div className="about__lead">
            <Reveal>
              <p className="about__p-lead">{profile.bio}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="about__p">
                I like the full arc of a problem — reading the paper, fine-tuning the model,
                wiring the retrieval, and shipping the interface someone actually clicks. Most of
                my work pairs a real ML core with a clean product around it, and I care as much
                about the 99th-percentile latency as the first-pixel polish.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <CodeWindow
                filename="finetune.py"
                lang="python"
                className="about__code"
                footer="▸ trainer · 4-bit · QLoRA r=16 · loss 0.41"
              >
                <span className="tok-com"># Fine-tune Llama 3.2 (3B) with QLoRA + Unsloth</span>
                {'\n'}
                <span className="tok-kw">from</span> unsloth <span className="tok-kw">import</span> FastLanguageModel
                {'\n\n'}
                model, tokenizer = FastLanguageModel.<span className="tok-fn">from_pretrained</span>(
                {'\n'}
                {'    '}model_name=<span className="tok-str">"unsloth/Llama-3.2-3B-bnb-4bit"</span>,
                {'\n'}
                {'    '}load_in_4bit=<span className="tok-kw">True</span>,
                {'\n'}
                )
                {'\n\n'}
                model = FastLanguageModel.<span className="tok-fn">get_peft_model</span>(
                {'\n'}
                {'    '}model, r=<span className="tok-num">16</span>, lora_alpha=<span className="tok-num">16</span>,
                {'\n'}
                {'    '}target_modules=[<span className="tok-str">"q_proj"</span>, <span className="tok-str">"v_proj"</span>],
                {'\n'}
                )  <span className="tok-com"># 0.5% of params, 4× less VRAM</span>
              </CodeWindow>
            </Reveal>
          </div>

          <aside className="about__side">
            <Reveal>
              <div className="rec">
                <div className="rec__head">
                  <GraduationCap width={18} height={18} /> Education
                </div>
                <strong className="rec__title">{education.school}</strong>
                <span className="rec__sub">{education.degree}</span>
                <span className="rec__meta mono">
                  {education.period} · {education.location}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="rec rec--coral">
                <div className="rec__head">
                  <Trophy width={18} height={18} /> Recognition
                </div>
                <strong className="rec__title">{achievement.title}</strong>
                <span className="rec__sub">
                  {achievement.org} · {achievement.year}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="rec">
                <div className="rec__head">Certifications</div>
                {certifications.map((c) => (
                  <a key={c.title} className="rec__cert" href={c.href} target="_blank" rel="noreferrer">
                    <span>
                      <strong>{c.title}</strong>
                      <em>
                        {c.issuer} · {c.date}
                      </em>
                    </span>
                    <ExternalLink width={16} height={16} />
                  </a>
                ))}
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  )
}
