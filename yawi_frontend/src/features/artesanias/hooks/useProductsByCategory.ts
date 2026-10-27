import { useMemo } from 'react';
import { useProducts } from '@/features/catalog';
import type { Product } from '@/types/product';

/**
 * Filtra una lista de productos por el tag canónico de categoría.
 * Función pura desacoplada para facilitar tests unitarios.
 */
export function filterProductsByCategoryTag(
  products: Product[] | undefined | null,
  categoryTag: string,
): Product[] {
  if (!products || !Array.isArray(products) || !categoryTag) return [];
  const normalizedTag = categoryTag.toLowerCase().trim();
  return products.filter(
    (p) =>
      Array.isArray(p.tags) && p.tags.some((tag) => tag.toLowerCase().trim() === normalizedTag),
  );
}

/**
 * Hook que reutiliza `useProducts()` (GET /products con caché TanStack Query)
 * y filtra en el cliente por el tag de categoría sin realizar peticiones redundantes.
 */
export function useProductsByCategory(categoryTag: string) {
  const query = useProducts();

  const filtered = useMemo(() => {
    if (!query.data) return [];
    return filterProductsByCategoryTag(query.data, categoryTag);
  }, [query.data, categoryTag]);

  return {
    ...query,
    data: filtered,
    allProducts: query.data ?? [],
  };
}
