import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeSwitcher'

const links = [
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
const SECTION_IDS = ['home', 'work', 'skills', 'about', 'contact']

interface Props {
  scrollTo: (id: string) => void
}

export function TopNav({ scrollTo }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const go = (id: string) => {
    scrollTo(id)
    setOpen(false)
  }

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav__inner container">
        <button className="brand" onClick={() => go('home')} aria-label="Back to top">
          <BrandMark size={22} className="brand__mark" />
          <span className="brand__name">Praneeth Reddy Gandra</span>
        </button>

        <nav className="nav__menu" aria-label="Primary">
          {links.map((l) => (
            <button
              key={l.id}
              className={`nav__link${active === l.id ? ' is-active' : ''}`}
              onClick={() => go(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="nav__right">
          <ThemeToggle />
          <button className="btn btn-primary btn-sm nav__cta" onClick={() => go('contact')}>
            Get in touch
          </button>
          <button
            className={`nav__burger${open ? ' is-open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav__sheet"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Mobile"
          >
            {links.map((l) => (
              <button
                key={l.id}
                className={`nav__sheet-link${active === l.id ? ' is-active' : ''}`}
                onClick={() => go(l.id)}
              >
                {l.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
