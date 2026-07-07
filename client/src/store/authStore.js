// Auth state lives in memory only (Zustand, no persist middleware) --
// deliberately NOT in localStorage. The access token is short-lived and
// re-obtained via the httpOnly refresh cookie on page load (see useAuth.js),
// which keeps an XSS payload from being able to read a long-lived token.

import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthResolved: false, // true once the initial "am I logged in?" check has run

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setAuthResolved: (isAuthResolved) => set({ isAuthResolved }),

  setAuth: ({ user, accessToken }) => set({ user, accessToken, isAuthResolved: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthResolved: true }),
}));
