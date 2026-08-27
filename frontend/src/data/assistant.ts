/* ============================================================
   AI ASSISTANT — grounded ONLY in what's on this site.
   - CHAT_ENDPOINT: set to your Supabase Edge Function URL to use Groq.
   - Until then, localAnswer() is a smart offline fallback built from
     the same on-page data. It speaks in first person (as Praneeth),
     answers greetings + "what can you do", and REFUSES anything
     off-topic. It never discusses grades/GPA (not on the site).
   ============================================================ */

import { achievement, certifications, education, profile, skillGroups, socials } from './resume'
import { projects } from './projects'

export interface ModelOption {
  id: string
  name: string
  tag: string
}

export const AI_MODELS: ModelOption[] = [
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', tag: 'Fast' },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', tag: 'Smart' },
  { id: 'claude-opus-5', name: 'Claude Opus 5', tag: 'Reasoning' },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', tag: 'Accurate' },
]

export const DEFAULT_MODEL_ID = 'deepseek-v4-flash'

/**
 * Backend API path. Defaults to the same-origin `/api/chat`
 * (served via Express or Vite dev proxy). If the request
 * fails (e.g. local preview without backend), the widget
 * falls back to the offline demo answers below. Override via VITE_CHAT_ENDPOINT.
 * Only a PUBLIC path — all secrets stay server-side in the backend.
 */
export const CHAT_ENDPOINT =
  (import.meta.env.VITE_CHAT_ENDPOINT as string | undefined) ?? '/api/chat'

export const GREETING =
  'Hey, thanks for visiting! 👋 I’m Praneeth’s assistant — ask me about his projects, skills, education, or how to get in touch.'

export const SUGGESTIONS = [
  'What has he built?',
  'His AI/ML skills',
  'Education',
  'How can I reach him?',
]

const list = (arr: string[]) => arr.join(', ')

/**
 * Compiles a fact sheet from the SAME data that renders the site
 * (resume.ts + projects.ts) — the single source of truth. Sent to the
 * backend so the model is grounded without duplicating any facts here.
 */
export function buildKnowledge(): string {
  const skills = skillGroups.map((g) => `${g.label}: ${list(g.items)}`).join('; ')
  const projs = projects
    .map((p) => {
      const links = [
        p.links.demo && `demo ${p.links.demo}`,
        p.links.github && `code ${p.links.github}`,
        p.links.kaggle && `kaggle ${p.links.kaggle}`,
      ]
        .filter(Boolean)
        .join(', ')
      const metrics = p.metrics?.length
        ? ` [${p.metrics.map((m) => `${m.prefix ?? ''}${m.value}${m.suffix ?? ''} ${m.label}`).join(', ')}]`
        : ''
      return `- ${p.title} (${p.kind}, ${p.period}): ${p.tagline}${p.outcome ? ` ${p.outcome}` : ''}${metrics}${links ? ` — ${links}` : ''}`
    })
    .join('\n')
  const certs = certifications.map((c) => `${c.title} (${c.issuer}, ${c.date})`).join('; ')
  const social = socials.map((s) => `${s.label} ${s.handle}`).join(', ')

  return [
    `Name: ${profile.name}. Role: ${profile.roles[0]}.`,
    profile.bio,
    `Education: ${education.school} — ${education.degree}, ${education.period} (${education.location}).`,
    `Skills — ${skills}.`,
    `Projects:\n${projs}`,
    `Achievement: ${achievement.title} at ${achievement.org} (${achievement.year}).`,
    `Certifications: ${certs}.`,
    `Contact: ${profile.email}; ${social}. ${profile.availability}.`,
  ].join('\n')
}

function findProject(q: string) {
  return projects.find((p) => {
    if (q.includes(p.id)) return true
    const tokens = p.title.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 3)
    return tokens.some((t) => q.includes(t))
  })
}

/** Offline, on-page-only answer engine. Returns a first-person reply as Praneeth. */
export function localAnswer(raw: string): string {
  const q = raw.toLowerCase().trim()

  // Never expose grades / GPA — not shown on the site.
  if (/\b(g\.?p\.?a|cgpa|sgpa|grade|grades|marks?|percentage|cgp)\b/.test(q)) {
    return 'I don’t share grades or GPA here — but I’m happy to tell you about my projects, skills, or experience.'
  }

  // Greetings & small talk
  if (
    /\b(hi+|hey+|hello+|yo|namaste|hi+ya|heya|howdy|hru|sup)\b/.test(q) ||
    /(how (are|r|'?re) (you|u|ya|things)|how'?s (it going|life|things|everything)|good (morning|evening|afternoon|day)|what'?s up|wh?[au]ss?up|you good|nice to meet|thank)/.test(q)
  ) {
    return 'Hey! 👋 Doing great, thanks for asking. I can tell you about my projects, skills, education, achievements, or how to get in touch — what would you like to know?'
  }

  // Capabilities
  if (/(what can you|who are you|what do you do|help|how do you work)/.test(q)) {
    return 'I answer questions about Praneeth using only what’s on this site — projects, skills, education, achievements, and contact. Try “What has he built?” or “What are his AI/ML skills?”'
  }

  // A specific project
  const proj = findProject(q)
  if (proj) {
    const link = proj.links.demo
      ? ` Live demo: ${proj.links.demo}.`
      : proj.links.github
      ? ` Code: ${proj.links.github}.`
      : ''
    const result = proj.outcome ? ` ${proj.outcome}` : ''
    return `${proj.title} — ${proj.tagline}${result} Built with ${list(proj.stack)}.${link}`
  }

  // Projects overview
  if (/(projects?|work|built|build|made|portfolio|case stud)/.test(q)) {
    const featured = projects.filter((p) => p.featured).map((p) => p.title)
    return `I’ve built ${projects.length}+ projects. A few highlights: ${list(featured)}. Ask me about any one for the full case study.`
  }

  // Skills
  if (/(skill|tech|stack|technolog|languages?|tools?|framework|libraries|proficien|know)/.test(q)) {
    const lines = skillGroups.map((g) => `${g.label}: ${list(g.items)}`)
    return `My toolkit —\n${lines.join('\n')}`
  }

  // Education
  if (/(education|study|studies|college|university|iiit|degree|cse|b\.?tech|academ|school)/.test(q)) {
    return `${education.school} — ${education.degree}, ${education.period} (${education.location}).`
  }

  // Achievement
  if (/(achievement|hackathon|award|won|win|prize|recognition)/.test(q)) {
    return `${achievement.title} at ${achievement.org} (${achievement.year}) — for building an AI-powered study assistant in a 72-hour timeframe.`
  }

  // Certifications
  if (/(cert|certificat|coursera|course)/.test(q)) {
    return `Certifications: ${certifications.map((c) => `${c.title} (${c.issuer}, ${c.date})`).join('; ')}.`
  }

  // Contact / hiring
  if (/(contact|email|reach|hire|connect|linkedin|github|phone|touch|avail|internship|opportunit|resume|cv)/.test(q)) {
    const gh = socials.find((s) => s.icon === 'github')?.handle
    const li = socials.find((s) => s.icon === 'linkedin')?.handle
    return `You can reach me at ${profile.email}, on GitHub (${gh}), or LinkedIn (${li}). I’m ${profile.availability.toLowerCase()}.`
  }

  // Fit / hiring / "good enough for X role" — derived from data, no hardcoded facts
  if (/(intern|\brole\b|hire|fit\b|suitable|good (enough|fit)|right (person|candidate|fit)|why (should|hire)|recruit|candidate)/.test(q)) {
    const highlights = projects.filter((p) => p.featured).slice(0, 3).map((p) => p.title)
    const focus = skillGroups[0]?.items.slice(0, 4) ?? []
    return `I’d be a strong fit for applied-AI / ML roles — I work across ${list(focus)}. Recent highlights: ${list(highlights)}, plus ${achievement.title} (${achievement.org}, ${achievement.year}). Take a look at the Work section, or reach me at ${profile.email}.`
  }

  // About / focus
  if (/(about|who is|yourself|himself|background|introduce|tell me|focus|experience|fine.?tun|\bllm\b|\brag\b|computer vision|machine learning|\bai\b|\bml\b)/.test(q)) {
    return profile.bio
  }

  // Out of context → refuse
  return 'I can only answer questions about Praneeth — his projects, skills, education, achievements, or how to reach him. Try asking about one of those!'
}
