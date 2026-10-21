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
    tagline: 'An AI study companion: five tools built on your own lecture PDFs.',
    kind: 'Agentic RAG',
    period: 'Nov – Dec 2025',
    problem:
      'Students juggle scattered tools to study from their own material, and most need an API key per service.',
    approach:
      'A grounded agentic RAG pipeline (query rewriting, retrieval, grading, and correction loops built with LangChain and FAISS), served through FastAPI with Groq-hosted inference, handling PDF parsing, chunking, and embedding of unstructured lecture material.',
    outcome:
      'Rebuilt from a four-Streamlit-app prototype into a single SPA + API: one process, instant navigation, five tools, and a 1st-place hackathon win.',
    highlights: [
      'Chat with RAG (local embeddings + FAISS) grounded in your PDFs, with short-term memory',
      'Quiz generator, active-recall flashcards, day-by-day study planner, and zoomable mind maps',
      'Three sources per tool: saved subject, free topic, or one-off PDF upload',
    ],
    stack: ['LangChain', 'Agentic RAG', 'FAISS', 'Groq', 'FastAPI', 'Python'],
    metrics: [
      { value: 5, label: 'AI Tools in One' },
      { value: 72, suffix: 'h', label: 'Hackathon Build' },
      { value: 1, prefix: '#', label: 'Place, IIIT Trichy' },
    ],
    links: {
      github: 'https://github.com/gpr-27/study-assistant-hub',
      demo: 'https://study-assistant-hub.onrender.com',
    },
    featured: true,
    award: '1st Place, IIIT Trichy Hackathon',
  },
  {
    id: 'swizzo',
    title: 'Swizzo',
    tagline: 'An AI commerce concierge on Swiggy MCP: search, compare, and order by chat.',
    kind: 'AI Agents · MCP',
    period: 'Jul – Aug 2026',
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
    title: 'LLM Fine-Tuning for Financial Sentiment',
    tagline: 'Llama 3.2 (3B) turned into a strict financial-sentiment classifier with 4-bit QLoRA.',
    kind: 'AI/ML · Fine-Tuning',
    period: 'Feb – Mar 2026',
    problem:
      'A base LLM can’t reliably answer “Bearish, Bullish, or Neutral?” Zero-shot, it produced an invalid answer for 1,998 of 2,388 tweets.',
    approach:
      'Instruction-tuned Meta Llama 3.2 3B with Unsloth + PEFT: frozen 4-bit NF4 base, LoRA (r=16) on all attention and MLP projections, loss only on the one-word answer. Benchmarked the same QLoRA run with and without Unsloth on a free Colab T4.',
    outcome:
      '91.71% accuracy and 0.896 macro-F1 on all 2,388 held-out tweets (vs 42% for 3-shot prompting), with zero invalid outputs, trained in 13.6 minutes.',
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
    id: 'fdm-defect',
    title: 'FDM 3D-Printing Defect Detection',
    tagline: 'CNN computer-vision models that catch print defects at 99%+ accuracy.',
    kind: 'AI/ML · Computer Vision',
    period: 'Jan – Feb 2026',
    problem:
      'FDM 3D prints fail in subtle, visually distinct ways (cracking, warping, stringing) that are slow to catch by eye.',
    approach:
      'Built CNN classifiers for two tasks, binary defect detection and 5-class defect typing, benchmarking AlexNet, ResNet18, and InceptionV3 with ImageNet transfer learning.',
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

  {
    id: 'axon',
    title: 'Axon',
    tagline: 'A glass-box coding agent for your terminal: every call, token, and cent visible.',
    kind: 'AI Agents · Dev Tools',
    period: '2026',
    highlights: [
      'Numbered timeline shows every LLM call, tool run, cache hit, and cost per turn',
      '15 provider presets incl. local Ollama / LM Studio, with fallback chains on 429 / 5xx',
      'Claude Code compatible: CLAUDE.md, hooks, skills, MCP, subagents, plus a Python SDK and HTTP API',
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

  // ---------------- MORE ----------------
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
