import { gmailCompose, profile, RESUME_PATH, socials } from '../data/resume'
import { Reveal } from '../components/Reveal'
import { ContactForm } from '../components/ContactForm'
import { ArrowUpRight, Download, Mail, socialIcons } from '../components/Icons'

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <Reveal>
          <div className="callout">
            <div className="callout__text">
              <span className="eyebrow callout__kicker">Get in touch</span>
              <h2 className="callout__title">Let&rsquo;s build something thoughtful.</h2>
              <p className="callout__sub">
                {profile.availability}. Whether it&rsquo;s a role, a research idea, or a project —
                my inbox is open.
              </p>
            </div>
            <div className="callout__cta">
              <a
                className="btn btn-cream btn-lg"
                href={gmailCompose(profile.email)}
                target="_blank"
                rel="noreferrer"
              >
                <Mail width={18} height={18} /> Email me
              </a>
              <a
                className="btn callout__ghost btn-lg"
                href={RESUME_PATH}
                download="Praneeth_Reddy_Gandra_Resume.pdf"
              >
                <Download width={18} height={18} /> Résumé
              </a>
            </div>
          </div>
        </Reveal>

        <div className="contact__grid">
          <Reveal className="contact__info">
            <p className="contact__lede">Reach me directly —</p>
            <div className="contact__rows">
              {socials.map((s) => {
                const Icon = socialIcons[s.icon]
                const ext = s.external
                return (
                  <a
                    key={s.label}
                    className="contact__row"
                    href={s.href}
                    target={ext ? '_blank' : undefined}
                    rel={ext ? 'noreferrer' : undefined}
                  >
                    <Icon width={18} height={18} />
                    <span className="contact__row-text">
                      <strong>{s.label}</strong>
                      <em>{s.handle}</em>
                    </span>
                    <ArrowUpRight width={15} height={15} />
                  </a>
                )
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="contact__formwrap">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
