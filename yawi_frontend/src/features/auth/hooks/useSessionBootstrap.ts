import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

let bootstrapped = false; // evita doble ejecución con React StrictMode en dev

/**
 * Bootstrap de sesión: valida el token persistido con `GET /auth/me` al montar la app.
 * Se invoca una sola vez desde `App.tsx`.
 */
export function useSessionBootstrap(): void {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;
    void restoreSession();
  }, [restoreSession]);
}
