import { profile, socials } from '../data/resume'
import { BrandMark } from './BrandMark'

const index = [
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__word">
            <BrandMark size={24} className="footer__mark" />
            Praneeth Reddy Gandra
          </span>
          <p className="footer__tag">
            AI/ML engineer building intelligent systems, from research to production.
          </p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>Index</h4>
            {index.map((l) => (
              <a key={l.id} href={`#${l.id}`}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="footer__col">
            <h4>Elsewhere</h4>
            {socials.map((s) => {
              const ext = s.external
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={ext ? '_blank' : undefined}
                  rel={ext ? 'noreferrer' : undefined}
                >
                  {s.label}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container footer__bar">
        <span className="mono">© 2026 {profile.name}</span>
        <span className="mono">Built with React · Cormorant · Inter</span>
      </div>
    </footer>
  )
}
