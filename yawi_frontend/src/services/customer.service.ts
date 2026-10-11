import { getCustomerById } from '@/api/customers.api';
import type { CustomerDto } from '@/api/auth.api';

/** Perfil público del cliente usado para prellenar la dirección de entrega. */
export interface CustomerProfile {
  id: string;
  name: string;
  lastname: string;
  country: string;
  address: string;
}

/** DTO → perfil. Renombra `personal_address` a `address`. */
export function mapCustomerDtoToProfile(dto: CustomerDto): CustomerProfile {
  return {
    id: dto.id,
    name: dto.name,
    lastname: dto.lastname,
    country: dto.country,
    address: dto.personal_address,
  };
}

/** `GET /customers/:id` mapeado a perfil de dominio. */
export async function fetchCustomerProfile(id: string): Promise<CustomerProfile> {
  return mapCustomerDtoToProfile(await getCustomerById(id));
}
