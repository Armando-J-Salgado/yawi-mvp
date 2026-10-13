import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/services/products.service';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}
