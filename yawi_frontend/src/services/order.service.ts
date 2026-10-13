import { createOrder, getOrders, getOrderById } from '@/api/orders.api';
import { toNumber } from '@/utils/toNumber';
import type { CartItem } from '@/types/cart';
import type { CreateOrderPayload, Order, OrderDto, OrderItem, OrderItemDto } from '@/types/order';

/** DTO de línea → dominio (coerciona los decimales a `number`). */
export function mapOrderItemDtoToDomain(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    productId: dto.product_id,
    businessId: dto.business_id,
    productName: dto.product_name,
    unitPrice: toNumber(dto.unit_price),
    quantity: dto.quantity,
    subtotal: toNumber(dto.subtotal),
  };
}

/** DTO de orden → dominio. Normaliza `items` ausente a `[]` y coerciona totales. */
export function mapOrderDtoToDomain(dto: OrderDto): Order {
  return {
    id: dto.id,
    customerId: dto.customer_id,
    deliveryAddress: dto.delivery_address,
    status: dto.status,
    subtotal: toNumber(dto.subtotal),
    shippingFee: toNumber(dto.shipping_fee),
    total: toNumber(dto.total),
    items: (dto.items ?? []).map(mapOrderItemDtoToDomain),
    createdAt: dto.createdAt,
  };
}

/**
 * Construye el payload de `POST /orders` SOLO con los campos permitidos.
 * Toma `product_id` y `quantity` del carrito; nunca precios, business_id ni estado.
 */
export function buildOrderPayload(
  customerId: string,
  deliveryAddress: string,
  items: CartItem[],
): CreateOrderPayload {
  return {
    customer_id: customerId,
    delivery_address: deliveryAddress,
    items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
  };
}

/** Órdenes del cliente autenticado (`GET /orders?customer_id`). */
export async function fetchOrders(customerId: string): Promise<Order[]> {
  return (await getOrders(customerId)).map(mapOrderDtoToDomain);
}

/** Detalle de una orden (`GET /orders/:id`). */
export async function fetchOrderById(id: string): Promise<Order> {
  return mapOrderDtoToDomain(await getOrderById(id));
}

/** Crea una orden (`POST /orders`) y devuelve el dominio mapeado. */
export async function submitOrder(payload: CreateOrderPayload): Promise<Order> {
  return mapOrderDtoToDomain(await createOrder(payload));
}
