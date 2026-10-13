import { describe, it, expect, vi, afterEach } from 'vitest';
import { ApiError } from './auth.api';
import { getCustomerById } from './customers.api';
import type { CustomerDto } from './auth.api';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const customerDto: CustomerDto = {
  id: 'c-001',
  email: 'ana@example.com',
  name: 'Ana',
  lastname: 'Pérez',
  country: 'El Salvador',
  personal_address: 'Colonia Escalón, San Salvador',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  deletedAt: null,
};

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('customers.api', () => {
  it('GET /customers/:id resolves the parsed DTO', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(customerDto));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getCustomerById('c-001');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/customers/c-001`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(result.personal_address).toBe('Colonia Escalón, San Salvador');
  });

  it('GET /customers/:id throws an ApiError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: "Customer con ID 'x' no encontrado.", statusCode: 404 },
            { ok: false, status: 404 },
          ),
        ),
    );

    await expect(getCustomerById('x')).rejects.toBeInstanceOf(ApiError);
    await expect(getCustomerById('x')).rejects.toThrow("Customer con ID 'x' no encontrado.");
  });
});
