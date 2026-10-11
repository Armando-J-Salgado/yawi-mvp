import { ApiError, extractErrorMessage } from '@/api/auth.api';
import { buildAuthHeaders } from '@/lib/authToken';
import type { CustomerDto } from '@/api/auth.api';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * `GET /customers/:id` → perfil público del cliente.
 * Se usa únicamente para prellenar la dirección de entrega en el checkout.
 *
 * @throws {ApiError} si el backend responde con status != 2xx (p. ej. 404).
 */
export async function getCustomerById(id: string): Promise<CustomerDto> {
  const res = await fetch(`${API_BASE}/customers/${id}`, { headers: { ...buildAuthHeaders() } });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as CustomerDto;
}
