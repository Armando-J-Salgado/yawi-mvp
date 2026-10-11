import { describe, it, expect, vi, afterEach } from 'vitest';
import { ApiError } from './auth.api';
import { createOrder, getOrders, getOrderById } from './orders.api';
import type { CreateOrderPayload, OrderDto } from '@/types/order';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const orderDto: OrderDto = {
  id: 'o-001',
  customer_id: 'c-001',
  delivery_address: 'Colonia Escalón, San Salvador',
  status: 'pending',
  subtotal: '29.00',
  shipping_fee: '10.00',
  total: '39.00',
  items: [
    {
      id: 'oi-001',
      order_id: 'o-001',
      product_id: 'p-001',
      business_id: 'b-001',
      product_name: 'Café Pacamara',
      unit_price: '12.00',
      quantity: 2,
      subtotal: '24.00',
    },
  ],
  createdAt: '2026-10-10T12:00:00.000Z',
  updatedAt: '2026-10-10T12:00:00.000Z',
  deletedAt: null,
};

const payload: CreateOrderPayload = {
  customer_id: 'c-001',
  delivery_address: 'Colonia Escalón, San Salvador',
  items: [{ product_id: 'p-001', quantity: 2 }],
};

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('orders.api', () => {
  it('POST /orders sends the payload and resolves the created DTO', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(orderDto));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createOrder(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/orders`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      }),
    );
    expect(result.id).toBe('o-001');
    expect(result.status).toBe('pending');
  });

  it('POST /orders throws ApiError with the backend message when not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: 'items no puede estar vacío', statusCode: 400 },
            { ok: false, status: 400 },
          ),
        ),
    );

    await expect(createOrder(payload)).rejects.toBeInstanceOf(ApiError);
    await expect(createOrder(payload)).rejects.toThrow('items no puede estar vacío');
  });

  it('GET /orders filters by customer_id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([orderDto]));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getOrders('c-001');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/orders?customer_id=c-001`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('o-001');
  });

  it('GET /orders throws ApiError on backend failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ message: 'Fallo', statusCode: 500 }, { ok: false, status: 500 }),
        ),
    );

    await expect(getOrders('c-001')).rejects.toBeInstanceOf(ApiError);
  });

  it('GET /orders/:id resolves the parsed DTO', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(orderDto));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getOrderById('o-001');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/orders/o-001`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(result.delivery_address).toBe('Colonia Escalón, San Salvador');
  });

  it('GET /orders/:id throws an ApiError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: "Order con ID 'x' no encontrada.", statusCode: 404 },
            { ok: false, status: 404 },
          ),
        ),
    );

    await expect(getOrderById('x')).rejects.toBeInstanceOf(ApiError);
    await expect(getOrderById('x')).rejects.toThrow("Order con ID 'x' no encontrada.");
  });
});
