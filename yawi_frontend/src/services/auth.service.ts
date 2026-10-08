import { loginApi, registerApi } from '../api/auth.api';
import type { AuthResponse, CustomerRegistrationData, LoginCredentials } from '../types/auth';

/**
 * Servicio de autenticación.
 * Orquesta las llamadas a la API y aplica lógica de negocio (mapeo, logging, etc.).
 * Los componentes y el store consumen este servicio, nunca la API directamente.
 */

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  // Aquí se podría agregar lógica pre/post llamada (analytics, logging, etc.)
  return loginApi(credentials);
}

export async function registerUser(data: CustomerRegistrationData): Promise<AuthResponse> {
  // Excluir confirmPassword antes de enviar al backend
  const { confirmPassword: _, ...registrationPayload } = data;
  return registerApi(registrationPayload);
}
