import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles, requireVerified }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" /></div>;

  if (!user) return <Navigate to="/login" replace />;
  if (requireVerified && !user.isVerified) return <Navigate to="/verify-otp" replace />;

  if (user.isVerified && !user.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;