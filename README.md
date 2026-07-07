# StreamVerse

A modern, Twitch-inspired live streaming platform, built end-to-end on the MERN stack. Creators go live, upload videos, chat with viewers in real time, manage their channel, and build a following; viewers browse, watch, comment, and follow. Built as a placement/internship portfolio project — production-shaped architecture, not a toy CRUD app.

> Not affiliated with Twitch. UI, theming, and product decisions are original.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [License](#license)

## Features

**Authentication:** signup/login, JWT access + rotating refresh tokens (httpOnly cookie), email verification, forgot/reset password, Google OAuth, role-based access control (user / streamer / admin).

**Streaming:** create a channel, schedule and go live, mocked stream ingest with a real playback URL shape, live viewer count (derived from actual Socket.io room membership), stream categories/tags, live/featured/scheduled feeds.

**Video:** upload, edit, delete, trending feed (recency-weighted ranking, not just raw views), like/dislike, nested comments with pin, share, bookmarks, watch later, watch history, liked videos.

**Realtime chat:** Socket.io rooms per stream, typing indicators, emoji picker, auto-scroll, join/leave, slow mode, follower-only mode, per-stream bans — all pushed live to every viewer in the room.

**Social:** follow/unfollow channels, followers/following lists, realtime "you have a new follower" and "channel you follow just went live" notifications.

**Search:** unified search across users, videos, streams, and categories.

**Admin panel:** dashboard stats, ban/delete users (with cascade cleanup), remove streams.

**Design:** dark theme, custom violet accent (not Twitch's purple), glassmorphism cards, Framer Motion page/hover transitions, fully responsive.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router DOM, Tailwind CSS, Framer Motion, Axios, TanStack Query, React Hook Form, Zod, Socket.io Client, Zustand |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Multer, Cloudinary, bcrypt, express-validator, Winston, Morgan, Helmet |
| Testing | Jest + Supertest + mongodb-memory-server (backend), Vitest + React Testing Library (frontend) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database), Cloudinary (media) |

## Architecture

Full system diagram, request-lifecycle sequence diagrams, and the auth token lifecycle: **[docs/architecture-diagram.md](./docs/architecture-diagram.md)**.

Short version: `client/` is a Vite SPA that talks to `server/`'s REST API over Axios (with automatic refresh-token retry on 401) and to its Socket.io server for chat/viewer-count/notifications. MongoDB Atlas is the datastore; Cloudinary holds every image/video asset so Render's ephemeral filesystem never has to.

## Screenshots

_Add screenshots here once deployed — recommended shots: Home page (live/trending/categories), Stream page (player + live chat), Video page (comments), Channel page, and the Streamer Dashboard. Drop images in a `docs/screenshots/` folder and reference them here, e.g.:_

```md
![Home page](./docs/screenshots/home.png)
![Stream page with live chat](./docs/screenshots/stream.png)
```

## Project Structure

Full annotated tree: **[docs/02-folder-structure.md](./docs/02-folder-structure.md)**.

```
StreamVerse/
├── server/     # Express + Socket.io API (MVC + service layer)
├── client/     # React 18 + Vite SPA
├── docs/       # Planning, DB design, API design, architecture, deployment
└── .github/    # CI workflow
```

## Getting Started

Prerequisites: Node.js 18+, a MongoDB connection string (local `mongod` or a free Atlas cluster), and (optionally, for full functionality) a Cloudinary account.

```bash
git clone https://github.com/<your-username>/streamverse.git
cd streamverse

# Backend
cd server
npm install
cp .env.example .env      # fill in MONGODB_URI at minimum
npm run dev                # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev                # http://localhost:5173
```

Visit `http://localhost:5173`. In dev, Vite proxies `/api` requests to `http://localhost:5000` (see `client/vite.config.js`), so the frontend works out of the box against a local backend.

## Environment Variables

Full reference with descriptions: `server/.env.example` and `client/.env.example`. Summary:

**server/.env** — `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `COOKIE_SECRET` are required; `CLOUDINARY_*`, `SMTP_*`, `GOOGLE_*` degrade gracefully if left blank (uploads/email/Google login simply won't work until configured — everything else still runs).

**client/.env** — `VITE_API_BASE_URL`, `VITE_SOCKET_URL` (both default sensibly for local dev via the Vite proxy).

## API Documentation

Every REST endpoint (method, path, auth requirement, purpose) and every Socket.io event: **[docs/04-api-design.md](./docs/04-api-design.md)**.

Database schema (12 collections, indexes, ER diagram): **[docs/03-database-design.md](./docs/03-database-design.md)**.

## Testing

```bash
cd server && npm test    # Jest + Supertest + in-memory MongoDB
cd client && npm test    # Vitest + React Testing Library
```

Backend coverage spans auth, users, follow, streams, videos, comments, likes, chat (including a real Socket.io end-to-end test), categories, notifications, search, and admin. Frontend coverage spans utility functions and key components (Button, Avatar, Badge, CommentItem, FollowButton).

## Deployment

Step-by-step guide for MongoDB Atlas, Cloudinary, Render, and Vercel: **[docs/deployment-guide.md](./docs/deployment-guide.md)**.

`render.yaml` at the repo root is a Render Blueprint for one-click backend provisioning. `client/vercel.json` handles SPA routing and security headers on Vercel.

## Known Limitations

This is a portfolio project, not a production streaming service — a few things are intentionally simplified, and called out in code comments where relevant:

- **No real RTMP/HLS ingest.** "Going live" generates a realistic-shaped `streamKey`/`playbackUrl` but there's no actual video pipeline behind it (that's a dedicated media-server infrastructure project on its own). The stream page renders the thumbnail where a real player would sit.
- **Email is optional.** Without SMTP credentials configured, verification/reset emails are logged to the server console instead of sent.
- **Render free tier cold starts.** The backend spins down after ~15 minutes idle; the first request after that takes 30-60s.
- **"Subscriber-only" chat** is implemented as "followers-only" — there's no payment/subscription tier in this project.

## License

MIT — see [LICENSE](./LICENSE).
