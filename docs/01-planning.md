# StreamVerse — Phase 1: Project Planning

## 1. Explanation

StreamVerse is a MERN monorepo split into two independently deployable apps:

- `server/` — Express REST API + Socket.io realtime server. Deployed to Render.
- `client/` — React 18 + Vite SPA. Deployed to Vercel.

Architecture decisions and why:

- **Monorepo, two packages, no shared workspace tooling (no Turborepo/Nx).** Keeps the project approachable for a placement portfolio reviewer who clones the repo — `cd server && npm i && npm run dev`, `cd client && npm i && npm run dev`. No build-tool learning curve.
- **MVC + service layer on the backend.** Controllers stay thin (parse request, call service, format response). Services hold business logic. This is the layering interviewers expect and it keeps controllers testable in isolation from Mongoose.
- **Centralized error handling.** A single `AppError` class + `errorHandler` middleware means every controller can `throw new AppError(...)` and never write its own try/catch/status-code boilerplate. Async route handlers are wrapped once via an `asyncHandler` utility.
- **Centralized response format.** Every API response — success or failure — has the same envelope (`success`, `message`, `data`, `errors`). This makes the frontend's Axios interceptor and React Query error handling trivial and consistent.
- **JWT access + refresh token pair, refresh token in httpOnly cookie.** Access token is short-lived (15m) and held in memory on the client (Zustand, not localStorage) to reduce XSS blast radius. Refresh token is long-lived (7–30d) in an httpOnly, secure, sameSite cookie, rotated on use.
- **Socket.io namespaces/rooms per stream (`stream:<streamId>`)** rather than one global socket firehose — keeps chat and viewer-count broadcasts scoped and scalable.
- **Cloudinary for all binary assets** (avatars, banners, thumbnails, and video files for the MVP) instead of the Render filesystem, which is ephemeral and unsuitable for uploads.

## 2. Build Order (why this phase order)

1. Planning/DB/API design (this phase) — nothing gets coded against a moving schema.
2. Backend skeleton (server boot, DB connect, logging, error handling, security middleware) — every later phase depends on this existing and working.
3. Auth — almost every other resource is owned by a user, so auth must exist first.
4. User module — profile/follow/notifications sit directly on top of auth.
5. Streaming module — depends on Channels (owned by Users).
6. Video module — reuses the comment/like/notification patterns established in phases 4–5.
7. Chat (Socket.io) — layers realtime on top of streams, which must exist first.
8. Frontend — built last so it can consume a finished, stable API instead of chasing a moving target.
9. Testing — written alongside each backend phase in practice, but formalized/consolidated here.
10. Deployment — final step once everything is verified locally.

## 3. Success Criteria for Phase 1

- Folder structure exists for `server/` and `client/`, matching `docs/02-folder-structure.md`.
- Every MongoDB collection has a documented schema in `docs/03-database-design.md` with fields, types, relations, and indexes.
- Every REST endpoint the app will ever need is listed in `docs/04-api-design.md` with method, path, auth requirement, and purpose.
- `.gitignore` and `.env.example` exist so no secrets are ever committed.
- Root `README.md` stub exists (fleshed out fully in Phase 10).

## 4. Commands

```bash
mkdir StreamVerse && cd StreamVerse
git init
mkdir server client docs
mkdir -p server/src/{config,controllers,models,routes,middlewares,utils,services,validations,sockets}
mkdir -p client/src/{components,pages,layouts,hooks,context,services,store,utils,constants,assets,styles}
```

## 5. Testing (Phase 1)

Phase 1 produces no runtime code, so "testing" here means structural verification:

```bash
find server/src -maxdepth 1 -type d
find client/src -maxdepth 1 -type d
```

Confirm the output matches `docs/02-folder-structure.md` exactly.

## 6. Git Commit Message

```
chore: initial project planning, folder structure, DB & API design docs
```
