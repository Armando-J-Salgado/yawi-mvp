/** Estados posibles de una orden (contrato de `yawi_api`). */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

/** DTO de una línea de orden (`OrderProduct`) tal como lo devuelve el backend. */
export interface OrderItemDto {
  id: string;
  order_id: string;
  product_id: string;
  business_id: string;
  product_name: string;
  unit_price: number | string; // decimal → string en runtime (Postgres/pg)
  quantity: number;
  subtotal: number | string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO de una orden (`GET /orders`, `GET /orders/:id`, `POST /orders`).
 * Los totales son decimales → `number | string`. `items` viene cargado.
 */
export interface OrderDto {
  id: string;
  customer_id: string;
  delivery_address: string;
  status: OrderStatus;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  items?: OrderItemDto[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Payload de `POST /orders`.
 * El cliente SOLO envía `customer_id`, `delivery_address` e `items`.
 * NO enviar `total`, `unit_price`, `product_name`, `subtotal`, `shipping_fee`,
 * `business_id` (en items) ni `status`.
 */
export interface CreateOrderPayload {
  customer_id: string;
  delivery_address: string;
  items: { product_id: string; quantity: number }[];
}

/** Modelo de dominio de una línea de orden (para la UI). */
export interface OrderItem {
  id: string;
  productId: string;
  businessId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/** Modelo de dominio de una orden (para la UI). Totales ya coercionados a `number`. */
export interface Order {
  id: string;
  customerId: string;
  deliveryAddress: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}
