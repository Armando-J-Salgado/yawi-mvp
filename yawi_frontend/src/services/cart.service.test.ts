import { describe, it, expect } from 'vitest';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';
import {
  toCartItem,
  addItem,
  incrementItem,
  decrementItem,
  removeItem,
  computeTotalItems,
  computeSubtotal,
} from './cart.service';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-001',
    businessId: 'b-001',
    businessName: 'Familia Mendoza',
    name: 'Tapiz Zapoteco',
    tags: ['textiles'],
    imageUrls: ['/images/producto1.webp'],
    price: 120,
    ...overrides,
  };
}

function buildCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p-001',
    businessId: 'b-001',
    name: 'Tapiz Zapoteco',
    price: 120,
    imageUrl: '/images/producto1.webp',
    tags: ['textiles'],
    quantity: 1,
    ...overrides,
  };
}

describe('cart.service', () => {
  describe('toCartItem', () => {
    it('maps a product to a cart item snapshot', () => {
      const item = toCartItem(buildProduct());

      expect(item).toEqual({
        productId: 'p-001',
        businessId: 'b-001',
        name: 'Tapiz Zapoteco',
        price: 120,
        imageUrl: '/images/producto1.webp',
        tags: ['textiles'],
        quantity: 1,
      });
    });

    it('defaults imageUrl to undefined when there are no images', () => {
      const item = toCartItem(buildProduct({ imageUrls: [] }));
      expect(item.imageUrl).toBeUndefined();
    });
  });

  describe('addItem', () => {
    it('adds a new product', () => {
      const items = addItem([], buildProduct());
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1);
    });

    it('increments quantity when the product already exists', () => {
      const items = addItem([buildCartItem({ quantity: 2 })], buildProduct());
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('respects an explicit quantity for new items', () => {
      const items = addItem([], buildProduct(), 4);
      expect(items[0].quantity).toBe(4);
    });
  });

  describe('incrementItem', () => {
    it('increments the matching item', () => {
      const items = incrementItem(
        [buildCartItem({ quantity: 1 }), buildCartItem({ productId: 'p-002' })],
        'p-001',
      );
      expect(items[0].quantity).toBe(2);
      expect(items[1].quantity).toBe(1);
    });

    it('is a no-op for an unknown product', () => {
      const items = incrementItem([buildCartItem()], 'nope');
      expect(items[0].quantity).toBe(1);
    });
  });

  describe('decrementItem', () => {
    it('decrements the matching item', () => {
      const items = decrementItem([buildCartItem({ quantity: 3 })], 'p-001');
      expect(items[0].quantity).toBe(2);
    });

    it('never goes below 1', () => {
      const items = decrementItem([buildCartItem({ quantity: 1 })], 'p-001');
      expect(items[0].quantity).toBe(1);
    });

    it('is a no-op for an unknown product', () => {
      const items = decrementItem([buildCartItem({ quantity: 2 })], 'nope');
      expect(items[0].quantity).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('removes the matching item', () => {
      const items = removeItem(
        [buildCartItem({ productId: 'p-001' }), buildCartItem({ productId: 'p-002' })],
        'p-001',
      );
      expect(items.map((i) => i.productId)).toEqual(['p-002']);
    });
  });

  describe('computeTotalItems', () => {
    it('sums quantities', () => {
      expect(
        computeTotalItems([buildCartItem({ quantity: 2 }), buildCartItem({ quantity: 3 })]),
      ).toBe(5);
    });

    it('returns 0 for an empty cart', () => {
      expect(computeTotalItems([])).toBe(0);
    });
  });

  describe('computeSubtotal', () => {
    it('sums price * quantity', () => {
      const items = [
        buildCartItem({ price: 120, quantity: 2 }),
        buildCartItem({ price: 45.5, quantity: 1 }),
      ];
      expect(computeSubtotal(items)).toBe(285.5);
    });

    it('rounds to two decimals', () => {
      const items = [
        buildCartItem({ price: 0.1, quantity: 1 }),
        buildCartItem({ price: 0.2, quantity: 1 }),
      ];
      expect(computeSubtotal(items)).toBe(0.3);
    });

    it('returns 0 for an empty cart', () => {
      expect(computeSubtotal([])).toBe(0);
    });
  });
});
