# Praneeth Reddy Gandra — Portfolio

A personal portfolio for an AI/ML engineer, built as a **literary dossier**: a warm
cream canvas, coral accent, and a slab-serif editorial voice. Single-page, fully
responsive, with a cream/night theme toggle, a grounded AI chat assistant, and a
contact form.

- **Frontend:** React 19 + Vite + TypeScript, Framer Motion, Lenis smooth scroll
- **Backend:** Express & Vercel serverless (AgentRouter + MongoDB Atlas + Resend)
- **Deploy:** Vercel (recommended serverless) or Render (single web service)
- **Type:** Cormorant Garamond (display) · Inter (body) · JetBrains Mono (code)
- **Palette:** cream `#faf9f5` · coral `#cc785c` · navy `#181715`

## Project structure

```
frontend/             ← Vite app
  index.html
  src/
    data/             ← content (resume.ts, projects.ts) + assistant.ts
    sections/ components/ lib/ styles/
  public/             ← static assets (resume.pdf, photo, favicon)

api/                  ← Vercel serverless functions
  chat.ts             ← POST /api/chat
  contact.ts          ← POST /api/contact

backend/              ← Node/Express server (local & Render)
  server.ts           ← Express: serves dist/ + POST /api/chat + POST /api/contact
  lib/
    agentrouter.ts    ← AgentRouter multi-model provider (DeepSeek, GPT, Claude)
    chat-core.ts      ← handleChat()  → AgentRouter + MongoDB logging
    contact-core.ts   ← handleContact() → MongoDB + Resend email
    mongo.ts          ← cached MongoDB client

package.json          ← build config (root)
vite.config.ts        ← Vite config + dev /api middleware (root)
tsconfig*.json        ← TypeScript config (root)
.env                  ← single env file for the whole project (git-ignored; see .env.example)
dist/                 ← production build output (root; served by Express)
```

One root `package.json`, one root `.env` — the frontend and backend share both.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5180
```

`npm run dev` runs Vite with a tiny middleware that serves `POST /api/chat` and
`POST /api/contact` using the real `backend/lib/*` logic and the keys from `.env` —
so local dev gives the genuine LLM assistant, not the offline fallback. Secrets
stay server-side and are never bundled into the client.

## Production build

```bash
npm run build    # builds the frontend into dist/
npm start        # starts the Express server (serves dist/ + /api on one origin)
```

This is exactly what Render runs. The Express server reads `PORT` from the
environment (defaults to `3000` locally).

## Editing content

All content lives in two typed files — no component edits needed:

- **`frontend/src/data/projects.ts`** — your projects. Each entry has a `links`
  object; fill in `github`, `demo`, or `kaggle` and the buttons appear. Set
  `featured: true` to open it by default and show its metric ledger.
- **`frontend/src/data/resume.ts`** — name, bio, socials, skills, education,
  certifications.

Optional:
- **Résumé** — replace `frontend/public/resume.pdf` with your latest.

## The AI assistant

A floating chat ("Ask me") answers **only from what's on the site** (refuses
off-topic, never reveals grades/GPA), starts a fresh chat every visit/reload, and
is grounded by a fact-sheet generated from `resume.ts` + `projects.ts`
(`buildKnowledge()` — nothing hardcoded).

- **Offline (no backend):** a smart keyword fallback answers from the same data.
- **Live (with backend):** `handleChat()` calls **AgentRouter** (supports DeepSeek V4 Flash, GPT-5.6 Sol, Claude Opus 5, Claude Opus 4.8; key server-side) and logs
  every `{ question, answer, sessionId, createdAt }` to **MongoDB Atlas**
  (`chat_logs`). Only you read it (Atlas UI / Compass).

## Contact form

`POST /api/contact` → `handleContact()` validates input (with a honeypot), saves it
to MongoDB (`contact_messages`), and — if `RESEND_API_KEY` is set — emails you a
notification with the visitor's address as reply-to. Without the key, submissions
are still saved to the database.

## Deploy

Supports direct deployment on **Vercel** (serverless) or **Render** (Express). See **[DEPLOY.md](./DEPLOY.md)**
for the full step-by-step (GitHub push, Vercel/Render setup, env vars, and MongoDB Atlas network access).
