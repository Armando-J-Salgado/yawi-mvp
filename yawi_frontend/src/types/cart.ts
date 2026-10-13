/**
 * Ítem del carrito.
 * Guarda un snapshot del producto para no depender de un refetch ni de que el
 * producto siga existiendo en el catálogo.
 */
export interface CartItem {
  productId: string;
  businessId: string;
  name: string;
  price: number; // moneda fija USD
  imageUrl?: string;
  tags: string[];
  quantity: number;
}
