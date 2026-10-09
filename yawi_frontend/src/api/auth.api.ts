import type { AuthResponse, LoginCredentials } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Payload que espera `POST /customers` (contrato real de yawi_api). */
export interface CreateCustomerPayload {
  email: string;
  password: string;
  name: string;
  lastname: string;
  country: string; // nombre completo, no ISO
  personal_address: string;
}

/** Respuesta pública de `POST /customers` (sin `password`). */
export interface CustomerDto {
  id: string;
  email: string;
  name: string;
  lastname: string;
  country: string;
  personal_address: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Error tipado de la API NestJS. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Extrae el mensaje del body de error NestJS ({ message: string | string[] }). */
async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(' ');
    if (typeof body.message === 'string' && body.message.length > 0) return body.message;
  } catch {
    // Respuesta sin JSON
  }
  return `Error ${res.status}`;
}

/**
 * Llama al endpoint de login del backend.
 * TODO [M4]: Reemplazar con llamada real a Supabase o API REST.
 *
 * @param credentials - Email y password del usuario
 * @returns AuthResponse con usuario autenticado o error
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO [M4]: Implementar llamada real
  // Mock: simula delay de red y retorna éxito
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    success: true,
    user: {
      id: 'mock-user-id',
      email: credentials.email,
      name: 'Usuario',
      lastname: 'Demo',
      country: 'SV',
      address: 'Dirección de prueba, San Salvador',
    },
  };
}

/**
 * Crea un Customer real en el backend.
 * @throws {ApiError} si el backend responde con status != 2xx.
 * @throws {TypeError} si falla la red (fetch rechaza); el servicio lo trata como error genérico.
 */
export async function registerApi(payload: CreateCustomerPayload): Promise<CustomerDto> {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return (await res.json()) as CustomerDto;
}
