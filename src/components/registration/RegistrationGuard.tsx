import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useRegistrationStore } from '../../stores/registrationStore';

/**
 * Route guard for registration pages.
 * Redirects to home if user is not in an active registration flow.
 */
export default function RegistrationGuard() {
  const { lang = 'he' } = useParams();
  const isRegistering = useRegistrationStore((s) => s.isRegistering);

  if (!isRegistering) {
    return <Navigate to={`/${lang ?? 'he'}`} replace />;
  }

  return <Outlet />;
}
