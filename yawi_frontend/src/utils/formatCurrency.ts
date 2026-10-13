/**
 * Formato centralizado de moneda del MVP.
 * La moneda del marketplace es fija: USD (ver Decisión #51 en docs/DECISIONS.md).
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Formatea un monto en USD, p. ej. `120` → `"$120.00 USD"`.
 * Si el valor no es un número finito, se asume `0` para evitar `NaN` en la UI.
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `$${safe.toFixed(2)} ${currency}`;
}
