import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RequireRole = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();
  const role = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/support" replace />;
  }

  return children;
};

export default RequireRole;
