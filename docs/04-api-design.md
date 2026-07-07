# StreamVerse — API Design

Base URL: `/api/v1`

Response envelope (every endpoint, success or failure):

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "errors": []
}
```

Auth column key: **Public** = no token needed · **User** = any authenticated role · **Streamer** = authenticated + `role: streamer` (or resource owner) · **Admin** = authenticated + `role: admin`.

---

## Auth — `/api/v1/auth`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/signup` | Public | Create account, sends verification email |
| POST | `/login` | Public | Email/username + password login, sets refresh cookie, returns access token |
| POST | `/logout` | User | Revokes current refresh token, clears cookie |
| POST | `/refresh-token` | Public (cookie) | Issues new access token from valid refresh cookie, rotates refresh token |
| POST | `/forgot-password` | Public | Sends password reset email with time-limited token |
| POST | `/reset-password/:token` | Public | Sets new password, invalidates all existing refresh tokens |
| GET | `/verify-email/:token` | Public | Marks account verified |
| POST | `/resend-verification` | User | Resends verification email |
| GET | `/google` | Public | Redirects to Google OAuth consent |
| GET | `/google/callback` | Public | Handles Google OAuth callback, issues tokens |
| GET | `/me` | User | Returns current authenticated user |

## Users — `/api/v1/users`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/:username` | Public | Public profile |
| PATCH | `/me` | User | Update fullName/bio |
| PATCH | `/me/avatar` | User | Upload/replace avatar (multipart, Multer -> Cloudinary) |
| PATCH | `/me/banner` | User | Upload/replace banner |
| PATCH | `/me/password` | User | Change password (requires current password) |
| GET | `/me/watch-history` | User | Paginated watch history |
| DELETE | `/me/watch-history/:videoId` | User | Remove one entry |
| GET | `/me/bookmarks` | User | Paginated bookmarks |
| POST | `/me/bookmarks/:videoId` | User | Add bookmark |
| DELETE | `/me/bookmarks/:videoId` | User | Remove bookmark |
| GET | `/me/watch-later` | User | Paginated watch-later list |
| POST | `/me/watch-later/:videoId` | User | Add to watch later |
| DELETE | `/me/watch-later/:videoId` | User | Remove |
| GET | `/me/liked-videos` | User | Videos the user liked |

## Channels — `/api/v1/channels`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/` | User | Create a channel (promotes role to `streamer`) |
| GET | `/:slug` | Public | Channel public page data |
| PATCH | `/me` | Streamer | Edit own channel (name, description, category, tags, socials) |
| PATCH | `/me/avatar` | Streamer | Uses user avatar unless channel-specific override needed |
| GET | `/:slug/videos` | Public | Paginated videos for a channel |
| GET | `/:slug/streams` | Public | Past/scheduled streams for a channel |
| GET | `/:slug/followers` | Public | Followers list |
| GET | `/me/following` | User | Channels the current user follows |

## Follow — `/api/v1/follow`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/:channelId` | User | Follow (idempotent toggle-on) |
| DELETE | `/:channelId` | User | Unfollow |
| GET | `/:channelId/status` | User | Is-following boolean for current user |

## Streams — `/api/v1/streams`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/live` | Public | "Live Now" feed, paginated, filterable by category |
| GET | `/featured` | Public | Featured stream(s) for hero section |
| GET | `/:id` | Public | Single stream detail + playback info |
| POST | `/` | Streamer | Create/schedule a stream |
| PATCH | `/:id` | Streamer | Edit title/category/tags/thumbnail before or during stream |
| POST | `/:id/go-live` | Streamer | Transition scheduled/draft -> live, generates streamKey/playbackUrl |
| POST | `/:id/end` | Streamer | Transition live -> ended, snapshots peak viewer count |
| GET | `/:id/viewers` | Public | Current viewer count (also pushed via socket) |
| GET | `/scheduled` | Public | Upcoming scheduled streams |

## Videos — `/api/v1/videos`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Public | Browse/paginated, filter by category/tag/sort |
| GET | `/trending` | Public | Trending feed (views + recency weighted) |
| GET | `/:id` | Public | Video detail, increments view count |
| POST | `/` | Streamer | Upload video (multipart -> Cloudinary, async-friendly) |
| PATCH | `/:id` | Streamer | Edit title/description/thumbnail/visibility/tags |
| DELETE | `/:id` | Streamer | Delete video + Cloudinary asset cleanup |
| POST | `/:id/share` | Public | Returns shareable link, increments share metric |

## Likes — `/api/v1/likes`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/video/:videoId` | User | Body `{ type: "like" \| "dislike" }`, upserts, toggles off if same type resent |
| DELETE | `/video/:videoId` | User | Remove reaction |
| POST | `/comment/:commentId` | User | Like a comment |
| DELETE | `/comment/:commentId` | User | Remove |

## Comments — `/api/v1/comments`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/video/:videoId` | Public | Paginated top-level comments with first page of replies |
| GET | `/:commentId/replies` | Public | Paginated replies for a specific comment |
| POST | `/video/:videoId` | User | Create top-level comment |
| POST | `/:commentId/reply` | User | Reply to a comment |
| PATCH | `/:commentId` | User (owner) | Edit own comment |
| DELETE | `/:commentId` | User (owner) or Streamer (video owner) or Admin | Delete comment |
| POST | `/:commentId/pin` | Streamer (video owner) | Pin/unpin a comment on own video |

## Notifications — `/api/v1/notifications`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | User | Paginated notifications |
| GET | `/unread-count` | User | Badge count |
| PATCH | `/:id/read` | User | Mark one read |
| PATCH | `/read-all` | User | Mark all read |
| DELETE | `/:id` | User | Delete one |

## Categories — `/api/v1/categories`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Public | List all, with live viewer counts, for browse page |
| GET | `/:slug` | Public | Category detail + its live streams/videos |
| POST | `/` | Admin | Create category |
| PATCH | `/:id` | Admin | Edit category |
| DELETE | `/:id` | Admin | Delete category |

## Search — `/api/v1/search`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/?q=&type=` | Public | Unified search; `type` in `all\|users\|videos\|streams\|categories` |

## Admin — `/api/v1/admin`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/dashboard` | Admin | Aggregate stats: total users, streamers, live streams, videos, DAU proxy |
| GET | `/users` | Admin | Paginated user list with filters |
| PATCH | `/users/:id/ban` | Admin | Ban/unban |
| DELETE | `/users/:id` | Admin | Delete user + cascade cleanup |
| GET | `/streams` | Admin | All streams, including flagged/reported |
| DELETE | `/streams/:id` | Admin | Force-end/remove a stream |
| GET | `/reports` | Admin | Content reports queue (future: user-submitted reports) |
| PATCH | `/reports/:id/resolve` | Admin | Mark a report resolved |

---

## Socket.io Events (not REST, documented here for completeness)

| Event (client -> server) | Payload | Purpose |
|---|---|---|
| `chat:join` | `{ streamId }` | Join a stream's chat room |
| `chat:leave` | `{ streamId }` | Leave room |
| `chat:message` | `{ streamId, content }` | Send a chat message |
| `chat:typing` | `{ streamId }` | Broadcast typing indicator |

| Event (server -> client) | Payload | Purpose |
|---|---|---|
| `chat:message` | `{ message }` | New message broadcast to room |
| `chat:typing` | `{ userId, username }` | Someone is typing |
| `stream:viewerCount` | `{ streamId, count }` | Live viewer count update |
| `stream:live` | `{ streamId, channel }` | Broadcast to followers when a followed channel goes live |
| `notification:new` | `{ notification }` | Realtime push of a new notification |

## Standard Error Responses

| Status | Meaning |
|---|---|
| 400 | Validation error (express-validator failures, in `errors[]`) |
| 401 | Missing/invalid/expired access token |
| 403 | Authenticated but insufficient role/ownership |
| 404 | Resource not found |
| 409 | Conflict (duplicate username/email, duplicate follow, etc.) |
| 429 | Rate limit exceeded |
| 500 | Unhandled server error (logged via Winston, generic message returned to client) |
