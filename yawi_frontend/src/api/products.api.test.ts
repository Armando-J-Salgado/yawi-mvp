import { describe, it, expect, vi, afterEach } from 'vitest';
import { ApiError } from './auth.api';
import { getProducts, getProductById } from './products.api';
import type { ProductDto } from '@/types/product';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const productDto: ProductDto = {
  id: 'p-001',
  business_id: 'b-001',
  name: 'Tapiz Zapoteco',
  tags: ['textiles'],
  images_urls: ['/uploads/products/a.webp'],
  properties: { origin: 'El Salvador' },
  price: '120.00',
  business: {
    id: 'b-001',
    name: 'Familia Mendoza',
    description: 'Taller de textiles',
    address: 'San Salvador',
    balance: '0.00',
    imagesUrls: null,
    owner_id: 'v-001',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    deletedAt: null,
  },
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

describe('products.api', () => {
  it('GET /products resolves the parsed DTO list', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([productDto]));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getProducts();

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/products`);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p-001');
    expect(result[0].images_urls).toEqual(['/uploads/products/a.webp']);
  });

  it('GET /products throws ApiError with the backend message when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: 'Error del backend', statusCode: 500 },
            { ok: false, status: 500 },
          ),
        ),
    );

    await expect(getProducts()).rejects.toBeInstanceOf(ApiError);
    await expect(getProducts()).rejects.toThrow('Error del backend');
  });

  it('joins an array of backend messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: ['name should not be empty', 'price must be positive'], statusCode: 400 },
            { ok: false, status: 400 },
          ),
        ),
    );

    await expect(getProducts()).rejects.toThrow('name should not be empty price must be positive');
  });

  it('GET /products/:id resolves the parsed DTO', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(productDto));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getProductById('p-001');

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/products/p-001`);
    expect(result.name).toBe('Tapiz Zapoteco');
  });

  it('GET /products/:id throws an ApiError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { message: "Product con ID 'x' no encontrado.", statusCode: 404 },
            { ok: false, status: 404 },
          ),
        ),
    );

    await expect(getProductById('x')).rejects.toBeInstanceOf(ApiError);
    await expect(getProductById('x')).rejects.toThrow("Product con ID 'x' no encontrado.");
  });
});
