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
    'Generative AI',
  ],
  bio: 'Computer Science undergraduate at IIIT Tiruchirapalli, passionate about machine learning, generative AI, and AI agents. I train and fine-tune models, build LLM-powered agents and RAG pipelines, and develop end-to-end ML solutions for real-world problems.',
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
  period: '2023 — 2027',
  location: 'Trichy, Tamil Nadu',
  grades: 'CGPA 8.96 / 10 · Semester 5 GPA 9.38 / 10',
}

export const experience: Experience[] = [
  {
    company: 'Quant Singularity',
    role: 'AI/ML Intern',
    period: 'Jun 2026 — Present',
    focus: 'Quant ML',
    points: [
      'Built a production forecast aggregation layer for multi-strategy trading signals using weighted ensemble voting, conflict resolution, and regime-aware routing.',
      'Integrated production XGBoost and LightGBM models with an MLflow-based serving pipeline, enabling low-latency online inference with offline fallback.',
      'Defined feature-schema contracts, offline replay pipelines, and inference APIs over structured market data; validated with 368 automated pytest cases while meeting a p99 latency under 50 ms.',
    ],
    stack: ['XGBoost', 'LightGBM', 'MLflow', 'Python', 'pytest'],
  },
  {
    company: 'Magnivo AI',
    role: 'Agentic AI Intern',
    period: 'May 2026 — Jun 2026',
    focus: 'Multi-Agent Systems',
    points: [
      'Shipped a production multi-agent GTM automation platform built on specialized LLM agents for lead discovery, enrichment, personalized outreach, and campaign execution.',
      'Engineered the prompt engineering and tool-calling layer behind each agent, adding structured outputs, schema validation, and retry/fallback handling to keep multi-step runs reliable on unstructured web data.',
      'Orchestrated agent workflows with shared state and integrations including SerpAPI, Hunter, Gmail, and Instantly; validated production reliability with 152 automated tests.',
      'Integrated the platform with Next.js, Clerk, Supabase, and Render, enabling CRM synchronization, automated outreach campaigns, and engagement analytics.',
    ],
    stack: ['LLM Agents', 'Tool Calling', 'Next.js', 'Clerk', 'Supabase', 'Render'],
  },
  {
    company: 'IIT Madras',
    role: 'Research Intern',
    period: 'Jan 2026 — Apr 2026',
    focus: 'Surface Metrology',
    points: [
      'Researched additive-manufactured surface metrology, evaluating nonlinear least-squares mean-line fitting and morphological filtering for surface roughness characterization.',
      'Developed an end-to-end Python evaluation pipeline using NumPy and SciPy to benchmark both methods across 19 stainless-steel optical profiler scans with standardized preprocessing.',
      'Found mean-line fitting achieved 3× higher consistency than envelope filtering, reducing Sa variability from 77.5% to 23.7% and identifying failure cases on spatter-heavy surfaces.',
    ],
    stack: ['Python', 'NumPy', 'SciPy', 'Research'],
  },
]

export const skillGroups: SkillGroup[] = [
  {
    label: 'GenAI & LLMs',
    feature: true,
    items: [
      'Prompt Engineering',
      'LLM APIs (OpenAI, Claude, Gemini)',
      'Tool Calling',
      'MCP',
      'RAG',
      'Agentic RAG',
      'FAISS',
      'Fine-Tuning (PEFT, QLoRA)',
      'Hugging Face',
    ],
  },
  {
    label: 'Agentic AI',
    feature: true,
    items: [
      'Multi-Agent Systems',
      'Agent Orchestration',
      'LangChain',
      'LangGraph',
      'Claude Agent SDK',
      'Vercel AI SDK',
    ],
  },
  {
    label: 'Machine Learning',
    items: [
      'PyTorch',
      'TensorFlow',
      'Scikit-learn',
      'NumPy',
      'Pandas',
      'NLP',
      'Computer Vision',
      'Transfer Learning',
    ],
  },
  {
    label: 'Languages',
    items: ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    label: 'Web & Backend',
    items: ['FastAPI', 'Node.js', 'Express.js', 'REST APIs', 'React', 'Next.js'],
  },
  {
    label: 'Databases & Tools',
    items: [
      'MongoDB',
      'PostgreSQL',
      'Supabase',
      'Redis',
      'Git',
      'Docker',
      'Linux',
      'GitHub Actions',
      'Vercel',
      'Render',
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
  title: '1st Place — Hackathon',
  org: 'IIIT Tiruchirapalli',
  year: '2025',
  points: [
    'Designed and built an AI study assistant in 72 hours with conversational NLP for personalized learning.',
  ],
}

export const programs = [
  {
    title: 'Amazon ML Summer School 2026',
    org: 'Amazon',
    date: 'Jul 2026 — Aug 2026',
    note: 'Integrated learning program on core machine learning concepts and their real-world applications.',
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

/** Contact form posts here → Vercel function → MongoDB (`contact_messages`). */
export const CONTACT_ENDPOINT =
  (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? '/api/contact'
export const RESUME_PATH = `${import.meta.env.BASE_URL}resume.pdf`
