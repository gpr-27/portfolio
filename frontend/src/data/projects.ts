/* ============================================================
   PROJECTS — the showcase. Edit links here anytime: just fill in
   `github`, `demo`, or `kaggle` for any project and it appears.
   Sourced from github.com/gpr-27 + résumé.
   ============================================================ */

export interface ProjectLinks {
  github?: string
  demo?: string
  kaggle?: string
}

export interface ProjectMetric {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
}

/** Optional animated result chart shown in featured case studies. */
export interface ProjectChart {
  kind: 'radial' | 'bars'
  /** for radial: one or two values; for bars: any number */
  items: { label: string; value: number; suffix?: string }[]
}

export interface Project {
  id: string
  title: string
  tagline: string
  /** short category tag */
  kind: string
  period: string
  /** case-study narrative (optional; featured cards use it) */
  problem?: string
  approach?: string
  outcome?: string
  highlights: string[]
  stack: string[]
  metrics?: ProjectMetric[]
  chart?: ProjectChart
  links: ProjectLinks
  /** optional screenshot path under /public (drop a file + set this) */
  image?: string
  featured?: boolean
  award?: string
}

export const projects: Project[] = [
  // ---------------- FEATURED ----------------
  {
    id: 'study-assistant-hub',
    title: 'Study Assistant Hub',
    tagline: 'An AI study companion — five tools built on your own lecture PDFs.',
    kind: 'Full-Stack · RAG',
    period: '2025',
    problem:
      'Students juggle scattered tools to study from their own material — and most need an API key per service.',
    approach:
      'One FastAPI server + a hand-built “Liquid Glass” SPA. Local embeddings + FAISS power RAG over your PDFs; Groq handles all LLM inference — so a single GROQ_API_KEY runs everything.',
    outcome:
      'Rebuilt from a four-Streamlit-app prototype into a single SPA + API: one process, instant navigation, five tools — and a 1st-place hackathon win.',
    highlights: [
      'Chat with RAG (local embeddings + FAISS) grounded in your PDFs, with short-term memory',
      'Quiz generator, active-recall flashcards, day-by-day study planner, and zoomable mind maps',
      'Three sources per tool — saved subject, free topic, or one-off PDF upload',
    ],
    stack: ['FastAPI', 'Python', 'Groq', 'FAISS', 'RAG', 'React'],
    metrics: [
      { value: 5, label: 'AI Tools in One' },
      { value: 72, suffix: 'h', label: 'Hackathon Build' },
      { value: 1, prefix: '#', label: 'Place — IIIT Trichy' },
    ],
    links: {
      github: 'https://github.com/gpr-27/study-assistant-hub',
      demo: 'https://study-assistant-hub.onrender.com',
    },
    featured: true,
    award: '1st Place — IIIT Trichy Hackathon',
  },
  {
    id: 'nifty-signal-pod',
    title: 'NIFTY Signal Pod',
    tagline: 'A fine-tuned small LM that turns options snapshots into trading signals.',
    kind: 'AI/ML · Fine-Tuning',
    period: '2026',
    problem:
      'Reading a NIFTY 50 options market-state snapshot into a disciplined, machine-readable trade call is noisy and inconsistent.',
    approach:
      'Fine-tuned TinyLlama-1.1B with LoRA on Kaggle (T4) to emit a structured JSON signal, wrapped in a deterministic orchestrator that applies three suppression rules — plus a pre-committed eval suite and a RAG ablation.',
    outcome:
      'A reproducible quant pipeline: adapter + orchestrator + MLflow tracking, with eval thresholds committed before training to keep the experiment honest.',
    highlights: [
      'LoRA / PEFT fine-tune of TinyLlama-1.1B emitting structured JSON signals',
      'Deterministic 3-rule orchestrator: ADX gate, parse gate, and conviction gate',
      'Two-condition RAG ablation + MLflow-tracked eval suite committed before training',
    ],
    stack: ['TinyLlama', 'LoRA / PEFT', 'PyTorch', 'RAG', 'MLflow'],
    metrics: [
      { value: 1.1, decimals: 1, suffix: 'B', label: 'Params Fine-Tuned' },
      { value: 3, label: 'Suppression Rules' },
    ],
    links: {
      github: 'https://github.com/gpr-27/nifty-signal-pod',
      kaggle: 'https://www.kaggle.com/code/praneethg27/notebook9997f4f4e6',
    },
    featured: true,
  },
  {
    id: 'kairos-ai',
    title: 'Kairos AI',
    tagline: 'A Socratic AI tutor for DSA, competitive programming & system design.',
    kind: 'Full-Stack · AI',
    period: '2026',
    problem:
      'Most coding helpers just hand over the answer — which is the opposite of how you actually learn to problem-solve.',
    approach:
      'A coding platform with an interactive playground, a problem bank, and an LLM “AI Coach” that guides Socratically. One Docker container: Node/Express serves the SPA + REST + playground WebSocket and proxies /ml to a co-located Python service — all same-origin.',
    outcome:
      'A single-deploy, same-origin architecture running entirely on Groq (Llama 3.3 70B), with live in-browser code execution via Piston.',
    highlights: [
      'AI Coach guides Socratically instead of revealing solutions',
      'Live playground with WebSocket-driven code execution (Piston)',
      'Single-container design: Node serves SPA + API and proxies the Python ML service',
    ],
    stack: ['React', 'Node/Express', 'Python', 'Groq', 'MongoDB', 'WebSocket', 'Docker'],
    metrics: [
      { value: 70, suffix: 'B', label: 'Llama 3.3 Model' },
      { value: 1, label: 'Container, 0 CORS' },
    ],
    links: {
      github: 'https://github.com/gpr-27/kairos-ai',
      demo: 'https://kairos-ai-zoxs.onrender.com',
    },
    featured: true,
  },
  {
    id: 'fdm-defect',
    title: 'FDM 3D-Printing Defect Detection',
    tagline: 'CNN computer-vision models that catch print defects at 99%+ accuracy.',
    kind: 'AI/ML · Computer Vision',
    period: '2026',
    problem:
      'FDM 3D prints fail in subtle, visually distinct ways (cracking, warping, stringing) that are slow to catch by eye.',
    approach:
      'Built CNN classifiers for two tasks — binary defect detection and 5-class defect typing — benchmarking AlexNet, ResNet18, and InceptionV3 with ImageNet transfer learning.',
    outcome:
      'Near-perfect accuracy on both tasks, identifying the strongest transfer-learning backbone for each.',
    highlights: [
      'Binary defect detection and 5-class typing (Cracking, Layer Shifting, Off Platform, Stringing, Warping)',
      'Benchmarked AlexNet, ResNet18, and InceptionV3 with ImageNet transfer learning',
    ],
    stack: ['PyTorch', 'Computer Vision', 'Transfer Learning', 'CNN'],
    chart: {
      kind: 'radial',
      items: [
        { label: 'Binary Accuracy', value: 99.45, suffix: '%' },
        { label: 'Multi-class Accuracy', value: 99.22, suffix: '%' },
      ],
    },
    metrics: [{ value: 5, label: 'Defect Classes' }],
    links: {},
    featured: true,
  },

  // ---------------- GRID ----------------
  {
    id: 'aura-wellness',
    title: 'Aura — Mental Wellness',
    tagline: 'A full-stack wellness companion with empathetic AI.',
    kind: 'Full-Stack · AI',
    period: '2026',
    highlights: [
      'Mood tracking with AI-generated reflections and trend charts',
      'Empathetic AI chat with therapy / meditation / crisis modes (Groq)',
      'Mindful studio, medication reminders, and a smart health record',
    ],
    stack: ['React 19', 'Vite', 'Express', 'MongoDB', 'Groq', 'Recharts'],
    links: {
      github: 'https://github.com/gpr-27/Hackhub',
      demo: 'https://aura-sqdv.onrender.com',
    },
  },
  {
    id: 'groqbot',
    title: 'Groqbot',
    tagline: 'A lightning-fast MERN AI chat on Groq’s LPU.',
    kind: 'Full-Stack · AI',
    period: '2026',
    highlights: [
      'Token-by-token streaming over SSE',
      'Switch between Llama 3.3 70B, 3.1 8B, GPT-OSS 120B & Gemma 2 9B on the fly',
      'Rich markdown, syntax highlighting, conversation management, regenerate / stop',
    ],
    stack: ['React 19', 'Node/Express', 'MongoDB', 'Groq', 'Clerk', 'SSE'],
    links: {
      github: 'https://github.com/gpr-27/chatbot',
      demo: 'https://groqbot-coqy.onrender.com',
    },
  },
  {
    id: 'chatty',
    title: 'Chatty — Realtime Chat',
    tagline: 'MERN realtime messaging with WebRTC audio/video calls.',
    kind: 'Full-Stack',
    period: '2026',
    highlights: [
      'Live 1:1 messaging, typing indicators, read receipts & unread counts',
      'Peer-to-peer audio/video calls over WebRTC',
      'Image sharing (Cloudinary), online presence, light/dark glass UI',
    ],
    stack: ['Node', 'Socket.IO', 'MongoDB', 'React', 'Zustand', 'WebRTC'],
    links: {
      github: 'https://github.com/gpr-27/chat_app',
      demo: 'https://chat-app-3i3p.onrender.com',
    },
  },
  {
    id: 'et-nucleus',
    title: 'ET Nucleus — Persona-Aware News',
    tagline: 'Business news that rewrites itself for who you are.',
    kind: 'Full-Stack · AI',
    period: '2026',
    highlights: [
      'Adaptive persona quiz + AI intent analysis classify your investor type & knowledge level',
      'Deep-dive synthesis: one coherent briefing built from multiple articles, written for your level',
      'Personalized feed — headlines rewritten for you, each with a /10 relevance score',
    ],
    stack: ['React', 'Vite', 'Express', 'Groq', 'Tailwind', 'Framer Motion'],
    links: {
      github: 'https://github.com/gpr-27/pramaan',
      demo: 'https://et-nucleus.onrender.com',
    },
  },
  {
    id: 'llm-finetune-sentiment',
    title: 'LLM Fine-Tuning — Financial Sentiment',
    tagline: 'Instruction-tuned Llama 3.2 (3B) for strict sentiment classification.',
    kind: 'AI/ML · Fine-Tuning',
    period: '2026',
    highlights: [
      'PEFT + instruction-tuning with QLoRA on a Twitter financial dataset',
      'Fine-tuned Meta’s Llama 3.2 (3B) base model via Unsloth',
      '4-bit quantization + Unsloth kernels to slash GPU memory and speed up training',
    ],
    stack: ['PyTorch', 'Unsloth', 'PEFT', 'QLoRA'],
    metrics: [
      { value: 3, suffix: 'B', label: 'Llama Params' },
      { value: 4, suffix: '-bit', label: 'Quantization' },
    ],
    links: {},
  },
  {
    id: 'sms-spam',
    title: 'SMS Spam Detection',
    tagline: 'An NLP ensemble that flags spam at 98.5%+ accuracy.',
    kind: 'AI/ML · NLP',
    period: '2025',
    highlights: [
      'TF-IDF pipeline classifying messages as spam or ham',
      'Hard-voting ensemble of Naïve Bayes, SVM, KNN & Random Forest',
    ],
    stack: ['NLP', 'TF-IDF', 'Scikit-learn'],
    metrics: [{ value: 98.5, decimals: 1, suffix: '%', label: 'Accuracy' }],
    links: {},
  },
  {
    id: 'credit-default',
    title: 'Credit Card Default Prediction',
    tagline: 'Predictive analytics across six models under class imbalance.',
    kind: 'AI/ML · Predictive',
    period: '2024',
    highlights: [
      'Forecasts default risk from extensive financial history',
      'Benchmarked LogReg, Trees, SVM, RF, Gradient Boosting & XGBoost',
    ],
    stack: ['Machine Learning', 'XGBoost', 'Predictive Analytics'],
    metrics: [{ value: 6, label: 'Models Benchmarked' }],
    links: {},
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
export const gridProjects = projects.filter((p) => !p.featured)
