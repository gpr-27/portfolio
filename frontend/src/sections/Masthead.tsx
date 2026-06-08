import { profile, socials } from '../data/resume'
import { Reveal } from '../components/Reveal'
import { ArrowRight, socialIcons } from '../components/Icons'

export function Masthead() {
  return (
    <section className="mast" id="home">
      <div className="container mast__inner">
        <div className="mast__text">
          <Reveal>
            <span className="eyebrow mast__kicker">AI / ML Engineer · IIIT Tiruchirapalli</span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mast__title">
              Building intelligent systems, from <span className="coral">research</span> to
              production.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mast__lede">{profile.bio}</p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mast__cta">
              <a className="btn btn-primary btn-lg" href="#work">
                View selected work <ArrowRight width={18} height={18} />
              </a>
              <a className="btn btn-secondary btn-lg" href="#contact">
                Get in touch
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mast__socials">
              {socials.slice(0, 3).map((s) => {
                const Icon = socialIcons[s.icon]
                const ext = s.external
                return (
                  <a
                    key={s.label}
                    className="mast__social"
                    href={s.href}
                    target={ext ? '_blank' : undefined}
                    rel={ext ? 'noreferrer' : undefined}
                  >
                    <Icon width={17} height={17} />
                    <span>{s.handle}</span>
                  </a>
                )
              })}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mast__portrait">
          <img
            src={`${import.meta.env.BASE_URL}praneeth.jpg`}
            alt="Praneeth Reddy Gandra"
            width={750}
            height={1000}
            loading="eager"
          />
          <span className="mast__portrait-tag">
            <span className="status-dot" /> Open to internships
          </span>
        </Reveal>
      </div>
    </section>
  )
}
