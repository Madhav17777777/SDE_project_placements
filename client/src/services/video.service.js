import { api } from './axiosInstance.js';

export const videoService = {
  list: (params) => api.get('/videos', { params }).then((r) => r.data),
  getTrending: (params) => api.get('/videos/trending', { params }).then((r) => r.data),
  getById: (id) => api.get(`/videos/${id}`).then((r) => r.data),
  share: (id) => api.post(`/videos/${id}/share`).then((r) => r.data),

  upload: (formData, onUploadProgress) =>
    api.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }).then((r) => r.data),
  update: (id, payload) => api.patch(`/videos/${id}`, payload).then((r) => r.data),
  updateThumbnail: (id, file) => {
    const form = new FormData();
    form.append('thumbnail', file);
    return api.patch(`/videos/${id}/thumbnail`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  remove: (id) => api.delete(`/videos/${id}`).then((r) => r.data),

  react: (id, type) => api.post(`/likes/video/${id}`, { type }).then((r) => r.data),
  removeReaction: (id) => api.delete(`/likes/video/${id}`).then((r) => r.data),

  getComments: (videoId, params) => api.get(`/comments/video/${videoId}`, { params }).then((r) => r.data),
  getReplies: (commentId, params) => api.get(`/comments/${commentId}/replies`, { params }).then((r) => r.data),
  addComment: (videoId, content) => api.post(`/comments/video/${videoId}`, { content }).then((r) => r.data),
  reply: (commentId, content) => api.post(`/comments/${commentId}/reply`, { content }).then((r) => r.data),
  editComment: (commentId, content) => api.patch(`/comments/${commentId}`, { content }).then((r) => r.data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`).then((r) => r.data),
  pinComment: (commentId) => api.post(`/comments/${commentId}/pin`).then((r) => r.data),
  reactToComment: (commentId) => api.post(`/likes/comment/${commentId}`).then((r) => r.data),

  search: (params) => api.get('/search', { params }).then((r) => r.data),
};
