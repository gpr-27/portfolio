/* ============================================================
   RÉSUMÉ DATA — single source of truth for all site content.
   Sourced verbatim from Praneeth_Reddy_Gandra_Latest_Resume.pdf.
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

export interface Experience {
  company: string
  role: string
  period: string
  /** short focus tag shown beside the role */
  focus: string
  points: string[]
  stack: string[]
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
    'AI Agents',
    'LLM Fine-Tuning',
    'RAG Systems',
    'Backend & Full-Stack',
  ],
  bio: 'Computer Science undergraduate at IIIT Tiruchirappalli who likes taking AI from idea to deployed product: fine-tuning and serving models, building agentic RAG and tool-calling systems, and shipping backend and full-stack systems, including a real-time messaging platform.',
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
    handle: 'praneeth-gandra',
    href: 'https://www.linkedin.com/in/praneeth-gandra-411ab3309/',
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
  period: '2023 – 2027 (expected)',
  location: 'Trichy, Tamil Nadu',
  grades: 'CGPA 8.96 / 10',
}

export const experience: Experience[] = [
  {
    company: 'Quant Singularity',
    role: 'AI/ML Intern',
    period: 'Jun 2026 – Present',
    focus: 'Quant ML',
    points: [
      'Built a forecast-aggregation layer for multi-strategy trading signals: ensemble voting, conflict resolution, regime-aware routing.',
      'Served XGBoost/LightGBM models via an MLflow pipeline with schema contracts and offline replay at p99 latency under 50 ms.',
    ],
    stack: ['XGBoost', 'LightGBM', 'MLflow', 'Python'],
  },
  {
    company: 'Magnivo AI',
    role: 'Agentic AI Intern',
    period: 'May 2026 – Jun 2026',
    focus: 'Multi-Agent Systems',
    points: [
      'Shipped a production multi-agent GTM platform where specialised LLM agents discover, enrich, and contact leads end to end.',
      'Engineered the tool-calling layer (structured outputs, schema validation, retry/fallback) and integrated SerpAPI, Hunter, Gmail, and Instantly on a Next.js, Clerk, Supabase, and Render stack.',
    ],
    stack: ['LLM Agents', 'Tool Calling', 'Next.js', 'Clerk', 'Supabase', 'Render'],
  },
  {
    company: 'IIT Madras',
    role: 'Research Intern',
    period: 'Jan 2026 – Apr 2026',
    focus: 'Surface Metrology',
    points: [
      'Benchmarked mean-line fitting vs. morphological filtering for additive-manufactured surface roughness on 19 profiler scans.',
      'Built the NumPy/SciPy evaluation pipeline; found mean-line fitting 3x more consistent, cutting Sa variability from 77.5% to 23.7%.',
    ],
    stack: ['Python', 'NumPy', 'SciPy', 'Research'],
  },
]

export const skillGroups: SkillGroup[] = [
  {
    label: 'LLMs & Agents',
    feature: true,
    items: [
      'RAG',
      'FAISS',
      'Fine-Tuning (QLoRA, PEFT, Unsloth)',
      'Hugging Face',
      'Tool Calling',
      'Structured Outputs',
      'MCP',
      'LangChain',
      'LangGraph',
      'Vercel AI SDK',
      'Prompt Engineering',
      'Evals & Guardrails',
    ],
  },
  {
    label: 'ML & Data Science',
    feature: true,
    items: [
      'PyTorch',
      'Scikit-learn',
      'XGBoost',
      'LightGBM',
      'Pandas',
      'NumPy',
      'SciPy',
      'MLflow',
      'Computer Vision',
      'NLP',
    ],
  },
  {
    label: 'Backend & APIs',
    items: [
      'Node.js',
      'Express.js',
      'Fastify',
      'FastAPI',
      'REST API design',
      'WebSockets (Socket.IO)',
      'SSE',
      'OAuth 2.1 / PKCE',
    ],
  },
  {
    label: 'Databases',
    items: ['PostgreSQL', 'Redis', 'MongoDB', 'Supabase'],
  },
  {
    label: 'Frontend & DevOps',
    items: ['React', 'Next.js', 'Docker', 'Git', 'GitHub Actions (CI)', 'Linux', 'Vercel', 'Render'],
  },
  {
    label: 'Languages',
    items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'SQL'],
  },
  {
    label: 'Core CS',
    items: [
      'Data Structures & Algorithms',
      'OOP',
      'Concurrency',
      'System Design',
      'Idempotency & Ordering',
      'Retries',
    ],
  },
]

export const coursework = {
  'AI & Mathematics': [
    'Artificial Intelligence',
    'Introduction to LLMs',
    'Data Mining & Data Warehousing',
    'Linear Algebra',
    'Probability & Statistics',
    'Operations Research',
  ],
  'Core CS & Systems': [
    'Data Structures',
    'Design & Analysis of Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Computer Networks',
    'Object-Oriented Programming',
    'Compiler Design',
    'Software Engineering',
    'Automata & Formal Languages',
    'Discrete Structures',
  ],
}

export const achievement = {
  title: '1st Place, Hackathon',
  org: 'IIIT Tiruchirapalli',
  year: 'Oct 2025',
  points: [
    'Built an AI study assistant in a 72-hour hackathon; it grew into Study Assistant Hub.',
  ],
}

export const programs = [
  {
    title: 'Amazon ML Summer School 2026',
    org: 'Amazon',
    date: 'Jul 2026 – Aug 2026',
    note: 'Selected for Amazon’s competitive ML training programme.',
  },
]

export const certifications: Certification[] = [
  {
    title: 'Machine Learning Specialization',
    issuer: 'Coursera · Stanford / DeepLearning.AI',
    date: 'May 2025',
    href: 'https://coursera.org/share/4677e2b106338136fc2043f52c5228bc',
  },
  {
    title: 'Crash Course on Python',
    issuer: 'Coursera · Google',
    date: 'Jul 2024',
    href: 'https://www.coursera.org/account/accomplishments/verify/XXWA74WABWKV',
  },
]

/** The About letter, in the first person. Shown on the page and given to the assistant. */
export const letter = {
  opening:
    'I’m Praneeth, a computer science student at IIIT Tiruchirappalli (B.Tech, 2023–2027). I hold a CGPA of 8.96.',
  closing:
    'I’m looking for internships and research collaborations in applied AI. If you’re building with models, I would like to hear from you.',
  signoff: 'AI/ML engineer, Tiruchirappalli',
}

/** Contact form posts here → Vercel function → MongoDB (`contact_messages`). */
export const CONTACT_ENDPOINT =
  (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? '/api/contact'
export const RESUME_PATH = `${import.meta.env.BASE_URL}resume.pdf`
