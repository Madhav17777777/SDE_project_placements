import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service.js';
import { ROUTES } from '../../constants/routes.js';
import Spinner from '../../components/common/Spinner.jsx';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} />
        <p className="text-sm text-white/50">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="mb-2 text-xl font-semibold">{status === 'success' ? 'Email verified!' : 'Link invalid or expired'}</h1>
      <p className="text-sm text-white/60">
        {status === 'success' ? 'Your account is fully set up.' : 'Request a new verification email from your profile settings.'}
      </p>
      <Link to={ROUTES.LOGIN} className="mt-6 inline-block text-sm text-accent-glow hover:underline">
        Back to login
      </Link>
    </div>
  );
};

export default VerifyEmail;
