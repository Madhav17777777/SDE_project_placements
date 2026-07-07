// Single source of truth for route paths -- components build links from
// these instead of hand-typing strings, so a path change is a one-line edit.
export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  SEARCH: '/search',
  STREAM: (id = ':streamId') => `/stream/${id}`,
  VIDEO: (id = ':videoId') => `/watch/${id}`,
  CHANNEL: (slug = ':slug') => `/channel/${slug}`,

  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: (token = ':token') => `/reset-password/${token}`,
  VERIFY_EMAIL: (token = ':token') => `/verify-email/${token}`,
  OAUTH_CALLBACK: '/oauth-callback',

  PROFILE_SETTINGS: '/settings/profile',
  NOTIFICATIONS: '/settings/notifications',
  WATCH_HISTORY: '/settings/history',
  BOOKMARKS: '/settings/bookmarks',

  STREAMER_DASHBOARD: '/dashboard',
  STREAM_MANAGER: '/dashboard/streams',
  UPLOAD_VIDEO: '/dashboard/upload',
  CHANNEL_SETTINGS: '/dashboard/channel',

  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_STREAMS: '/admin/streams',
};
