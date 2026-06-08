import { useEffect, useRef, useState } from 'react'

/**
 * Aperture cursor — a single coral disc that tracks the pointer 1:1
 * (direct transform, no spring → zero lag) and morphs into a hollow
 * ring over interactive targets. Fine-pointer only.
 */
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setOn(true)
    document.body.classList.add('has-cursor')

    const move = (e: PointerEvent) => {
      const c = ref.current
      if (c) c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      const interactive = !!t?.closest(
        'a, button, [data-cursor], input, textarea, label, .entry__row',
      )
      ref.current?.classList.toggle('is-hover', interactive)
    }
    const down = () => ref.current?.classList.add('is-down')
    const up = () => ref.current?.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.body.classList.remove('has-cursor')
    }
  }, [])

  if (!on) return null
  return <div ref={ref} className="cursor" aria-hidden />
}
