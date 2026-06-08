/* ============================================================
   RÉSUMÉ DATA — single source of truth for all site content.
   Sourced verbatim from praneeth_final_resume_2026.pdf.
   ============================================================ */

export type IconKey = 'github' | 'linkedin' | 'mail' | 'phone'

export interface SocialLink {
  label: string
  handle: string
  href: string
  icon: IconKey
  /** open in a new tab (external links + Gmail compose) */
  external?: boolean
}

/** Gmail web-compose URL — reliable everywhere (mailto needs a desktop mail app). */
export const gmailCompose = (to: string, subject = 'Hello Praneeth') =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`

export interface SkillGroup {
  label: string
  items: string[]
  feature?: boolean
}

export interface Certification {
  title: string
  issuer: string
  date: string
  href: string
}

export const profile = {
  name: 'Praneeth Reddy Gandra',
  roles: [
    'AI/ML Engineer',
    'LLM Fine-Tuning',
    'RAG Systems',
    'Computer Vision',
    'Full-Stack Developer',
  ],
  bio: 'Computer Science undergraduate at IIIT Tiruchirapalli specializing in applied AI. I fine-tune large language models, architect retrieval-augmented systems, and ship computer-vision pipelines — turning research-grade ideas into things that actually run.',
  email: 'praneethg1830@gmail.com',
  availability: 'Open to internships & research collaborations',
}

export const socials: SocialLink[] = [
  {
    label: 'GitHub',
    handle: 'gpr-27',
    href: 'https://github.com/gpr-27',
    icon: 'github',
    external: true,
  },
  {
    label: 'LinkedIn',
    handle: 'praneethgandra',
    href: 'https://www.linkedin.com/in/praneethgandra',
    icon: 'linkedin',
    external: true,
  },
  {
    label: 'Email',
    handle: 'praneethg1830@gmail.com',
    href: gmailCompose('praneethg1830@gmail.com'),
    icon: 'mail',
    external: true,
  },
  {
    label: 'Phone',
    handle: '+91 93927 56256',
    href: 'tel:+919392756256',
    icon: 'phone',
  },
]

export const education = {
  school: 'IIIT Tiruchirapalli',
  degree: 'B.Tech, Computer Science & Engineering',
  period: '2023 — 2027',
  location: 'Trichy, Tamil Nadu',
}

export const skillGroups: SkillGroup[] = [
  {
    label: 'AI / ML & LLMs',
    feature: true,
    items: [
      'PyTorch',
      'Hugging Face',
      'Keras',
      'Scikit-learn',
      'LangChain',
      'Unsloth',
      'FAISS',
      'PEFT',
      'QLoRA',
      'NLP',
      'Deep Learning',
      'Computer Vision',
      'RAG',
      'LLMs',
    ],
  },
  {
    label: 'Languages',
    items: ['Python', 'C / C++', 'Java', 'JavaScript', 'SQL'],
  },
  {
    label: 'Backend & APIs',
    items: ['FastAPI', 'REST APIs', 'Node.js', 'Express.js'],
  },
  {
    label: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React'],
  },
  {
    label: 'Databases',
    items: ['MongoDB', 'PostgreSQL', 'SQL', 'NoSQL'],
  },
  {
    label: 'Cloud & Dev Tools',
    items: ['Cloud Deployment', 'Git', 'GitHub', 'Linux', 'Streamlit'],
  },
  {
    label: 'AI Coding Tools',
    items: ['Cursor', 'GitHub Copilot', 'ChatGPT', 'Claude', 'Gemini'],
  },
  {
    label: 'Libraries',
    items: ['Pandas', 'NumPy', 'Matplotlib'],
  },
]


export const achievement = {
  title: '1st Place — Hackathon',
  org: 'IIIT Tiruchirapalli',
  year: '2025',
  points: [
    'Awarded 1st place among peer teams for conceptualizing and developing an AI-powered study assistant within a strict 72-hour timeframe.',
    'Demonstrated rapid prototyping by integrating NLP tools to optimize study schedules and personalize learning.',
  ],
}

export const certifications: Certification[] = [
  {
    title: 'Supervised Machine Learning',
    issuer: 'Coursera · Stanford / DeepLearning.AI',
    date: 'Jan 2025',
    href: 'https://coursera.org/verify/PMVZ9RCBY7RL',
  },
  {
    title: 'Crash Course on Python',
    issuer: 'Coursera · Google',
    date: 'Jul 2024',
    href: 'https://coursera.org/verify/XXWA74WABWKV',
  },
]

/** Contact form posts here → Vercel function → MongoDB (`contact_messages`). */
export const CONTACT_ENDPOINT =
  (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? '/api/contact'
export const RESUME_PATH = `${import.meta.env.BASE_URL}resume.pdf`
