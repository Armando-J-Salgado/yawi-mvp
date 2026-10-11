import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CartItem } from '@/types/cart';
import type { OrderDto, OrderItemDto } from '@/types/order';

vi.mock('@/api/orders.api', () => ({
  createOrder: vi.fn(),
  getOrders: vi.fn(),
  getOrderById: vi.fn(),
}));

import { createOrder, getOrders, getOrderById } from '@/api/orders.api';
import {
  buildOrderPayload,
  mapOrderItemDtoToDomain,
  mapOrderDtoToDomain,
  fetchOrders,
  fetchOrderById,
  submitOrder,
} from './order.service';

function buildItemDto(overrides: Partial<OrderItemDto> = {}): OrderItemDto {
  return {
    id: 'oi-001',
    order_id: 'o-001',
    product_id: 'p-001',
    business_id: 'b-001',
    product_name: 'Café Pacamara',
    unit_price: '12.00',
    quantity: 2,
    subtotal: '24.00',
    ...overrides,
  };
}

function buildOrderDto(overrides: Partial<OrderDto> = {}): OrderDto {
  return {
    id: 'o-001',
    customer_id: 'c-001',
    delivery_address: 'Colonia Escalón, San Salvador',
    status: 'pending',
    subtotal: '29.00',
    shipping_fee: '10.00',
    total: '39.00',
    items: [buildItemDto()],
    createdAt: '2026-10-10T12:00:00.000Z',
    ...overrides,
  };
}

function buildCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p-001',
    businessId: 'b-001',
    name: 'Café Pacamara',
    price: 12,
    imageUrl: '/images/a.webp',
    tags: ['cafe'],
    quantity: 2,
    ...overrides,
  };
}

describe('order.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildOrderPayload', () => {
    it('maps cart items to product_id + quantity only', () => {
      const payload = buildOrderPayload('c-001', 'Dirección 123', [buildCartItem()]);

      expect(payload).toEqual({
        customer_id: 'c-001',
        delivery_address: 'Dirección 123',
        items: [{ product_id: 'p-001', quantity: 2 }],
      });
      expect(payload.items[0]).not.toHaveProperty('business_id');
      expect(payload.items[0]).not.toHaveProperty('unit_price');
    });

    it('maps multiple items preserving quantities', () => {
      const payload = buildOrderPayload('c-001', 'Dir', [
        buildCartItem({ productId: 'p-1', quantity: 1 }),
        buildCartItem({ productId: 'p-2', quantity: 3 }),
      ]);

      expect(payload.items).toEqual([
        { product_id: 'p-1', quantity: 1 },
        { product_id: 'p-2', quantity: 3 },
      ]);
    });
  });

  describe('mapOrderItemDtoToDomain', () => {
    it('coerces decimal strings and maps snake_case to camelCase', () => {
      const item = mapOrderItemDtoToDomain(buildItemDto());

      expect(item).toEqual({
        id: 'oi-001',
        productId: 'p-001',
        businessId: 'b-001',
        productName: 'Café Pacamara',
        unitPrice: 12,
        quantity: 2,
        subtotal: 24,
      });
    });
  });

  describe('mapOrderDtoToDomain', () => {
    it('coerces order totals and maps its items', () => {
      const order = mapOrderDtoToDomain(buildOrderDto());

      expect(order.id).toBe('o-001');
      expect(order.customerId).toBe('c-001');
      expect(order.status).toBe('pending');
      expect(order.subtotal).toBe(29);
      expect(order.shippingFee).toBe(10);
      expect(order.total).toBe(39);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].unitPrice).toBe(12);
    });

    it('normalizes a missing items list to an empty array', () => {
      const order = mapOrderDtoToDomain(buildOrderDto({ items: undefined }));
      expect(order.items).toEqual([]);
    });
  });

  describe('fetchOrders', () => {
    it('maps the DTO list to domain orders', async () => {
      vi.mocked(getOrders).mockResolvedValueOnce([buildOrderDto()]);

      const orders = await fetchOrders('c-001');

      expect(getOrders).toHaveBeenCalledWith('c-001');
      expect(orders).toHaveLength(1);
      expect(orders[0].total).toBe(39);
    });
  });

  describe('fetchOrderById', () => {
    it('maps a single DTO', async () => {
      vi.mocked(getOrderById).mockResolvedValueOnce(buildOrderDto({ id: 'o-xyz' }));

      const order = await fetchOrderById('o-xyz');

      expect(getOrderById).toHaveBeenCalledWith('o-xyz');
      expect(order.id).toBe('o-xyz');
    });
  });

  describe('submitOrder', () => {
    it('creates the order and maps the response', async () => {
      vi.mocked(createOrder).mockResolvedValueOnce(buildOrderDto());

      const order = await submitOrder({
        customer_id: 'c-001',
        delivery_address: 'Dir',
        items: [{ product_id: 'p-001', quantity: 2 }],
      });

      expect(createOrder).toHaveBeenCalledWith({
        customer_id: 'c-001',
        delivery_address: 'Dir',
        items: [{ product_id: 'p-001', quantity: 2 }],
      });
      expect(order.total).toBeCloseTo(39);
    });
  });
});
