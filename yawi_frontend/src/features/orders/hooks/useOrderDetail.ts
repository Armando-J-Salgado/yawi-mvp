import { useQuery } from '@tanstack/react-query';
import { fetchOrderById } from '@/services/order.service';

/** Detalle de una orden por id (server state vía TanStack Query). */
export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id),
    enabled: Boolean(id),
  });
}
