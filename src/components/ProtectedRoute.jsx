import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. If the user is not logged in, redirect to login
  if (!isAuthenticated) {
    // We pass the 'location' so the Login page knows where to send them AFTER they log in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If this route requires an Admin, but the user is just a standard user
  if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />; // Send them back to the browse page
  }

  // 3. User is authenticated and authorized, render the requested page
  return children;
}