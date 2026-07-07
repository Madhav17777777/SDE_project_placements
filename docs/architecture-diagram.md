# StreamVerse — Architecture Diagram

## System overview

```mermaid
flowchart TB
    subgraph Client["Client (Vercel)"]
        R["React 18 + Vite SPA"]
        Z["Zustand stores"]
        RQ["TanStack Query cache"]
        SIO_C["Socket.io client"]
        R --- Z
        R --- RQ
        R --- SIO_C
    end

    subgraph Server["Server (Render)"]
        EXP["Express REST API<br/>/api/v1/*"]
        SIO_S["Socket.io server"]
        MW["Middleware: helmet, cors,<br/>rate limit, JWT auth, RBAC"]
        SVC["Service layer<br/>(business logic)"]
        MW --> EXP
        EXP --> SVC
        SIO_S --> SVC
    end

    subgraph Data["Data & Media"]
        ATLAS[("MongoDB Atlas")]
        CLOUD[("Cloudinary<br/>images + video")]
    end

    SMTP["SMTP provider<br/>(email verification, password reset)"]
    GOOGLE["Google OAuth 2.0"]

    RQ -- "HTTPS, Axios<br/>+ httpOnly refresh cookie" --> EXP
    SIO_C -- "WebSocket<br/>(JWT in handshake)" --> SIO_S

    SVC --> ATLAS
    SVC --> CLOUD
    SVC --> SMTP
    EXP --> GOOGLE

    style Client fill:#141220,stroke:#8b5cf6,color:#fff
    style Server fill:#141220,stroke:#8b5cf6,color:#fff
    style Data fill:#0d0b16,stroke:#6d28d9,color:#fff
```

## Request lifecycle: watching a live stream and chatting

```mermaid
sequenceDiagram
    participant U as Browser
    participant V as Vercel (React SPA)
    participant R as Render (Express + Socket.io)
    participant M as MongoDB Atlas

    U->>V: Navigate to /stream/:id
    V->>R: GET /api/v1/streams/:id (Axios, Bearer access token)
    R->>M: Stream.findById(...).populate(channel/owner)
    M-->>R: stream document
    R-->>V: 200 { stream }
    V->>R: Socket.io connect (auth: { token })
    R->>R: socketAuthMiddleware verifies JWT, loads user
    V->>R: emit chat:join { streamId }
    R->>M: Chat.findOne/create, Message.find (recent history)
    R-->>V: emit chat:history { messages }
    R-->>V: emit stream:viewerCount { count } (broadcast to room)
    U->>V: types a message, hits send
    V->>R: emit chat:message { streamId, content }
    R->>M: chat.service.postMessage (bans/slow-mode/follower-only checks, save)
    R-->>V: emit chat:message (broadcast to everyone in stream:<id> room)
```

## Auth token lifecycle

```mermaid
sequenceDiagram
    participant V as Client
    participant R as API

    V->>R: POST /auth/login
    R-->>V: 200 { accessToken } + Set-Cookie refreshToken (httpOnly)
    Note over V: accessToken kept in memory (Zustand),<br/>never localStorage
    V->>R: GET /api/v1/... (Authorization: Bearer accessToken)
    R-->>V: 401 (access token expired, 15m TTL)
    V->>R: POST /auth/refresh-token (cookie sent automatically)
    R->>R: verify refresh JWT, check hash in RefreshToken collection,<br/>check tokenVersion, rotate (revoke old, issue new)
    R-->>V: 200 { accessToken } + Set-Cookie refreshToken (new)
    V->>R: retries original request with new accessToken
```

## Deployment topology

- **Frontend**: Vercel, static build of `client/` (`vite build` output), SPA rewrites via `client/vercel.json` so React Router handles all paths client-side.
- **Backend**: Render web service, `server/` as root directory, `render.yaml` blueprint provisions env vars and the `/health` check.
- **Database**: MongoDB Atlas, free M0 cluster is sufficient for this project's scale.
- **Media storage**: Cloudinary, used for avatars, banners, thumbnails, and video files (no media ever touches Render's ephemeral filesystem).
- **CORS/cookies**: `CLIENT_URL` env var on the backend drives both the CORS `origin` and the refresh-cookie `sameSite`/`secure` flags (`none`/`true` in production) so the cross-origin Vercel <-> Render cookie flow works over HTTPS.
