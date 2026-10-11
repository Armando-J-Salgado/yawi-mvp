import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBusinesses } from '@/features/artisans';
import { fetchProducts, selectFeaturedProducts } from '@/services/products.service';
import type { Product } from '@/types/product';

export interface UseFeaturedProductsResult {
  products: Product[];
  businessNameById: Map<string, string>;
  countryByBusinessId: Map<string, string>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Productos destacados para la landing, servidos por `GET /products`.
 *
 * Comparte la `queryKey: ['products']` con el catálogo (cache de TanStack Query).
 * Hace un join best-effort con `GET /businesses` para conservar el país
 * (`owner.country`) y el nombre del negocio del diseño actual.
 */
export function useFeaturedProducts(): UseFeaturedProductsResult {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const businessesQuery = useBusinesses();

  const businesses = businessesQuery.data ?? [];

  const businessNameById = useMemo(
    () => new Map(businesses.map((business) => [business.id, business.name])),
    [businesses],
  );
  const countryByBusinessId = useMemo(
    () => new Map(businesses.map((business) => [business.id, business.owner.country])),
    [businesses],
  );

  return {
    products: selectFeaturedProducts(productsQuery.data ?? [], 6),
    businessNameById,
    countryByBusinessId,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch: () => void productsQuery.refetch(),
  };
}
