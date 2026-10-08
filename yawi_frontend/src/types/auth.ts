/**
 * Datos de usuario autenticado almacenados en el store.
 * Evolución del tipo `User` original con campos adicionales del Customer.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastname: string;
  country: string;
  address: string;
  avatarUrl?: string;
}

/**
 * Datos que envía el formulario de registro.
 * Separado de AuthUser porque incluye password y confirmación.
 */
export interface CustomerRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  lastname: string;
  country: string;
  address: string;
}

/**
 * Credenciales para iniciar sesión.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Respuesta genérica de operaciones de auth (mockeada por ahora).
 */
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}
