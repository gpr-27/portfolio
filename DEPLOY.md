# Deployment Guide

Production site: **https://portfolio-black-six-34.vercel.app/** — frontend and `/api/*` run on **Vercel** (serverless functions).

---

## Deploy to Vercel

1. **Import the repository** at [vercel.com/new](https://vercel.com/new). Vercel detects Vite from `vercel.json` (`outputDirectory: "dist"`).

2. **Environment variables** (**Project Settings → Environment Variables**), for Production (and Preview if you use previews):

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `AGENTROUTER_API_KEY` | Yes | AgentRouter secret API key |
   | `MONGODB_URI` | Optional | Chat logs + contact messages |
   | `MONGODB_DB` | Optional | Default `portfolio` |
   | `RESEND_API_KEY` | Optional | Contact form email |
   | `CONTACT_TO` | Optional | e.g. `praneethg1830@gmail.com` |
   | `CONTACT_FROM` | Optional | e.g. `Portfolio <onboarding@resend.dev>` |
   | `AGENTROUTER_USE_PYTHON_BRIDGE` | Optional | Leave unset on Vercel (defaults to fetch with Anthropic/Python-style headers) |

3. **Deploy**: push to `main` (or run `npx vercel deploy --prod`). Builds run `npm run build`; serverless handlers are `api/chat.py` (Python + httpx/Anthropic bridge) and `api/contact.ts` (Node).

### AgentRouter / WAF

`agentrouter.org` sits behind an **Aliyun WAF** that often blocks **datacenter egress** (including Vercel serverless in `sin1`). Production `/api/chat` uses the Python bridge (`httpx` / Anthropic SDK with Axon-style headers). If Vercel logs show `AgentRouter blocked request (Aliyun WAF)`, the API key is fine but the host IP is blocked.

Mitigations (pick one):

- Ask AgentRouter to **allowlist** your Vercel deployment egress (or use a provider that offers static outbound IPs).
- Set **`AGENTROUTER_HTTPS_PROXY`** on Vercel to an HTTPS proxy with residential/non-datacenter egress (secret env var only — never commit).
- Run chat locally via `npm run dev` (residential IP) while the portfolio UI stays on Vercel.

### MongoDB Atlas

If you use `MONGODB_URI`, allow **Vercel** egress in Atlas (**Network Access**). Serverless IPs change; `0.0.0.0/0` is the usual choice for a portfolio.

---

## Local production-style server (optional)

```bash
npm run build
npm start   # Express on PORT (default 3000), serves dist/ + /api
```

Docker (`docker compose up --build`) uses the same Express stack with the Python AgentRouter bridge installed in the image for Linux hosts where WAF is strict.
