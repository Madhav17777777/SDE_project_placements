# StreamVerse — Deployment Guide

Four pieces to stand up, in this order: MongoDB Atlas → Cloudinary → Render (backend) → Vercel (frontend). Doing it in this order means every env var the backend needs already exists by the time you configure Render.

## 1. MongoDB Atlas

1. Create a free account at atlas.mongodb.com, create a new **M0 (free tier)** cluster.
2. Database Access -> add a database user (username/password, not OAuth) with `readWrite` on your database.
3. Network Access -> add IP address `0.0.0.0/0` (allow from anywhere) — Render's outbound IPs aren't static on the free plan, so this is the pragmatic choice for a portfolio project. For production-grade security you'd instead use Atlas's PrivateLink/VPC peering.
4. Connect -> Drivers -> copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/streamverse?retryWrites=true&w=majority`
   This is your `MONGODB_URI`.

## 2. Cloudinary

1. Create a free account at cloudinary.com.
2. Dashboard shows `Cloud Name`, `API Key`, `API Secret` — these become `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. No bucket/folder setup needed — `cloudinary.service.js` creates folders (`streamverse/avatars`, `streamverse/videos`, etc.) on first upload automatically.

## 3. Backend on Render

**Option A — Blueprint (recommended):** push this repo to GitHub, then in Render click **New +** → **Blueprint**, point it at the repo. Render reads `render.yaml` at the repo root and provisions the service, generating `ACCESS_TOKEN_SECRET`/`REFRESH_TOKEN_SECRET`/`COOKIE_SECRET` for you. You still need to manually fill in the `sync: false` variables (Atlas URI, Cloudinary keys, SMTP, Google OAuth, and `CLIENT_URL`) in the Render dashboard once the service exists.

**Option B — Manual web service:**
1. New + → Web Service → connect the repo.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Health Check Path: `/health`
6. Add every variable from `server/.env.example` under Environment.

After the first deploy, note the service URL (e.g. `https://streamverse-api.onrender.com`) — you'll need it for `GOOGLE_CALLBACK_URL` and for the frontend's `VITE_API_BASE_URL`/`VITE_SOCKET_URL`.

**Render free tier note:** free web services spin down after ~15 minutes of inactivity and take 30-60s to cold-start on the next request. Fine for a portfolio demo; mention it if a reviewer's first request seems to hang.

## 4. Frontend on Vercel

1. New Project → import the repo → set **Root Directory** to `client`.
2. Framework Preset: Vite (auto-detected).
3. Environment Variables:
   - `VITE_API_BASE_URL` = `https://streamverse-api.onrender.com/api/v1`
   - `VITE_SOCKET_URL` = `https://streamverse-api.onrender.com`
4. Deploy. `client/vercel.json` already handles SPA rewrites (so refreshing `/stream/abc123` doesn't 404) and adds baseline security headers.
5. Once deployed, copy the Vercel URL back into Render's `CLIENT_URL` env var and redeploy the backend — this is what makes CORS and the refresh cookie's `sameSite=none` actually work cross-origin.

## 5. Google OAuth (optional but part of the spec)

1. console.cloud.google.com → new project → APIs & Services → Credentials → Create OAuth Client ID (Web application).
2. Authorized redirect URI: `https://streamverse-api.onrender.com/api/v1/auth/google/callback`
3. Authorized JavaScript origin: your Vercel URL.
4. Copy Client ID/Secret into Render's `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
5. If these env vars are left blank, `config/passport.js` simply never registers the Google strategy — the rest of the app (including local login) works unaffected; the "Continue with Google" button will just 404 until configured.

## 6. Email (SMTP)

Any SMTP provider works (Gmail app password, SendGrid, Mailtrap for testing). If `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are left unset, `email.service.js` logs the verification/reset email content to the Render logs instead of sending — useful for a demo where you don't want to wire up real email, but mention this in your portfolio writeup so it doesn't look broken.

## 7. Post-deploy checklist

- [ ] `GET https://<render-url>/health` returns `{ success: true, ... }`
- [ ] Signup/login works end-to-end from the deployed frontend
- [ ] A refresh of a deep link (e.g. `/browse`) doesn't 404 (confirms `vercel.json` rewrites are active)
- [ ] Opening a stream page connects the socket (check the browser Network tab for a `101 Switching Protocols`)
- [ ] Uploading an avatar/thumbnail actually lands in your Cloudinary media library
- [ ] CORS: no `blocked by CORS policy` errors in the browser console (confirms `CLIENT_URL` matches the deployed frontend exactly, including `https://`)

## Local development (no deployment needed)

```bash
# Terminal 1 — backend
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI at minimum; everything else has safe local defaults/dev fallbacks
npm run dev

# Terminal 2 — frontend
cd client
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:5000` (see `client/vite.config.js`), so `VITE_API_BASE_URL` can even be left as the relative default in local dev.
