import type { LoginCredentials } from '../types/auth';
import { buildAuthHeaders } from '@/lib/authToken';

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

/** Identidad pública del usuario autenticado (contrato de `GET /auth/me`). */
export interface AuthUserDto {
  id: string;
  userType: 'customer';
  email: string;
  name: string;
  lastname: string;
}

/** Respuesta de `POST /auth/login` (contrato real de yawi_api). */
export interface LoginResponseDto {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: AuthUserDto;
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
 * Llama al endpoint de login real del backend (`POST /auth/login`).
 *
 * @param credentials - Email y password del usuario
 * @throws {ApiError} si el backend responde con status != 2xx (p. ej. 401).
 * @throws {TypeError} si falla la red (fetch rechaza); el servicio lo trata como error genérico.
 */
export async function loginApi(credentials: LoginCredentials): Promise<LoginResponseDto> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return (await res.json()) as LoginResponseDto;
}

/**
 * Obtiene la identidad del usuario autenticado (`GET /auth/me`).
 * El JWT se lee desde `lib/authToken` (helper alimentado por el store).
 *
 * @throws {ApiError} si el token falta, es inválido o expiró (401).
 */
export async function getMeApi(): Promise<AuthUserDto> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...buildAuthHeaders() },
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return (await res.json()) as AuthUserDto;
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
