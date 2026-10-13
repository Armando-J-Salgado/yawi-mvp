/**
 * Datos de usuario autenticado almacenados en el store.
 * Evolución del tipo `User` original con campos adicionales del Customer.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastname: string;
  userType?: 'customer';
  country?: string; // opcional: el login no lo devuelve
  address?: string; // opcional: el login no lo devuelve
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
  token?: string;
  tokenType?: string;
  expiresIn?: string;
}
