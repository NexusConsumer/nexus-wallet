import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { lang = 'he' } = useParams();

  if (!isAuthenticated) {
    // Not authenticated — redirect back to home (LoginSheet opens from action buttons)
    return <Navigate to={`/${lang || 'he'}`} replace />;
  }

  return <Outlet />;
}
