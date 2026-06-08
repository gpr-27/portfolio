# Praneeth Reddy Gandra — Portfolio

A personal portfolio for an AI/ML engineer, built as a **literary dossier**: a warm
cream canvas, coral accent, and a slab-serif editorial voice. Single-page, fully
responsive, with a cream/night theme toggle, a grounded AI chat assistant, and a
contact form.

- **Frontend:** React 19 + Vite + TypeScript, Framer Motion, Lenis smooth scroll
- **Backend:** one Express server (Groq + MongoDB Atlas + Resend), same origin as the site
- **Deploy:** a single Render Node web service serves the built site **and** the API
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

backend/              ← Node/Express server
  server.ts           ← Express: serves dist/ + POST /api/chat + POST /api/contact
  lib/
    chat-core.ts      ← handleChat()  → Groq + MongoDB logging
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
- **Live (with backend):** `handleChat()` calls **Groq** (key server-side) and logs
  every `{ question, answer, sessionId, createdAt }` to **MongoDB Atlas**
  (`chat_logs`). Only you read it (Atlas UI / Compass).

## Contact form

`POST /api/contact` → `handleContact()` validates input (with a honeypot), saves it
to MongoDB (`contact_messages`), and — if `RESEND_API_KEY` is set — emails you a
notification with the visitor's address as reply-to. Without the key, submissions
are still saved to the database.

## Deploy

Hosted as **one Render Node web service** — the Express server serves the built
site and the `/api` endpoints from the same origin. See **[DEPLOY.md](./DEPLOY.md)**
for the full step-by-step (GitHub push, Render Blueprint via `render.yaml`, env vars,
MongoDB Atlas network access, and rotating the leaked credentials).

> A static-only host would serve the site with the **offline** assistant, but the
> live Groq + MongoDB + email features need the Express server.
