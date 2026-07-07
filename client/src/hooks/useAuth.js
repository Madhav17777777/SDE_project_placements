// Runs once at app startup: tries to obtain a fresh access token from the
// httpOnly refresh cookie so a page reload doesn't log the user out. Also
// exposes login/signup/logout that keep authStore and the server in sync.

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/auth.service.js';

export const useAuth = () => {
  const { user, accessToken, isAuthResolved, setAuth, clearAuth, setAuthResolved } = useAuthStore();

  useEffect(() => {
    if (isAuthResolved) return;
    authService
      .refreshToken()
      .then(({ data }) => setAuth({ user: data.user, accessToken: data.accessToken }))
      .catch(() => setAuthResolved(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (payload) => {
      const { data } = await authService.login(payload);
      setAuth({ user: data.user, accessToken: data.accessToken });
      return data.user;
    },
    [setAuth]
  );

  const signup = useCallback((payload) => authService.signup(payload), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user),
    isAuthResolved,
    login,
    signup,
    logout,
  };
};
