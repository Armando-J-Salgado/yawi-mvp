import { describe, it, expect, beforeEach } from 'vitest';
import {
  useCartStore,
  selectTotalItems,
  selectSubtotal,
  CART_STORAGE_NAME,
  partializeCartState,
} from './cartStore';
import type { Product } from '@/types/product';

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

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('starts empty and closed', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });

  it('adds a product to the cart', () => {
    useCartStore.getState().addToCart(buildProduct());

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('p-001');
    expect(items[0].quantity).toBe(1);
  });

  it('increments quantity when adding the same product twice', () => {
    useCartStore.getState().addToCart(buildProduct());
    useCartStore.getState().addToCart(buildProduct());

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('increments and decrements quantities', () => {
    useCartStore.getState().addToCart(buildProduct());
    useCartStore.getState().increment('p-001');
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    useCartStore.getState().decrement('p-001');
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    useCartStore.getState().decrement('p-001');
    expect(useCartStore.getState().items[0].quantity).toBe(1); // nunca baja de 1
  });

  it('removes a product', () => {
    useCartStore.getState().addToCart(buildProduct());
    useCartStore.getState().remove('p-001');

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('clears the cart', () => {
    useCartStore.getState().addToCart(buildProduct());
    useCartStore.getState().addToCart(buildProduct({ id: 'p-002' }));

    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('opens, closes and toggles the drawer', () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it('computes totalItems and subtotal through selectors', () => {
    useCartStore.getState().addToCart(buildProduct({ id: 'p-001', price: 120 }), 2);
    useCartStore.getState().addToCart(buildProduct({ id: 'p-002', price: 45.5 }), 1);

    const state = useCartStore.getState();
    expect(selectTotalItems(state)).toBe(3);
    expect(selectSubtotal(state)).toBe(285.5);
  });

  it('persists only the items (not the drawer state)', () => {
    expect(CART_STORAGE_NAME).toBe('yawi-cart');

    useCartStore.getState().addToCart(buildProduct());
    useCartStore.getState().openCart();

    const partialized = partializeCartState(useCartStore.getState()) as { items?: unknown };
    expect(partialized).toEqual({ items: useCartStore.getState().items });
    expect(partialized).not.toHaveProperty('isOpen');
  });
});
