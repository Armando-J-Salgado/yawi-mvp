import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginUser, registerUser } from './auth.service';
import type { CustomerRegistrationData } from '../types/auth';
import type { CustomerDto } from '../api/auth.api';

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

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('auth.service', () => {
  describe('loginUser', () => {
    it('returns success for mock login', async () => {
      const result = await loginUser({ email: 'test@test.com', password: 'password123' });
      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('test@test.com');
    });
  });

  describe('registerUser', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

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
