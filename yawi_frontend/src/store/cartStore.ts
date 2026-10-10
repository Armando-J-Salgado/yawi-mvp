import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addItem,
  incrementItem,
  decrementItem,
  removeItem,
  computeTotalItems,
  computeSubtotal,
} from '@/services/cart.service';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const CART_STORAGE_NAME = 'yawi-cart';

/** Solo los ítems se persisten; `isOpen` es estado de UI efímero. */
export const partializeCartState = (state: CartState) => ({ items: state.items });

/**
 * Store global del carrito (Zustand).
 * Consistente con `authStore`: la UI se desacopla del backend a través de
 * `services/cart.service.ts`. La persistencia es local (`localStorage`), nunca remota.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addToCart: (product, quantity = 1) =>
        set((state) => ({ items: addItem(state.items, product, quantity) })),
      increment: (productId) => set((state) => ({ items: incrementItem(state.items, productId) })),
      decrement: (productId) => set((state) => ({ items: decrementItem(state.items, productId) })),
      remove: (productId) => set((state) => ({ items: removeItem(state.items, productId) })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: CART_STORAGE_NAME,
      partialize: partializeCartState,
    },
  ),
);

// Selectores reutilizables (evitan lógica en componentes).
export const selectTotalItems = (state: CartState) => computeTotalItems(state.items);
export const selectSubtotal = (state: CartState) => computeSubtotal(state.items);
