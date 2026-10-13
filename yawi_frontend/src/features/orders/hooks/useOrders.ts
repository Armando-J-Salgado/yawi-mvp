import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/services/order.service';

/** Órdenes del cliente autenticado (server state vía TanStack Query). */
export function useOrders(customerId: string) {
  return useQuery({
    queryKey: ['orders', customerId],
    queryFn: () => fetchOrders(customerId),
    enabled: Boolean(customerId),
  });
}
