/**
 * Helper de token de sesión en memoria.
 *
 * Es la única vía por la que la capa `api/` obtiene el JWT para autorizar
 * peticiones (dirección de dependencias `api -> lib` permitida por
 * ARCHITECTURE.md). El store es quien alimenta este helper (`setAuthToken`)
 * tras el login, el bootstrap o el logout.
 */

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/** Headers de autorización listos para `fetch`. Vacío si no hay token. */
export function buildAuthHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}
