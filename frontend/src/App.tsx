import { useCallback, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useLenis } from './lib/useLenis'
import { TopNav } from './components/TopNav'
import { Footer } from './components/Footer'
import { ScrollProgress } from './components/ScrollProgress'
import { CursorDot } from './components/CursorDot'
import { ChatAssistant } from './components/ChatAssistant'
import { Masthead } from './sections/Masthead'
import { Work } from './sections/Work'
import { Skills } from './sections/Skills'
import { About } from './sections/About'
import { Contact } from './sections/Contact'

export default function App() {
  const lenis = useLenis()

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      if (lenis) lenis.scrollTo(el, { offset: -72 })
      else el.scrollIntoView({ behavior: 'smooth' })
    },
    [lenis],
  )

  // smooth-scroll in-page #anchor links through Lenis
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const a = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')?.slice(1)
      if (!id || !document.getElementById(id)) return
      e.preventDefault()
      scrollTo(id)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [scrollTo])

  return (
    <MotionConfig reducedMotion="user">
      <CursorDot />
      <ScrollProgress />
      <TopNav scrollTo={scrollTo} />

      <main>
        <Masthead />
        <Work />
        <Skills />
        <About />
        <Contact />
      </main>

      <Footer />

      <ChatAssistant />
    </MotionConfig>
  )
}
