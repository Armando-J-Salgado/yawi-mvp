/**
 * Devuelve un mensaje mostrable a partir de un error desconocido.
 *
 * Prioriza el mensaje del backend (`ApiError`/`Error`); si no hay mensaje útil,
 * usa el fallback i18n. Se usa para alimentar las notificaciones de error (toast).
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return fallback;
}
