import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Protege rutas privadas (checkout y órdenes).
 * Si no hay sesión, redirige a `/login` conservando el destino en `state.from`
 * para volver tras autenticarse (Decisión #90).
 *
 * NOTA: es la única protección disponible en esta iteración. `yawi_api` aún no
 * aplica guards a `/orders` (deuda registrada, Decisión #81).
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
