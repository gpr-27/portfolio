export type ThemeId = 'light' | 'dark'

export interface ThemeMeta {
  id: ThemeId
  name: string
}

export const THEMES: ThemeMeta[] = [
  { id: 'light', name: 'Cream' },
  { id: 'dark', name: 'Night' },
]

export const DEFAULT_THEME: ThemeId = 'light'

export function isThemeId(value: string | null): value is ThemeId {
  return value === 'light' || value === 'dark'
}
