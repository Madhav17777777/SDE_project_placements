import { api } from './axiosInstance.js';

export const streamService = {
  getLive: (params) => api.get('/streams/live', { params }).then((r) => r.data),
  getFeatured: () => api.get('/streams/featured').then((r) => r.data),
  getScheduled: (params) => api.get('/streams/scheduled', { params }).then((r) => r.data),
  getById: (id) => api.get(`/streams/${id}`).then((r) => r.data),
  getViewerCount: (id) => api.get(`/streams/${id}/viewers`).then((r) => r.data),

  create: (payload) => api.post('/streams', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/streams/${id}`, payload).then((r) => r.data),
  updateThumbnail: (id, file) => {
    const form = new FormData();
    form.append('thumbnail', file);
    return api.patch(`/streams/${id}/thumbnail`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  goLive: (id) => api.post(`/streams/${id}/go-live`).then((r) => r.data),
  end: (id) => api.post(`/streams/${id}/end`).then((r) => r.data),

  setSlowMode: (id, payload) => api.patch(`/streams/${id}/chat/slow-mode`, payload).then((r) => r.data),
  banFromChat: (id, userId) => api.post(`/streams/${id}/chat/ban/${userId}`).then((r) => r.data),
};
