/**
 * Envío fijo del MVP, alineado con el backend (`yawi_api` aplica `shipping_fee = $10.00`).
 * Se usa SOLO para el total estimado mostrado en el checkout; el total autoritativo
 * (subtotal + envío) lo calcula y devuelve el backend al crear la orden.
 */
export const DEFAULT_SHIPPING_FEE = 10;

/** Total estimado = subtotal + envío, redondeado a 2 decimales. */
export function estimateOrderTotal(
  subtotal: number,
  shippingFee: number = DEFAULT_SHIPPING_FEE,
): number {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const safeShipping = Number.isFinite(shippingFee) ? shippingFee : 0;
  return Math.round((safeSubtotal + safeShipping) * 100) / 100;
}
