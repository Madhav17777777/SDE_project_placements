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

**Streaming:** any logged-in user can create a channel and go live — no separate "become a streamer" upgrade gate. Real peer-to-peer camera video via WebRTC (signaled over the existing Socket.io connection), live viewer count (derived from actual Socket.io room membership), stream categories/tags, live/featured/scheduled feeds.

**Video:** upload, edit, delete, trending feed (recency-weighted ranking, not just raw views), like/dislike, nested comments with pin, share, bookmarks, watch later, watch history, liked videos.

**Realtime chat:** Socket.io rooms per stream, typing indicators, emoji picker, auto-scroll, join/leave, slow mode, follower-only mode, per-stream bans — all pushed live to every viewer in the room.

**Social:** follow/unfollow channels, followers/following lists, realtime "you have a new follower" and "channel you follow just went live" notifications.

**Search:** unified search across users, videos, streams, and categories.

**Admin panel:** dashboard stats, ban/delete users (with cascade cleanup), remove streams.

**Design:** dark theme, custom violet accent (not Twitch's purple), glassmorphism cards, Framer Motion page/hover transitions, fully responsive.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router DOM, Tailwind CSS, Framer Motion, Axios, TanStack Query, React Hook Form, Zod, Socket.io Client, Zustand, WebRTC |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Multer, Cloudinary, bcrypt, express-validator, Winston, Morgan, Helmet |
| Testing | Jest + Supertest + mongodb-memory-server (backend), Vitest + React Testing Library (frontend) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database), Cloudinary (media) |

## Architecture

Full system diagram, request-lifecycle sequence diagrams, and the auth token lifecycle: **[docs/architecture-diagram.md](./docs/architecture-diagram.md)**.

Short version: `client/` is a Vite SPA that talks to `server/`'s REST API over Axios (with automatic refresh-token retry on 401) and to its Socket.io server for chat/viewer-count/notifications/WebRTC signaling. MongoDB Atlas is the datastore; Cloudinary holds every image/video asset so Render's ephemeral filesystem never has to.

## Screenshots

_Add screenshots here once deployed — recommended shots: Home page (live/trending/categories), Stream page (player + live chat), Video page (comments), Channel page, and the Streamer Dashboard. Drop images in a `docs/screenshots/` folder and reference them here, e.g.:_

```md
![Home page](./docs/screenshots/home.png)
![Stream page with live chat](./docs/screenshots/stream.png)
```

## Project Structure

Full annotated tree: **[docs/02-folder-structure.md](./docs/02-folder-structure.md)**.
