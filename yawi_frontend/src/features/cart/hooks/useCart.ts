import { useCartStore, selectTotalItems, selectSubtotal } from '@/store/cartStore';

/**
 * Capa de acceso al carrito para la UI (el "contexto/capa equivalente" del requerimiento).
 * Desacopla los componentes del store global y de la futura integración con backend.
 */
export function useCart() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore(selectTotalItems);
  const subtotal = useCartStore(selectSubtotal);
  const isOpen = useCartStore((state) => state.isOpen);
  const addToCart = useCartStore((state) => state.addToCart);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);

  return {
    items,
    totalItems,
    subtotal,
    isOpen,
    addToCart,
    increment,
    decrement,
    remove,
    clear,
    openCart,
    closeCart,
  };
}
