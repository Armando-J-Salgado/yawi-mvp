import { useQuery } from '@tanstack/react-query';
import { fetchCustomerProfile } from '@/services/customer.service';

/** Perfil del cliente autenticado, usado para prellenar la dirección de entrega. */
export function useCustomerProfile(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomerProfile(id),
    enabled: Boolean(id),
  });
}
