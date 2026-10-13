import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

/** Crea un ítem de carrito a partir de un producto (snapshot). */
export function toCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    businessId: product.businessId,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrls[0],
    tags: product.tags,
    quantity,
  };
}

/** Agrega `quantity` unidades o incrementa si el producto ya está en el carrito. */
export function addItem(items: CartItem[], product: Product, quantity = 1): CartItem[] {
  const exists = items.some((item) => item.productId === product.id);
  if (exists) {
    return items.map((item) =>
      item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
    );
  }
  return [...items, toCartItem(product, quantity)];
}

export function incrementItem(items: CartItem[], productId: string): CartItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
  );
}

/** Nunca baja de 1: eliminar un producto es una acción aparte (`removeItem`). */
export function decrementItem(items: CartItem[], productId: string): CartItem[] {
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
  );
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function computeTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function computeSubtotal(items: CartItem[]): number {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.round(total * 100) / 100;
}
