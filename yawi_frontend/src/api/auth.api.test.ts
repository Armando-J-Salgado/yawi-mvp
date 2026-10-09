import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerApi, ApiError } from './auth.api';
import type { CreateCustomerPayload } from './auth.api';

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

describe('auth.api.registerApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

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
