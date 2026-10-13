import { useEffect } from 'react';
import { showToast } from '@/components/ui';
import { apiErrorMessage } from '@/utils/apiErrorMessage';

/**
 * Muestra una notificación de error cuando `isError` pasa a `true`.
 *
 * Prioriza el mensaje enviado por el backend (`ApiError`) y usa `fallback`
 * (texto i18n) si no hay mensaje útil. Pensado para conectar el `error` de una
 * query de TanStack Query con el sistema de toasts existente.
 */
export function useErrorToast(isError: boolean, error: unknown, fallback: string): void {
  useEffect(() => {
    if (isError) showToast.error(apiErrorMessage(error, fallback));
  }, [isError, error, fallback]);
}
