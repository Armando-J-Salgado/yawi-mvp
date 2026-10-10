import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/services/products.service';

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });
}
