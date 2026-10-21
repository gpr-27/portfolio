/* ============================================================
   AI ASSISTANT — grounded ONLY in what's on this site.
   - CHAT_ENDPOINT: API endpoint backed by Claude, with Groq and Gemini fallbacks.
   - Until then, localAnswer() is a smart offline fallback built from
     the same on-page data. It speaks in first person (as Praneeth),
     answers greetings + "what can you do", and REFUSES anything
     off-topic.
   ============================================================ */

import {
  achievement,
  certifications,
  coursework,
  education,
  experience,
  letter,
  profile,
  programs,
  skillGroups,
  socials,
} from './resume'
import { projects } from './projects'

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
  'Hey, thanks for visiting! I answer as Praneeth, from everything on this page. Ask me about my internships, projects, skills, education, or how to reach me.'

export const SUGGESTIONS = [
  'Where have you interned?',
  'What have you built?',
  'Which AI/ML tools do you use?',
  'Tell me about your education',
  'How can I reach you?',
]

const list = (arr: string[]) => arr.join(', ')

/**
 * Compiles a fact sheet from the SAME data that renders the site
 * (resume.ts + projects.ts), so the assistant knows everything the page
 * shows and nothing else. Sent to the backend with every question.
 */
export function buildKnowledge(): string {
  const projs = projects
    .map((p) => {
      const links = [
        p.links.demo && `live demo ${p.links.demo}`,
        p.links.github && `source ${p.links.github}`,
        p.links.kaggle && `Kaggle ${p.links.kaggle}`,
      ].filter(Boolean)
      const metrics = p.metrics?.map((m) => `${m.prefix ?? ''}${m.value}${m.suffix ?? ''} ${m.label}`) ?? []
      const chart = p.chart?.items.map((c) => `${c.label} ${c.value}${c.suffix ?? ''}`) ?? []
      return [
        `### ${p.title} (${p.kind}, ${p.period})${p.featured ? ' [featured]' : ''}`,
        p.tagline,
        p.award && `Award: ${p.award}.`,
        p.problem && `Problem: ${p.problem}`,
        p.approach && `Approach: ${p.approach}`,
        p.outcome && `Outcome: ${p.outcome}`,
        `Highlights: ${p.highlights.join('; ')}.`,
        metrics.length > 0 && `Figures: ${list(metrics)}.`,
        chart.length > 0 && `Results: ${list(chart)}.`,
        `Built with: ${list(p.stack)}.`,
        links.length > 0 && `Links: ${list(links as string[])}.`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')

  const work = experience
    .map((e) => `### ${e.role} at ${e.company} (${e.period}, focus: ${e.focus})\n${e.points.map((p) => `- ${p}`).join('\n')}\nWorked with: ${list(e.stack)}.`)
    .join('\n\n')

  const courses = Object.entries(coursework)
    .map(([group, items]) => `${group}: ${list(items)}`)
    .join('; ')

  return [
    `# ${profile.name}`,
    `Roles: ${list(profile.roles)}. ${profile.availability}.`,
    profile.bio,
    letter.opening,
    letter.closing,
    `## Education\n${education.school}, ${education.degree}, ${education.period} (${education.location}). ${education.grades}.\nCoursework: ${courses}.`,
    `## Experience\n${work}`,
    `## Projects (${projects.length})\n${projs}`,
    `## Headline results on the site\n91.71% accuracy after fine-tuning Llama 3.2 3B on financial tweets (vs 42% with 3-shot prompting); 99.45% binary accuracy catching FDM 3D-print defects with CNNs.`,
    `## Skills\n${skillGroups.map((g) => `${g.label}: ${list(g.items)}`).join('\n')}`,
    `## Achievements\n${achievement.title} at ${achievement.org} (${achievement.year}): ${achievement.points.join(' ')}`,
    `## Programs\n${programs.map((p) => `${p.title} (${p.org}, ${p.date}): ${p.note}`).join('\n')}`,
    `## Certifications\n${certifications.map((c) => `${c.title} (${c.issuer}, ${c.date}) ${c.href}`).join('\n')}`,
    `## Contact\nEmail ${profile.email}. ${socials.map((s) => `${s.label}: ${s.handle} (${s.href})`).join('. ')}. Résumé PDF: /resume.pdf. There is also a contact form at the bottom of the page.`,
  ].join('\n\n')
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

  if (/\b(g\.?p\.?a|cgpa|sgpa|grade|grades|marks?|percentage|cgp)\b/.test(q)) {
    return `At ${education.school}: ${education.grades}.`
  }

  // Internships / work experience
  if (/(experience|intern|internship|worked|company|job|quant singularity|magnivo|iit madras)/.test(q)) {
    const lines = experience.map((e) => `${e.role} at ${e.company} (${e.period}) — ${e.points[0]}`)
    return `My experience —\n${lines.join('\n')}`
  }

  // Greetings & small talk
  if (
    /\b(hi+|hey+|hello+|yo|namaste|hi+ya|heya|howdy|hru|sup)\b/.test(q) ||
    /(how (are|r|'?re) (you|u|ya|things)|how'?s (it going|life|things|everything)|good (morning|evening|afternoon|day)|what'?s up|wh?[au]ss?up|you good|nice to meet|thank)/.test(q)
  ) {
    return 'Hey! Doing great, thanks for asking. I can tell you about my projects, skills, education, achievements, or how to get in touch — what would you like to know?'
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
    return `I’ve built ${projects.length} projects. A few highlights: ${list(featured)}. Ask me about any one for the full case study.`
  }

  // Skills
  if (/(skill|tech|stack|technolog|languages?|tools?|framework|libraries|proficien|know)/.test(q)) {
    const lines = skillGroups.map((g) => `${g.label}: ${list(g.items)}`)
    return `My toolkit —\n${lines.join('\n')}`
  }

  // Education
  if (/(education|study|studies|college|university|iiit|degree|cse|b\.?tech|academ|school)/.test(q)) {
    return `${education.school} — ${education.degree}, ${education.period} (${education.location}). ${education.grades}.`
  }

  // Achievement
  if (/(achievement|hackathon|award|won|win|prize|recognition|amazon|summer school)/.test(q)) {
    return `${achievement.title} at ${achievement.org} (${achievement.year}) — for building an AI-powered study assistant in a 72-hour timeframe. Also: ${programs.map((p) => `${p.title} (${p.date})`).join('; ')}.`
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
  if (/(about|who is|yourself|himself|background|introduce|tell me|focus|fine.?tun|\bllm\b|\brag\b|computer vision|machine learning|\bai\b|\bml\b)/.test(q)) {
    return profile.bio
  }

  // Out of context → refuse
  return 'I can only answer questions about Praneeth — his experience, projects, skills, education, achievements, or how to reach him. Try asking about one of those!'
}
