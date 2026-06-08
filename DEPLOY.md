# Deploy to Render

This portfolio ships as **one Render Node web service**. A single Express server
(`backend/server.ts`) serves the built frontend from the repo-root `dist/` **and**
handles `POST /api/chat` and `POST /api/contact` on the same origin — so the site
and the API live at one URL, no separate hosting and no CORS.

## 1. Push the repo to GitHub

```bash
git init                 # if not already a repo
git add -A
git commit -m "Render deploy"
git branch -M main
git remote add origin https://github.com/<you>/portfolio.git
git push -u origin main
```

> `.env` is git-ignored — secrets are added in the Render dashboard (step 3), not committed.

## 2. Create the service on Render

Pick **one** of the two options:

**A. Blueprint (recommended — reads `render.yaml`)**
1. [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**.
2. Connect the GitHub repo. Render detects `render.yaml` and proposes the
   `praneeth-portfolio` web service (Node, free plan).
3. Click **Apply**.

**B. Manual web service**
1. **New → Web Service**, connect the repo.
2. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start`
3. Create the service.

> `--include=dev` is required: the build needs the dev dependencies (Vite,
> TypeScript) even though Render runs in production mode.

## 3. Add the secret environment variables

In Render → your service → **Environment**, add the secrets (Blueprint marks these
`sync: false`, so Render leaves them blank for you to fill):

| Key | Value |
| --- | --- |
| `GROQ_API_KEY` | your **rotated** Groq API key |
| `MONGODB_URI` | MongoDB Atlas connection string (dedicated user) |
| `RESEND_API_KEY` | Resend API key (optional — enables contact-form emails) |

The non-secret vars (`MONGODB_DB=portfolio`, `CONTACT_TO`, `CONTACT_FROM`) are set
automatically by `render.yaml`. On a manual service, add them by hand. Render
provides `PORT` automatically; the server reads it (`process.env.PORT`).

## 4. Allow Render to reach MongoDB Atlas

MongoDB Atlas → **Network Access** → **Add IP Address** → allow `0.0.0.0/0`
(Render does not give a fixed outbound IP on the free plan). Without this, every
chat log and contact submission will fail to write.

## 5. Rotate the leaked credentials (do this once, now)

The repo history / `.env.example` carried a shared Groq key and a weak Atlas
password. Before going live:

- **Groq:** revoke the old key, create a fresh one, put it in `GROQ_API_KEY`.
- **MongoDB Atlas:** delete/rotate the `gpr_27:gpr_27` user, create a dedicated
  user with a strong password, and update `MONGODB_URI`.

---

After the first deploy, Render gives you a `https://praneeth-portfolio.onrender.com`
URL. The frontend calls `/api/chat` and `/api/contact` on that same origin — no
extra configuration needed. Pushing to `main` triggers an automatic redeploy.
