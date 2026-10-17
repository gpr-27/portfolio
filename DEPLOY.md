# Deployment Guide

Production site: **https://portfolio-black-six-34.vercel.app/** — frontend and `/api/*` run on **Vercel** (serverless functions).

---

## Deploy to Vercel

1. **Import the repository** at [vercel.com/new](https://vercel.com/new). Vercel detects Vite from `vercel.json` (`outputDirectory: "dist"`).

2. **Environment variables** (**Project Settings → Environment Variables**), for Production (and Preview if you use previews):

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `GROQ_API_KEY` | Yes | Groq API key for the chat assistant |
   | `MONGODB_URI` | Optional | Chat logs + contact messages |
   | `MONGODB_DB` | Optional | Default `portfolio` |
   | `RESEND_API_KEY` | Optional | Contact form email |
   | `CONTACT_TO` | Optional | e.g. `praneethg1830@gmail.com` |
   | `CONTACT_FROM` | Optional | e.g. `Portfolio <onboarding@resend.dev>` |

3. **Deploy**: push to `main` (or run `npx vercel deploy --prod`). Builds run `npm run build`; serverless handlers are `api/chat.py` (Python, calls Groq) and `api/contact.ts` (Node).

### Chat models (Groq)

`/api/chat` calls Groq's OpenAI-compatible API with `GROQ_API_KEY`. The widget offers **GPT-OSS 120B** (default), **GPT-OSS 20B**, and **Qwen 3.8 27B**; on a rate limit or outage the backend falls through to the next model. If every model fails, the API returns 502 and the widget answers from its offline, on-page fallback.

### MongoDB Atlas

If you use `MONGODB_URI`, allow **Vercel** egress in Atlas (**Network Access**). Serverless IPs change; `0.0.0.0/0` is the usual choice for a portfolio.

---

## Local production-style server (optional)

```bash
npm run build
npm start   # Express on PORT (default 3000), serves dist/ + /api
```

Docker (`docker compose up --build`) uses the same Express stack and reads `GROQ_API_KEY` from `.env`.
