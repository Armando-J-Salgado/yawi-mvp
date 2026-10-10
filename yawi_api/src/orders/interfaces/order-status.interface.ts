/**
 * Estados permitidos para una Order.
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

/**
 * Matriz de transiciones permitidas.
 * Cada clave es el estado actual; su valor es un arreglo de estados destino válidos.
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

/**
 * Envío fijo del MVP.
 */
export const SHIPPING_FEE = 10.0;
