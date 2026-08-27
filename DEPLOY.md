# Deployment Guide

This portfolio supports direct deployment to **Vercel** (recommended, serverless functions) or **Render** (Node web service).

---

## Option 1: Deploy to Vercel (Recommended)

1. **Import the repository into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select your GitHub repository.
   - Vercel automatically detects Vite from `vercel.json` (`outputDirectory: "dist"`).

2. **Configure Environment Variables** in the Vercel Dashboard (**Project Settings → Environment Variables**):
   - `AGENTROUTER_API_KEY`: Your AgentRouter secret API key.
   - `MONGODB_URI`: (Optional) MongoDB connection string for chat logs and contact messages.
   - `MONGODB_DB`: (Optional) `portfolio`
   - `RESEND_API_KEY`: (Optional) Resend API key for contact form emails.
   - `CONTACT_TO`: `praneethg1830@gmail.com`
   - `CONTACT_FROM`: `Portfolio <onboarding@resend.dev>`

3. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and deploy the serverless functions in `/api/chat` and `/api/contact`.

---

## Option 2: Deploy to Render

1. [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**.
2. Connect the GitHub repository (uses `render.yaml`).
3. Add secret environment variables (`AGENTROUTER_API_KEY`, `MONGODB_URI`, `RESEND_API_KEY`).
4. Click **Apply**.

