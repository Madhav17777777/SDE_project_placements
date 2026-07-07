// Single Axios instance used by every service file. Two things make this
// more than boilerplate:
//   1. `withCredentials: true` so the httpOnly refresh-token cookie is sent
//      automatically -- the client-side JS never touches that token.
//   2. A response interceptor that, on a 401, transparently calls
//      /auth/refresh-token once, retries the original request with the new
//      access token, and only logs the user out if the refresh itself fails.
//      Concurrent 401s while a refresh is already in flight all wait on the
//      same refresh promise instead of firing N parallel refresh calls.

import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!response || response.status !== 401 || config._retry || config.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh-token').finally(() => {
          refreshPromise = null;
        });
      }
      const { data } = await refreshPromise;
      useAuthStore.getState().setAccessToken(data.data.accessToken);
      useAuthStore.getState().setUser(data.data.user);

      config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(config);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  }
);
