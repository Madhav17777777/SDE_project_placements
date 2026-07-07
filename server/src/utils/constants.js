// Central place for enums/magic strings shared across models, controllers,
// and validations, so a typo like 'streammer' can't silently create a new
// role that bypasses the role-based auth middleware.

export const ROLES = Object.freeze({
  USER: 'user',
  STREAMER: 'streamer',
  ADMIN: 'admin',
});

export const AUTH_PROVIDERS = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
});

export const STREAM_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
});

export const VIDEO_VISIBILITY = Object.freeze({
  PUBLIC: 'public',
  UNLISTED: 'unlisted',
  PRIVATE: 'private',
});

export const REACTION_TYPES = Object.freeze({
  LIKE: 'like',
  DISLIKE: 'dislike',
});

export const TARGET_TYPES = Object.freeze({
  VIDEO: 'Video',
  COMMENT: 'Comment',
});

export const NOTIFICATION_TYPES = Object.freeze({
  LIVE: 'live',
  COMMENT: 'comment',
  LIKE: 'like',
  FOLLOW: 'follow',
  REPLY: 'reply',
  SYSTEM: 'system',
});

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

// Socket.io room-naming conventions, shared by the sockets/ layer (which
// joins/emits to these rooms) and plain service functions (which need to
// emit to a room but must NOT import anything from sockets/ -- stream.service
// is already a dependency of sockets/stream.socket.js, so the reverse import
// would create a circular module graph). This file has no dependents inside
// sockets/ or services/ that could cycle back, so it's a safe shared home.
export const socketRooms = Object.freeze({
  user: (userId) => `user:${userId}`,
  stream: (streamId) => `stream:${streamId}`,
});
