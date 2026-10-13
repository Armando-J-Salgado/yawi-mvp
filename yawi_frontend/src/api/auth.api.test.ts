import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerApi, loginApi, getMeApi, ApiError } from './auth.api';
import type { CreateCustomerPayload, LoginResponseDto } from './auth.api';
import { setAuthToken } from '@/lib/authToken';

const payload: CreateCustomerPayload = {
  email: 'a@b.com',
  password: 'password123',
  name: 'Ana',
  lastname: 'Pérez',
  country: 'El Salvador',
  personal_address: 'San Salvador',
};

function jsonResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function buildLoginDto(overrides: Partial<LoginResponseDto> = {}): LoginResponseDto {
  return {
    access_token: 'jwt-token',
    token_type: 'Bearer',
    expires_in: '1d',
    user: {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      userType: 'customer',
      email: 'cliente@example.com',
      name: 'Ana',
      lastname: 'Pérez',
    },
    ...overrides,
  };
}

describe('auth.api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAuthToken(null);
  });

  describe('registerApi', () => {
    it('POSTs to /customers and returns the DTO', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 'x' }, 201));

      const dto = await registerApi(payload);

      expect(dto.id).toBe('x');
      expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain('/customers');
    });

    it('throws ApiError with the backend message on failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ statusCode: 409, message: 'Duplicado' }, 409),
      );

      await expect(registerApi(payload)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('loginApi', () => {
    it('POSTs to /auth/login with email and password and returns the DTO', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(buildLoginDto(), 200));

      const dto = await loginApi({ email: 'cliente@example.com', password: 'secret123' });

      expect(dto.access_token).toBe('jwt-token');
      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toContain('/auth/login');
      expect(init?.method).toBe('POST');
      expect(JSON.parse(String(init?.body))).toEqual({
        email: 'cliente@example.com',
        password: 'secret123',
      });
    });

    it('throws ApiError with the backend message on 401', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ statusCode: 401, message: 'Credenciales inválidas' }, 401),
      );

      await expect(
        loginApi({ email: 'cliente@example.com', password: 'wrong' }),
      ).rejects.toMatchObject({ name: 'ApiError', message: 'Credenciales inválidas', status: 401 });
    });
  });

  describe('getMeApi', () => {
    it('sends the Bearer token and returns the auth user', async () => {
      setAuthToken('my-token');
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse(
          { id: 'x', userType: 'customer', email: 'a@b.com', name: 'Ana', lastname: 'Pérez' },
          200,
        ),
      );

      const dto = await getMeApi();

      expect(dto.email).toBe('a@b.com');
      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toContain('/auth/me');
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer my-token');
    });

    it('throws ApiError when the token is missing or invalid', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ statusCode: 401, message: 'Token de autorización ausente' }, 401),
      );

      await expect(getMeApi()).rejects.toBeInstanceOf(ApiError);
    });
  });
});
