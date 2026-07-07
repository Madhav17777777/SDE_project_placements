import { api } from './axiosInstance.js';

export const channelService = {
  create: (payload) => api.post('/channels', payload).then((r) => r.data),
  update: (payload) => api.patch('/channels/me', payload).then((r) => r.data),
  getBySlug: (slug) => api.get(`/channels/${slug}`).then((r) => r.data),
  getStreams: (slug, params) => api.get(`/channels/${slug}/streams`, { params }).then((r) => r.data),
  getVideos: (slug, params) => api.get(`/channels/${slug}/videos`, { params }).then((r) => r.data),

  getCategories: () => api.get('/categories').then((r) => r.data),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`).then((r) => r.data),
};
