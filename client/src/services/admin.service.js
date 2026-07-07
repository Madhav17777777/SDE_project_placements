import { api } from './axiosInstance.js';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  listUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  banUser: (id, isBanned) => api.patch(`/admin/users/${id}/ban`, { isBanned }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  listStreams: (params) => api.get('/admin/streams', { params }).then((r) => r.data),
  removeStream: (id) => api.delete(`/admin/streams/${id}`).then((r) => r.data),
};
