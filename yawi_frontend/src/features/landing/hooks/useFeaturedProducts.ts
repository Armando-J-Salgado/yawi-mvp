import { FEATURED_PRODUCTS } from '../data/featured-products';
import type { Product } from '../types';

/**
 * Retorna productos destacados.
 * TODO: Reemplazar con llamada a API via TanStack Query cuando el backend esté listo.
 * El contrato de retorno se mantiene igual.
 */
export function useFeaturedProducts(): {
  data: Product[];
  isLoading: boolean;
  isError: boolean;
} {
  return {
    data: FEATURED_PRODUCTS,
    isLoading: false,
    isError: false,
  };
}
