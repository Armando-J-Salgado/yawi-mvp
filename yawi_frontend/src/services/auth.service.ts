import { ApiError, loginApi, registerApi } from '../api/auth.api';
import type { CreateCustomerPayload, CustomerDto } from '../api/auth.api';
import { resolveCountryName } from '../utils/countryName';
import type {
  AuthResponse,
  AuthUser,
  CustomerRegistrationData,
  LoginCredentials,
} from '../types/auth';

/**
 * Servicio de autenticación.
 * Orquesta las llamadas a la API y aplica lógica de negocio (mapeo, logging, etc.).
 * Los componentes y el store consumen este servicio, nunca la API directamente.
 */

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  // Login permanece mockeado (fuera de alcance de M4-1).
  return loginApi(credentials);
}

/** Mapea la respuesta pública del backend al modelo de sesión del frontend. */
function mapCustomerToAuthUser(dto: CustomerDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    lastname: dto.lastname,
    country: dto.country,
    address: dto.personal_address,
  };
}

/** Construye el payload del backend a partir del formulario (dominio → DTO). */
function mapRegistrationToPayload(data: CustomerRegistrationData): CreateCustomerPayload {
  return {
    email: data.email,
    password: data.password,
    name: data.name,
    lastname: data.lastname,
    country: resolveCountryName(data.country),
    personal_address: data.address,
  };
}

export async function registerUser(data: CustomerRegistrationData): Promise<AuthResponse> {
  try {
    const dto = await registerApi(mapRegistrationToPayload(data));
    return { success: true, user: mapCustomerToAuthUser(dto) };
  } catch (error) {
    // Mensaje del backend si es un ApiError; si no (red/inesperado), sin mensaje
    // para que el componente aplique el fallback i18n `register.error_generic`.
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false };
  }
}
