import { ApiError, getMeApi, loginApi, registerApi } from '@/api/auth.api';
import type {
  AuthUserDto,
  CreateCustomerPayload,
  CustomerDto,
  LoginResponseDto,
} from '@/api/auth.api';
import { resolveCountryName } from '@/utils/countryName';
import type {
  AuthResponse,
  AuthUser,
  CustomerRegistrationData,
  LoginCredentials,
} from '@/types/auth';

/**
 * Servicio de autenticación.
 * Orquesta las llamadas a la API y aplica lógica de negocio (mapeo, logging, etc.).
 * Los componentes y el store consumen este servicio, nunca la API directamente.
 */

/** Mapea la identidad pública del backend (`POST /auth/login`, `GET /auth/me`) al modelo de sesión. */
function mapAuthUserDtoToAuthUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    lastname: dto.lastname,
    userType: dto.userType,
  };
}

/** Normaliza la respuesta de login a `AuthResponse` con los datos de sesión. */
function mapLoginResponse(dto: LoginResponseDto): AuthResponse {
  return {
    success: true,
    user: mapAuthUserDtoToAuthUser(dto.user),
    token: dto.access_token,
    tokenType: dto.token_type,
    expiresIn: dto.expires_in,
  };
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    return mapLoginResponse(await loginApi(credentials));
  } catch (error) {
    // Mensaje del backend si es un ApiError; si no (red/inesperado), sin mensaje
    // para que el componente aplique el fallback i18n `login.error_invalid_credentials`.
    if (error instanceof ApiError) return { success: false, error: error.message };
    return { success: false };
  }
}

/**
 * Valida el token actual (leído por `api/` desde `lib/authToken`) y devuelve el usuario.
 * Usado por el bootstrap de sesión del store al cargar la app.
 */
export async function fetchCurrentUser(): Promise<AuthUser> {
  return mapAuthUserDtoToAuthUser(await getMeApi());
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
