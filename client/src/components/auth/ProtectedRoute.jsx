import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import Spinner from '../common/Spinner.jsx';

// `allowedRoles` omitted -> any authenticated user. Pass e.g.
// `allowedRoles={['streamer', 'admin']}` to additionally gate by role.
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isAuthResolved, user } = useAuth();
  const location = useLocation();

  if (!isAuthResolved) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
