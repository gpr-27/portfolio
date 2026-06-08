import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_THEME, isThemeId, type ThemeId } from './themes'

const THEME_COLOR: Record<ThemeId, string> = {
  light: '#faf9f5',
  dark: '#181715',
}

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId, origin?: { x: number; y: number }) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'theme'

function getInitialTheme(): ThemeId {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute('data-theme')
    if (isThemeId(current)) return current
  }
  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(getInitialTheme)

  const apply = useCallback((id: ThemeId) => {
    document.documentElement.setAttribute('data-theme', id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* ignore quota / privacy mode */
    }
    setThemeState(id)
    const tc = document.querySelector('meta[name="theme-color"]')
    if (tc) tc.setAttribute('content', THEME_COLOR[id])
  }, [])

  const setTheme = useCallback(
    (id: ThemeId, origin?: { x: number; y: number }) => {
      if (id === theme) return

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const startViewTransition = (
        document as Document & {
          startViewTransition?: (cb: () => void) => { ready: Promise<void> }
        }
      ).startViewTransition

      if (typeof startViewTransition !== 'function' || reduce) {
        apply(id)
        return
      }

      const x = origin?.x ?? window.innerWidth - 64
      const y = origin?.y ?? 80
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const transition = startViewTransition.call(document, () => apply(id))
      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 620,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
    },
    [theme, apply],
  )

  // Keep the DOM attribute in sync on first mount (covers SSR / hydration edge).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
