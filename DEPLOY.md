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
   | `AGENTROUTER_HTTPS_PROXY` | **Often required on Vercel** | HTTPS proxy with non-datacenter egress when logs show Aliyun WAF (secret — never commit) |
   | `AGENTROUTER_USE_PYTHON_BRIDGE` | Optional | Leave unset on Vercel (Python `api/chat.py` handles AgentRouter) |

3. **Deploy**: push to `main` (or run `npx vercel deploy --prod`). Builds run `npm run build`; serverless handlers are `api/chat.py` (Python + httpx/Anthropic bridge) and `api/contact.ts` (Node).

### AgentRouter / WAF

`agentrouter.org` sits behind an **Aliyun WAF** that often blocks **datacenter egress** on `/v1/chat/completions`. Production `/api/chat` routes **DeepSeek** and Claude models through the **Anthropic Messages API** (Anthropic SDK + `auth_token`). GPT models still use OpenAI-compatible `/v1/chat/completions`; if Vercel logs show `AgentRouter blocked request (Aliyun WAF)`, the API key is fine but datacenter egress is blocked for that path.

Mitigations (pick one):

- Ask AgentRouter to **allowlist** your Vercel deployment egress (or use a provider that offers static outbound IPs).
- Set **`AGENTROUTER_HTTPS_PROXY`** on Vercel (Production):
  1. Open [Vercel Dashboard](https://vercel.com) → your **portfolio** project → **Settings** → **Environment Variables**.
  2. **Add** → Name: `AGENTROUTER_HTTPS_PROXY`, Value: your provider’s HTTPS proxy URL (e.g. `https://user:pass@gate.provider.com:10000`), Environment: **Production** (and Preview if needed).
  3. **Save**, then **Deployments** → ⋮ on latest → **Redeploy** (or push to `main`).
  4. Confirm logs no longer show `AgentRouter blocked request (Aliyun WAF)`.
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
