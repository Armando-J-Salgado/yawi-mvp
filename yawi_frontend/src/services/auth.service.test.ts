import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCurrentUser, loginUser, registerUser } from './auth.service';
import type { CustomerRegistrationData } from '@/types/auth';
import type { CustomerDto, LoginResponseDto } from '@/api/auth.api';
import { setAuthToken } from '@/lib/authToken';

function buildFormData(
  overrides: Partial<CustomerRegistrationData> = {},
): CustomerRegistrationData {
  return {
    email: 'new@test.com',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'Juan',
    lastname: 'Pérez',
    country: 'SV',
    address: 'Avenida Central #123, San Salvador',
    ...overrides,
  };
}

function buildCustomerDto(overrides: Partial<CustomerDto> = {}): CustomerDto {
  return {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'new@test.com',
    name: 'Juan',
    lastname: 'Pérez',
    country: 'El Salvador',
    personal_address: 'Avenida Central #123, San Salvador',
    createdAt: '2026-09-23T15:30:00.000Z',
    updatedAt: '2026-09-23T15:30:00.000Z',
    deletedAt: null,
    ...overrides,
  };
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

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('auth.service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAuthToken(null);
  });

  describe('loginUser', () => {
    it('maps LoginResponseDto to AuthResponse with session data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(buildLoginDto(), 200));

      const result = await loginUser({ email: 'cliente@example.com', password: 'secret123' });

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(result.user?.userType).toBe('customer');
      expect(result.token).toBe('jwt-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe('1d');
    });

    it('returns the backend error message on 401', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ statusCode: 401, message: 'Credenciales inválidas' }, 401),
      );

      const result = await loginUser({ email: 'cliente@example.com', password: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });

    it('falls back to no error message on network failure', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await loginUser({ email: 'cliente@example.com', password: 'secret123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  describe('fetchCurrentUser', () => {
    it('returns the mapped AuthUser when GET /auth/me succeeds', async () => {
      setAuthToken('my-token');
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse(
          { id: 'x', userType: 'customer', email: 'a@b.com', name: 'Ana', lastname: 'Pérez' },
          200,
        ),
      );

      const user = await fetchCurrentUser();

      expect(user.id).toBe('x');
      expect(user.email).toBe('a@b.com');
      expect(user.userType).toBe('customer');
    });

    it('propagates the error when the token is invalid', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ statusCode: 401, message: 'Token inválido' }, 401),
      );

      await expect(fetchCurrentUser()).rejects.toThrow('Token inválido');
    });
  });

  describe('registerUser', () => {
    it('creates the customer and maps the response to AuthUser', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(buildCustomerDto(), 201));

      const result = await registerUser(buildFormData());

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(result.user?.address).toBe('Avenida Central #123, San Salvador');
    });

    it('sends personal_address, country name and excludes confirmPassword', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(buildCustomerDto(), 201));

      await registerUser(buildFormData());

      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('/customers');
      expect(init?.method).toBe('POST');
      const body = JSON.parse(String(init?.body));
      expect(body.personal_address).toBe('Avenida Central #123, San Salvador');
      expect(body.country).toBe('El Salvador');
      expect(body.address).toBeUndefined();
      expect(body.confirmPassword).toBeUndefined();
    });

    it('returns the backend error message on 409 conflict', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse(
          {
            statusCode: 409,
            message: 'Ya existe un cliente con el mismo correo electrónico.',
            error: 'Conflict',
          },
          409,
        ),
      );

      const result = await registerUser(buildFormData());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ya existe un cliente con el mismo correo electrónico.');
    });

    it('joins array messages on 400 validation error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ statusCode: 400, message: ['email inválido', 'país requerido'] }, 400),
      );

      const result = await registerUser(buildFormData());

      expect(result.success).toBe(false);
      expect(result.error).toBe('email inválido país requerido');
    });

    it('falls back to no error message on network failure', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await registerUser(buildFormData());

      expect(result.success).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });
});
