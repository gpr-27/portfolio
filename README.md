# Praneeth Reddy Gandra — Portfolio

A single-page portfolio for an AI/ML engineer, with a chat assistant that answers
as Praneeth using everything shown on the site, and a contact form.

```
frontend/      React 19 + Vite + TypeScript site
  src/data/    all content (resume.ts, projects.ts) + the assistant's fact sheet
backend/       Express API: POST /api/chat, POST /api/contact
vercel.json    deploys both folders together as Vercel Services
.env           every secret, in one git-ignored file (template: .env.example)
```

## Chat assistant

`backend/lib/providers.ts` tries the keys strictly in this order and moves on when
one fails (rate limit, outage, bad key):

1. Anthropic — `ANTHROPIC_API_KEY` (Claude Opus 5.5)
2. Groq — `GROQ_API_KEY`
3. Groq — `GROQ_API_KEY_2`
4. Gemini — `GEMINI_API_KEY`
5. Gemini — `GEMINI_API_KEY_2`

The frontend sends a fact sheet built from `frontend/src/data` with every question,
so the assistant knows exactly what the page shows. If every provider fails, the
widget falls back to offline answers from the same data.

## Run locally

```bash
cp .env.example .env            # then fill in the keys
cd backend  && npm install && npm run dev    # API on http://localhost:3000
cd frontend && npm install && npm run dev    # site on http://localhost:5180
```

Vite proxies `/api` to the backend. `vercel dev` also runs both at once.

## Deploy

Pushed to GitHub and deployed on Vercel. `vercel.json` routes `/api/*` to the
backend service and everything else to the frontend. Secrets live in Vercel →
Project Settings → Environment Variables, under the same names as `.env`.
