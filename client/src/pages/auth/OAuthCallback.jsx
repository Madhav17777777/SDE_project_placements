// Landing page for the Google OAuth redirect (see server's
// auth.controller.js googleCallback). The access token arrives as a query
// param; we read it once, ask the API who we are, store both in
// authStore, then strip the token out of the URL so it never lingers in
// browser history.
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/auth.service.js';
import { ROUTES } from '../../constants/routes.js';
import Spinner from '../../components/common/Spinner.jsx';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    if (!accessToken) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    useAuthStore.getState().setAccessToken(accessToken);
    authService
      .me()
      .then(({ data }) => {
        setAuth({ user: data.user, accessToken });
        navigate(ROUTES.HOME, { replace: true });
      })
      .catch(() => navigate(ROUTES.LOGIN, { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size={32} />
    </div>
  );
};

export default OAuthCallback;
