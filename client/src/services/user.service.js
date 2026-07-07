import { api } from './axiosInstance.js';

export const userService = {
  getProfile: (username) => api.get(`/users/${username}`).then((r) => r.data),
  updateProfile: (payload) => api.patch('/users/me', payload).then((r) => r.data),
  updateAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.patch('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  updateBanner: (file) => {
    const form = new FormData();
    form.append('banner', file);
    return api.patch('/users/me/banner', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  changePassword: (payload) => api.patch('/users/me/password', payload).then((r) => r.data),

  getWatchHistory: (params) => api.get('/users/me/watch-history', { params }).then((r) => r.data),
  removeFromWatchHistory: (videoId) => api.delete(`/users/me/watch-history/${videoId}`).then((r) => r.data),

  getBookmarks: (params) => api.get('/users/me/bookmarks', { params }).then((r) => r.data),
  addBookmark: (videoId) => api.post(`/users/me/bookmarks/${videoId}`).then((r) => r.data),
  removeBookmark: (videoId) => api.delete(`/users/me/bookmarks/${videoId}`).then((r) => r.data),

  getWatchLater: (params) => api.get('/users/me/watch-later', { params }).then((r) => r.data),
  addToWatchLater: (videoId) => api.post(`/users/me/watch-later/${videoId}`).then((r) => r.data),
  removeFromWatchLater: (videoId) => api.delete(`/users/me/watch-later/${videoId}`).then((r) => r.data),

  getLikedVideos: (params) => api.get('/users/me/liked-videos', { params }).then((r) => r.data),

  getNotifications: (params) => api.get('/notifications', { params }).then((r) => r.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllNotificationsRead: () => api.patch('/notifications/read-all').then((r) => r.data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),

  followChannel: (channelId) => api.post(`/follow/${channelId}`).then((r) => r.data),
  unfollowChannel: (channelId) => api.delete(`/follow/${channelId}`).then((r) => r.data),
  getFollowStatus: (channelId) => api.get(`/follow/${channelId}/status`).then((r) => r.data),
  getFollowing: (params) => api.get('/follow/me/following', { params }).then((r) => r.data),
  getFollowers: (channelId, params) => api.get(`/follow/${channelId}/followers`, { params }).then((r) => r.data),
};
