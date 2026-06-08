import type { SVGProps } from 'react'
import type { IconKey } from '../data/resume'

type P = SVGProps<SVGSVGElement>

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const Github = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.52.1.71-.23.71-.5v-1.77c-2.92.64-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.41-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.34.1-2.8 0 0 .89-.28 2.91 1.08a10.1 10.1 0 0 1 5.3 0c2.02-1.36 2.9-1.08 2.9-1.08.58 1.46.22 2.53.11 2.8.68.74 1.09 1.68 1.09 2.83 0 4.04-2.46 4.93-4.8 5.19.38.33.71.97.71 1.96v2.9c0 .28.19.61.72.5A10.5 10.5 0 0 0 12 1.5Z" />
  </svg>
)

export const Linkedin = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)

export const Mail = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 6 9 6.5L21 6" />
  </svg>
)

export const Phone = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M6.6 3.5 8.3 7.2c.2.5.1 1-.3 1.4L6.6 10c.9 2 2.4 3.5 4.4 4.4l1.4-1.4c.4-.4.9-.5 1.4-.3l3.7 1.7c.5.2.8.7.7 1.3l-.5 2.7a1.3 1.3 0 0 1-1.3 1.1C9 19.8 4.2 15 4.2 8.6c0-.6.4-1.2 1-1.3l2.7-.5" />
  </svg>
)

export const ArrowUpRight = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const ArrowRight = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
)

export const Download = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
)

export const ChevronDown = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const Sparkles = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M12 3v4m0 10v4M5 12H1m22 0h-4M6.3 6.3 3.5 3.5m17 0-2.8 2.8M6.3 17.7l-2.8 2.8m17 0-2.8-2.8" />
    <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" fill="currentColor" stroke="none" />
  </svg>
)

export const Trophy = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4v1a3 3 0 0 0 3 3m10-4h3v1a3 3 0 0 1-3 3M9 21h6m-3-4v4" />
  </svg>
)

export const MapPin = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const GraduationCap = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M22 9 12 4 2 9l10 5 10-5Z" />
    <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 9v5" />
  </svg>
)

export const ExternalLink = (p: P) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M14 4h6v6m0-6L10 14M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
  </svg>
)

export const socialIcons: Record<IconKey, (p: P) => React.ReactElement> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone,
}
