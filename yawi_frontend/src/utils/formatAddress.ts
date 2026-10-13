/**
 * Retorna el primer segmento de la dirección hasta la primera coma.
 * Si no hay coma, retorna la dirección completa.
 *
 * @example
 * formatAddress('Av. Independencia #456, Centro Histórico, San Salvador')
 * // → 'Av. Independencia #456'
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  const firstComma = address.indexOf(',');
  if (firstComma === -1) return address.trim();
  return address.slice(0, firstComma).trim();
}
