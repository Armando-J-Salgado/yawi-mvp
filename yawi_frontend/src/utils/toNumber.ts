/**
 * Coerciona un `decimal` del backend a número seguro.
 * Postgres/TypeORM entrega las columnas `decimal(10,2)` como string (`"12.50"`).
 * Compartido por `products.service` y `order.service` (Decisión #92).
 */
export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}
