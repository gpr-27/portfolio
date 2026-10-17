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
    kind: 'Agentic RAG',
    period: 'Nov — Dec 2025',
    problem:
      'Students juggle scattered tools to study from their own material — and most need an API key per service.',
    approach:
      'A grounded agentic RAG pipeline — query rewriting, retrieval, grading, and correction loops built with LangChain and FAISS — served through FastAPI with Groq-hosted inference, handling PDF parsing, chunking, and embedding of unstructured lecture material.',
    outcome:
      'Rebuilt from a four-Streamlit-app prototype into a single SPA + API: one process, instant navigation, five tools — and a 1st-place hackathon win.',
    highlights: [
      'Chat with RAG (local embeddings + FAISS) grounded in your PDFs, with short-term memory',
      'Quiz generator, active-recall flashcards, day-by-day study planner, and zoomable mind maps',
      'Three sources per tool — saved subject, free topic, or one-off PDF upload',
    ],
    stack: ['LangChain', 'Agentic RAG', 'FAISS', 'Groq', 'FastAPI', 'Python'],
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
    id: 'swizzo',
    title: 'Swizzo',
    tagline: 'An AI commerce concierge on Swiggy MCP — search, compare, and order by chat.',
    kind: 'AI Agents · MCP',
    period: 'Jul — Aug 2026',
    problem:
      'Shopping across restaurants and Instamart means hopping between screens to search, compare, apply coupons, and track orders.',
    approach:
      'A conversational concierge on Swiggy MCP and the Claude Agent SDK. The LLM handles reasoning and recommendations, while backend services own cart updates, coupons, and order placement — every order needs explicit user approval.',
    outcome:
      'Live product and restaurant search, cross-restaurant comparison, and order tracking in one streaming chat, with a safe agent boundary between “suggest” and “spend”.',
    highlights: [
      'Searches live products and restaurants, compares options, and tracks orders conversationally',
      'Safe agent architecture: LLM reasons, backend controls cart, coupons, and checkout with user approval',
      'Next.js frontend with streaming chat, live product cards, cross-restaurant search, and real-time cart sync',
    ],
    stack: ['Swiggy MCP', 'Claude Agent SDK', 'Next.js', 'TypeScript'],
    links: {},
    featured: true,
  },
  {
    id: 'llm-finetune-sentiment',
    title: 'LLM Fine-Tuning — Financial Sentiment',
    tagline: 'Llama 3.2 (3B) turned into a strict financial-sentiment classifier with 4-bit QLoRA.',
    kind: 'AI/ML · Fine-Tuning',
    period: 'Feb — Mar 2026',
    problem:
      'A base LLM can’t reliably answer “Bearish, Bullish, or Neutral?” — zero-shot it produced an invalid answer for 1,998 of 2,388 tweets.',
    approach:
      'Instruction-tuned Meta Llama 3.2 3B with Unsloth + PEFT: frozen 4-bit NF4 base, LoRA (r=16) on all attention and MLP projections, loss only on the one-word answer. Benchmarked the same QLoRA run with and without Unsloth on a free Colab T4.',
    outcome:
      '91.71% accuracy and 0.896 macro-F1 on all 2,388 held-out tweets (vs 42% for 3-shot prompting), with zero invalid outputs — trained in 13.6 minutes.',
    highlights: [
      '91.71% accuracy after fine-tuning vs 42.04% 3-shot and 1.55% zero-shot on the same prompt',
      'Unsloth: 1.84× faster steps and 42% less peak GPU memory than plain transformers + PEFT',
      'Only 0.75% of parameters trained (24.3M LoRA params) under 4-bit quantization',
    ],
    stack: ['Llama 3.2', 'Unsloth', 'PEFT', 'QLoRA', 'PyTorch', 'Hugging Face'],
    chart: {
      kind: 'bars',
      items: [
        { label: 'Zero-shot', value: 1.55, suffix: '%' },
        { label: '3-shot', value: 42.04, suffix: '%' },
        { label: 'Fine-tuned', value: 91.71, suffix: '%' },
      ],
    },
    metrics: [
      { value: 91.71, decimals: 2, suffix: '%', label: 'Accuracy' },
      { value: 1.84, decimals: 2, suffix: '×', label: 'Faster w/ Unsloth' },
      { value: 42, prefix: '−', suffix: '%', label: 'Peak VRAM' },
    ],
    links: {
      github: 'https://github.com/gpr-27/llm-financial-sentiment-unsloth',
    },
    featured: true,
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
    period: 'Jan — Feb 2026',
    problem:
      'FDM 3D prints fail in subtle, visually distinct ways (cracking, warping, stringing) that are slow to catch by eye.',
    approach:
      'Built CNN classifiers for two tasks — binary defect detection and 5-class defect typing — benchmarking AlexNet, ResNet18, and InceptionV3 with ImageNet transfer learning.',
    outcome:
      'Near-perfect accuracy on both tasks, identifying the strongest transfer-learning backbone for each.',
    highlights: [
      'Binary defect detection and 5-class typing (Cracking, Layer Shifting, Off Platform, Stringing, Warping)',
      'Benchmarked AlexNet, ResNet18, and InceptionV3 with ImageNet transfer learning',
      'Audited the split for near-duplicate time-lapse frames and added a session-grouped evaluation mode',
    ],
    stack: ['PyTorch', 'Computer Vision', 'Transfer Learning', 'CNN'],
    chart: {
      kind: 'radial',
      items: [
        { label: 'Binary Accuracy', value: 99.45, suffix: '%' },
        { label: 'Multi-class Accuracy', value: 99.22, suffix: '%' },
      ],
    },
    metrics: [
      { value: 5, label: 'Defect Classes' },
      { value: 3, label: 'CNN Backbones' },
    ],
    links: {
      github: 'https://github.com/gpr-27/fdm-3d-printing-defect-detection',
    },
    featured: true,
  },

  // ---------------- AGENTS & SYSTEMS ----------------
  {
    id: 'axon',
    title: 'Axon',
    tagline: 'A glass-box coding agent for your terminal — every call, token, and cent visible.',
    kind: 'AI Agents · Dev Tools',
    period: '2026',
    highlights: [
      'Numbered timeline shows every LLM call, tool run, cache hit, and cost per turn',
      '15 provider presets incl. local Ollama / LM Studio, with fallback chains on 429 / 5xx',
      'Claude Code compatible: CLAUDE.md, hooks, skills, MCP, subagents — plus a Python SDK and HTTP API',
    ],
    stack: ['Python', 'MCP', 'Anthropic / OpenAI APIs', 'Ollama', 'SSE', 'GitHub Actions'],
    metrics: [
      { value: 21, label: 'Built-in Tools' },
      { value: 112, label: 'Slash Commands' },
      { value: 15, label: 'Provider Presets' },
    ],
    links: {
      github: 'https://github.com/gpr-27/axon',
    },
  },
  {
    id: 'chaukhat',
    title: 'Chaukhat',
    tagline: 'A Razorpay reference merchant where AI agents spend only what humans authorise.',
    kind: 'AI Agents · Commerce',
    period: '2026',
    highlights: [
      'Implements the ACP checkout API and ES256-signed AP2 mandates on Razorpay test mode',
      '19-step deterministic, LLM-free gate verifies every mandate before an order can exist',
      'Hash-chained signed ledger, MCP tool binding, and conformance + attack suites — built for the Razorpay AI Buildathon 2026',
    ],
    stack: ['Python', 'MCP', 'Razorpay', 'AP2 / ACP', 'Docker', 'pytest'],
    metrics: [
      { value: 12, suffix: '/12', label: 'ACP Conformance' },
      { value: 16, label: 'Attacks Blocked' },
    ],
    links: {
      github: 'https://github.com/gpr-27/chaukhat',
    },
  },
  {
    id: 'envoy',
    title: 'Envoy — Agentic Dating',
    tagline: 'AI agents read your profile, go on dates for you, and rank who fits best.',
    kind: 'AI Agents · Full-Stack',
    period: '2026',
    highlights: [
      'Reader agent builds evidence-cited profiles from public LinkedIn and Instagram',
      'Isolated date agents converse turn-by-turn, then privately debrief and rank matches',
      'Resumable tick-based pipeline beats serverless time limits; multi-provider LLM router',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Apify', 'Gemini', 'Groq', 'Zod'],
    links: {
      github: 'https://github.com/gpr-27/envoy-agentic-dating',
      demo: 'https://envoy-agentic-dating.vercel.app',
    },
  },
  {
    id: 'redrob',
    title: 'Redrob Candidate Ranker',
    tagline: 'Picks the top 100 from 100,000 candidates — and catches the honeypots.',
    kind: 'AI/ML · Ranking',
    period: '2026',
    highlights: [
      'Seven weighted scoring dimensions encode the JD rubric instead of keyword matching',
      'Multi-signal honeypot detector catches impossible profiles (e.g. tenure before a company existed)',
      'Fact-only reasoning per candidate; pure-stdlib Python, ranks 100K profiles in ~10 s on CPU',
    ],
    stack: ['Python', 'Streamlit', 'Hugging Face Spaces'],
    metrics: [
      { value: 100, suffix: 'K', label: 'Profiles Ranked' },
      { value: 10, prefix: '~', suffix: 's', label: 'On CPU' },
    ],
    links: {
      github: 'https://github.com/gpr-27/redrob-candidate-ranking',
      demo: 'https://huggingface.co/spaces/praneethg27/redrob-ranker',
    },
  },
  {
    id: 'legixo-qa',
    title: 'Legixo — Legal Q&A',
    tagline: 'Grounded Q&A over legal documents that cites its chunks — or abstains.',
    kind: 'AI/ML · Agentic RAG',
    period: '2026',
    highlights: [
      'LangGraph loop: expand → retrieve → grade → generate / refine / give up, with bounded retries',
      'Every answer cites exact source chunks, and says so when the documents lack the answer',
      'Gold-set evaluation checks both citation accuracy and abstain correctness',
    ],
    stack: ['LangGraph', 'Pinecone', 'FastAPI', 'Groq', 'Gemini Embeddings'],
    links: {
      github: 'https://github.com/gpr-27/legixo-qa',
    },
  },
  {
    id: 'attendly',
    title: 'Attendly',
    tagline: 'A personal AI attendance co-pilot — mark classes, track bunk %, plan skips.',
    kind: 'Full-Stack · AI',
    period: '2026',
    highlights: [
      'Installable PWA with an offline Dexie cache and Supabase as the source of truth',
      'Gemini parses timetable photos; a Groq-powered coach gives attendance insights',
      'Clerk auth, cross-device sync, and PDF attendance export',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Clerk', 'Dexie', 'Groq', 'Gemini'],
    links: {
      github: 'https://github.com/gpr-27/attendly',
      demo: 'https://attendly-navy.vercel.app',
    },
  },
  {
    id: 'iiitt-confessions',
    title: 'IIIT Trichy Confessions',
    tagline: 'A live anonymous campus platform with real-time chat and push notifications.',
    kind: 'Full-Stack',
    period: '2026',
    highlights: [
      'In production with real campus users; additive, backward-compatible API releases',
      'Socket.IO real-time chat, web push, profanity filtering, and per-IP rate limiting',
      'Next.js frontend on Vercel with an Express 5 + MongoDB API on Render',
    ],
    stack: ['Next.js', 'React 19', 'Express 5', 'Socket.IO', 'MongoDB', 'Playwright'],
    links: {
      demo: 'https://iiitt-confessions.vercel.app',
    },
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
