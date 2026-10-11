import { ApiError, extractErrorMessage } from '@/api/auth.api';
import { buildAuthHeaders } from '@/lib/authToken';
import type { CreateOrderPayload, OrderDto } from '@/types/order';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * `POST /orders` → crea la orden con sus líneas.
 * Los totales, subtotales y `shipping_fee` son calculados por el backend.
 *
 * @throws {ApiError} si el backend responde con status != 2xx.
 * @throws {TypeError} si falla la red (fetch rechaza).
 */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as OrderDto;
}

/**
 * `GET /orders?customer_id=<id>` → órdenes del cliente autenticado.
 * El filtro por `customer_id` limita el listado al propietario (Decisión #81).
 *
 * @throws {ApiError} si el backend responde con status != 2xx.
 */
export async function getOrders(customerId: string): Promise<OrderDto[]> {
  const url = `${API_BASE}/orders?customer_id=${encodeURIComponent(customerId)}`;
  const res = await fetch(url, { headers: { ...buildAuthHeaders() } });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as OrderDto[];
}

/**
 * `GET /orders/:id` → detalle de una orden con sus líneas.
 *
 * @throws {ApiError} si el backend responde con status != 2xx (p. ej. 404).
 */
export async function getOrderById(id: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/orders/${id}`, { headers: { ...buildAuthHeaders() } });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as OrderDto;
}
