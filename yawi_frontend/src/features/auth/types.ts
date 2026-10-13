/**
 * Tipos locales del feature auth.
 * Los tipos compartidos (AuthUser, LoginCredentials, etc.) están en src/types/auth.ts.
 */

/** Estado del formulario de registro (maneja los dos steps) */
export interface RegisterFormState {
  // Step 1 — Credenciales
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 — Datos personales
  name: string;
  lastname: string;
  country: string;
  address: string;
}

/** Step activo del formulario de registro */
export type RegisterStep = 1 | 2;
