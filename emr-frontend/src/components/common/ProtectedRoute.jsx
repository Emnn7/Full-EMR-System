import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES } from '../../config/roles';
import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const token = localStorage.getItem('authToken');
  const location = useLocation();
  const navigate = useNavigate();
  // In your ProtectedRoute component
   const authState = useSelector((state) => state.auth);
console.log('User roles:', authState.user?.roles);
console.log('Allowed roles:', allowedRoles);
console.log('Is authenticated:', authState.isAuthenticated);
console.log('Stored token:', localStorage.getItem('authToken'));
console.log('Redux auth state:', useSelector(state => state.auth));
  // Enhanced debug output with role validation
  console.log('Auth check:', {
    isAuthenticated,
    currentRole: user?.role,
    allowedRoles,
    validRoles: Object.values(ROLES), // Now using ROLES
    tokenExists: !!token,
    loadingState: loading
  });

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !token) {
        console.log('Redirecting to login - not authenticated');
        navigate('/login', { state: { from: location }, replace: true });
      } 
      // Use ROLES for validation if needed
      else if (allowedRoles && !allowedRoles.includes(user?.role)){
        console.log('Redirecting to unauthorized - role mismatch');
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, loading, token, user, allowedRoles, location, navigate]);

  if (loading) return <div>Loading authentication...</div>;

  if (isAuthenticated && (!allowedRoles || allowedRoles.includes(user?.role))) {
    return <Outlet />;

  }

  return null;
};

export default ProtectedRoute;