# StreamVerse — Database Design (MongoDB / Mongoose)

Naming convention: collections are the plural, lowercase form of the model name (Mongoose default). All `_id` references use `mongoose.Schema.Types.ObjectId` with a `ref`. All schemas get `{ timestamps: true }` unless noted.

---

## 1. `users`

| Field | Type | Notes |
|---|---|---|
| `username` | String, required, unique, lowercase, trim, indexed | 3–20 chars |
| `email` | String, required, unique, lowercase, trim, indexed | |
| `password` | String, required, select:false | bcrypt hash, omitted from queries by default |
| `fullName` | String, required | |
| `avatar` | String (URL) | Cloudinary secure_url |
| `avatarPublicId` | String | Cloudinary public_id, for deletion/replacement |
| `banner` | String (URL) | |
| `bannerPublicId` | String | |
| `bio` | String, maxlength 300 | |
| `role` | String enum: `user`, `streamer`, `admin`, default `user` | |
| `isEmailVerified` | Boolean, default false | |
| `emailVerificationToken` | String, select:false | hashed |
| `emailVerificationExpires` | Date, select:false | |
| `passwordResetToken` | String, select:false | hashed |
| `passwordResetExpires` | Date, select:false | |
| `googleId` | String, sparse index | present if signed up via Google |
| `authProvider` | String enum: `local`, `google`, default `local` | |
| `channel` | ObjectId ref `Channel` | null until user creates a channel |
| `watchHistory` | [ObjectId ref `Video`] | most-recent-first, capped at 200 via `$push` + `$slice` |
| `bookmarks` | [ObjectId ref `Video`] | |
| `watchLater` | [ObjectId ref `Video`] | |
| `refreshTokenVersion` | Number, default 0 | bumped to invalidate all refresh tokens (logout-all / password change) |
| `isBanned` | Boolean, default false | admin moderation |

**Indexes:** `{ username: 1 }` unique, `{ email: 1 }` unique, text index on `{ username: "text", fullName: "text" }` for user search.

---

## 2. `channels`

| Field | Type | Notes |
|---|---|---|
| `owner` | ObjectId ref `User`, required, unique | one channel per user |
| `channelName` | String, required, unique, trim | display name, can differ from username |
| `slug` | String, required, unique, indexed | URL-safe, derived from channelName |
| `description` | String, maxlength 1000 | |
| `category` | ObjectId ref `Category` | primary content category |
| `tags` | [String] | |
| `followersCount` | Number, default 0 | denormalized counter, updated on follow/unfollow |
| `totalViews` | Number, default 0 | |
| `isLive` | Boolean, default false | denormalized from current `Stream` |
| `currentStream` | ObjectId ref `Stream`, default null | |
| `socials` | { twitter: String, instagram: String, youtube: String, discord: String } | |

**Indexes:** `{ slug: 1 }` unique, `{ owner: 1 }` unique, text index on `{ channelName: "text", description: "text" }`.

---

## 3. `streams`

| Field | Type | Notes |
|---|---|---|
| `channel` | ObjectId ref `Channel`, required, indexed | |
| `title` | String, required, maxlength 140 | |
| `thumbnail` | String (URL) | Cloudinary |
| `thumbnailPublicId` | String | |
| `category` | ObjectId ref `Category` | |
| `tags` | [String] | |
| `status` | String enum: `scheduled`, `live`, `ended`, default `scheduled`, indexed | |
| `scheduledFor` | Date | used when status = scheduled |
| `startedAt` | Date | |
| `endedAt` | Date | |
| `streamKey` | String, select:false | secret used by RTMP-style ingest (mocked in MVP) |
| `playbackUrl` | String | HLS/mock playback URL |
| `viewerCount` | Number, default 0 | live, updated via socket events |
| `peakViewerCount` | Number, default 0 | |
| `totalChatMessages` | Number, default 0 | |

**Indexes:** `{ status: 1, startedAt: -1 }` (Live Now feed), `{ category: 1, status: 1 }` (browse by category), text index on `{ title: "text", tags: "text" }`.

---

## 4. `videos`

| Field | Type | Notes |
|---|---|---|
| `owner` | ObjectId ref `User`, required, indexed | |
| `channel` | ObjectId ref `Channel`, required, indexed | |
| `title` | String, required, maxlength 140 | |
| `description` | String, maxlength 5000 | |
| `videoUrl` | String, required | Cloudinary secure_url (video resource) |
| `videoPublicId` | String | |
| `thumbnail` | String | |
| `thumbnailPublicId` | String | |
| `duration` | Number (seconds) | |
| `category` | ObjectId ref `Category` | |
| `tags` | [String] | |
| `views` | Number, default 0 | |
| `likesCount` | Number, default 0 | denormalized |
| `dislikesCount` | Number, default 0 | denormalized |
| `commentsCount` | Number, default 0 | denormalized |
| `visibility` | String enum: `public`, `unlisted`, `private`, default `public` | |
| `isVodOfStream` | ObjectId ref `Stream`, default null | set if this video is a saved recording of a past stream |

**Indexes:** `{ channel: 1, createdAt: -1 }`, `{ category: 1 }`, text index on `{ title: "text", description: "text", tags: "text" }`.

---

## 5. `comments`

| Field | Type | Notes |
|---|---|---|
| `video` | ObjectId ref `Video`, required, indexed | |
| `author` | ObjectId ref `User`, required | |
| `content` | String, required, maxlength 2000 | |
| `parentComment` | ObjectId ref `Comment`, default null, indexed | null = top-level; set = reply (nested one level, flattened storage) |
| `likesCount` | Number, default 0 | |
| `isPinned` | Boolean, default false | only one pinned comment per video, enforced in service layer |
| `isEdited` | Boolean, default false | |

**Indexes:** `{ video: 1, parentComment: 1, createdAt: -1 }`.

**Design note:** nested replies are stored flat (every comment references its top-level parent via `parentComment`), not embedded arrays. This avoids the 16MB document size ceiling and unbounded array growth on popular videos. The API groups replies under their parent when returning a page of top-level comments.

---

## 6. `likes`

Polymorphic like/dislike record, one per (user, target).

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId ref `User`, required | |
| `targetType` | String enum: `Video`, `Comment`, required | |
| `target` | ObjectId, required, refPath `targetType` | |
| `type` | String enum: `like`, `dislike`, required | |

**Indexes:** `{ user: 1, target: 1, targetType: 1 }` unique compound — guarantees one reaction per user per target and doubles as the upsert key.

---

## 7. `follows`

| Field | Type | Notes |
|---|---|---|
| `follower` | ObjectId ref `User`, required | the user doing the following |
| `channel` | ObjectId ref `Channel`, required | the channel being followed |

**Indexes:** `{ follower: 1, channel: 1 }` unique compound (prevents duplicate follows, used as the toggle key), `{ channel: 1 }` (followers list), `{ follower: 1 }` (following list).

---

## 8. `notifications`

| Field | Type | Notes |
|---|---|---|
| `recipient` | ObjectId ref `User`, required, indexed | |
| `sender` | ObjectId ref `User` | null for system notifications |
| `type` | String enum: `live`, `comment`, `like`, `follow`, `reply`, `system`, required | |
| `message` | String, required | precomposed display text |
| `link` | String | frontend route to navigate to on click |
| `relatedEntity` | { entityType: String enum(`Stream`,`Video`,`Comment`,`Channel`), entityId: ObjectId } | |
| `isRead` | Boolean, default false, indexed | |

**Indexes:** `{ recipient: 1, isRead: 1, createdAt: -1 }`.

---

## 9. `categories`

| Field | Type | Notes |
|---|---|---|
| `name` | String, required, unique | e.g. "Just Chatting", "Software Development" |
| `slug` | String, required, unique | |
| `thumbnail` | String (URL) | category tile image |
| `viewerCount` | Number, default 0 | denormalized aggregate of live viewers in this category |

**Indexes:** `{ slug: 1 }` unique, text index on `{ name: "text" }`.

---

## 10. `chats` (chat rooms)

| Field | Type | Notes |
|---|---|---|
| `stream` | ObjectId ref `Stream`, required, unique | one chat room per stream |
| `isSlowMode` | Boolean, default false | |
| `slowModeDelaySec` | Number, default 0 | |
| `isSubscriberOnly` | Boolean, default false | |
| `bannedUsers` | [ObjectId ref `User`] | banned from this room specifically |

---

## 11. `messages` (chat messages)

Kept as its own collection (not embedded in `chats`) since a popular live stream can generate thousands of messages per hour — unbounded embedding would blow past MongoDB's document size limit immediately.

| Field | Type | Notes |
|---|---|---|
| `chat` | ObjectId ref `Chat`, required, indexed | |
| `sender` | ObjectId ref `User`, required | |
| `content` | String, required, maxlength 500 | |
| `isDeleted` | Boolean, default false | soft delete, for moderation |

**Indexes:** `{ chat: 1, createdAt: -1 }`. TTL index (optional, e.g. 30 days) can be added later to auto-expire old chat history.

---

## 12. `refreshtokens`

Separate collection (rather than storing only on the User doc) so a user can be logged in on multiple devices and revoke one session without logging out everywhere.

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId ref `User`, required, indexed | |
| `tokenHash` | String, required | SHA-256 hash of the raw refresh token (raw value never stored) |
| `expiresAt` | Date, required | TTL index, MongoDB auto-deletes expired docs |
| `userAgent` | String | device/browser fingerprint for the sessions list UI |
| `revokedAt` | Date, default null | |

**Indexes:** `{ tokenHash: 1 }` unique, TTL index on `{ expiresAt: 1 }` with `expireAfterSeconds: 0`.

---

## Entity Relationship Summary

```
User 1---1 Channel
Channel 1---N Stream
Channel 1---N Video
User    1---N Video          (owner, denormalized copy of channel.owner)
Video   1---N Comment
Comment 1---N Comment        (self-ref via parentComment, one level deep)
User    1---N Like  ---1 (Video | Comment)
User    N---N Channel        (via Follow join collection)
User    1---N Notification   (as recipient)
Stream  1---1 Chat
Chat    1---N Message
User    1---N RefreshToken
Category 1---N Channel / Stream / Video
```
