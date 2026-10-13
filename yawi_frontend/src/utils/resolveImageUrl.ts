const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Devuelve una URL usable en `<img src>` a partir de lo almacenado por el backend.
 *
 * - URLs absolutas (`http:`, `https:`, `data:`, `blob:`) → intactas.
 * - Rutas servidas por el backend (`/uploads/...`) → prefijadas con `VITE_API_URL`.
 * - Otras rutas relativas (assets públicos del frontend, p. ej. `/images/...`) → intactas.
 *
 * Así el frontend es compatible tanto con `LocalStorageAdapter` (rutas relativas
 * `/uploads/...`) como con `SupabaseStorageAdapter` (URLs absolutas).
 */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
}
