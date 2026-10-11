import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Product, ProductBusinessDto, ProductDto } from '@/types/product';

vi.mock('@/api/products.api', () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
}));

import { getProducts, getProductById } from '@/api/products.api';
import {
  mapProductDtoToDomain,
  fetchProducts,
  fetchProductById,
  toNumber,
  filterProducts,
  extractAvailableTags,
  selectFeaturedProducts,
} from './products.service';

function buildBusiness(overrides: Partial<ProductBusinessDto> = {}): ProductBusinessDto {
  return {
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
    ...overrides,
  };
}

function buildProductDto(overrides: Partial<ProductDto> = {}): ProductDto {
  return {
    id: 'p-001',
    business_id: 'b-001',
    name: 'Tapiz Zapoteco',
    tags: ['textiles', 'decoracion'],
    images_urls: ['/uploads/products/a.webp'],
    properties: {},
    price: 120,
    business: buildBusiness(),
    ...overrides,
  };
}

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-001',
    businessId: 'b-001',
    businessName: 'Familia Mendoza',
    name: 'Tapiz Zapoteco',
    tags: ['textiles', 'decoracion'],
    imageUrls: ['/uploads/products/a.webp'],
    price: 120,
    ...overrides,
  };
}

describe('products.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toNumber', () => {
    it('passes finite numbers through', () => {
      expect(toNumber(120)).toBe(120);
      expect(toNumber(12.5)).toBe(12.5);
    });

    it('parses decimal strings returned by Postgres', () => {
      expect(toNumber('120.00')).toBe(120);
      expect(toNumber('12.50')).toBe(12.5);
    });

    it('falls back to 0 for invalid or missing values', () => {
      expect(toNumber('abc')).toBe(0);
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber(Number.NaN)).toBe(0);
    });
  });

  describe('mapProductDtoToDomain', () => {
    it('maps a DTO to the domain model', () => {
      const product = mapProductDtoToDomain(buildProductDto());

      expect(product.id).toBe('p-001');
      expect(product.businessId).toBe('b-001');
      expect(product.businessName).toBe('Familia Mendoza');
      expect(product.imageUrls).toEqual(['/uploads/products/a.webp']);
      expect(product.price).toBe(120);
    });

    it('coerces a decimal-string price to a number', () => {
      expect(mapProductDtoToDomain(buildProductDto({ price: '85.50' })).price).toBe(85.5);
    });

    it('normalizes null tags and images_urls to empty arrays', () => {
      const product = mapProductDtoToDomain(buildProductDto({ tags: null, images_urls: null }));

      expect(product.tags).toEqual([]);
      expect(product.imageUrls).toEqual([]);
    });

    it('leaves businessName undefined when the business relation is missing', () => {
      expect(
        mapProductDtoToDomain(buildProductDto({ business: null })).businessName,
      ).toBeUndefined();
    });
  });

  describe('fetchProducts', () => {
    it('maps the DTO list to domain products', async () => {
      vi.mocked(getProducts).mockResolvedValueOnce([buildProductDto()]);

      const products = await fetchProducts();

      expect(products).toHaveLength(1);
      expect(products[0].businessId).toBe('b-001');
      expect(products[0].price).toBe(120);
    });

    it('returns an empty array when the API returns none', async () => {
      vi.mocked(getProducts).mockResolvedValueOnce([]);

      await expect(fetchProducts()).resolves.toEqual([]);
    });
  });

  describe('fetchProductById', () => {
    it('maps a single DTO', async () => {
      vi.mocked(getProductById).mockResolvedValueOnce(buildProductDto({ id: 'p-xyz' }));

      const product = await fetchProductById('p-xyz');

      expect(product.id).toBe('p-xyz');
      expect(getProductById).toHaveBeenCalledWith('p-xyz');
    });
  });

  describe('filterProducts', () => {
    const products = [
      buildProduct({ id: 'a', name: 'Tapiz Zapoteco', tags: ['textiles'] }),
      buildProduct({ id: 'b', name: 'Aretes de Plata', tags: ['joyeria'] }),
      buildProduct({ id: 'c', name: 'Vasija de Barro', tags: ['ceramica', 'decoracion'] }),
    ];

    it('returns everything when there are no filters', () => {
      expect(filterProducts(products, { search: '', tags: [] })).toHaveLength(3);
    });

    it('matches by name (case-insensitive)', () => {
      const result = filterProducts(products, { search: 'tapiz', tags: [] });
      expect(result.map((p) => p.id)).toEqual(['a']);
    });

    it('matches by tag through the search term', () => {
      const result = filterProducts(products, { search: 'joyeria', tags: [] });
      expect(result.map((p) => p.id)).toEqual(['b']);
    });

    it('filters by selected tags with OR semantics', () => {
      const result = filterProducts(products, { search: '', tags: ['textiles', 'ceramica'] });
      expect(result.map((p) => p.id).sort()).toEqual(['a', 'c']);
    });

    it('combines search and tag filters', () => {
      const result = filterProducts(products, { search: 'barro', tags: ['decoracion'] });
      expect(result.map((p) => p.id)).toEqual(['c']);
    });

    it('returns empty when nothing matches', () => {
      expect(filterProducts(products, { search: 'inexistente', tags: [] })).toEqual([]);
    });
  });

  describe('extractAvailableTags', () => {
    it('returns unique tags sorted alphabetically', () => {
      const products = [
        buildProduct({ id: 'a', tags: ['textiles', 'decoracion'] }),
        buildProduct({ id: 'b', tags: ['joyeria', 'decoracion'] }),
      ];

      expect(extractAvailableTags(products)).toEqual(['decoracion', 'joyeria', 'textiles']);
    });

    it('returns an empty array when there are no tags', () => {
      expect(extractAvailableTags([buildProduct({ tags: [] })])).toEqual([]);
    });
  });

  describe('selectFeaturedProducts', () => {
    it('respects the limit and preserves order', () => {
      const products = [
        buildProduct({ id: 'a' }),
        buildProduct({ id: 'b' }),
        buildProduct({ id: 'c' }),
        buildProduct({ id: 'd' }),
        buildProduct({ id: 'e' }),
      ];

      const featured = selectFeaturedProducts(products, 3);

      expect(featured.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    });

    it('defaults to 4 items', () => {
      const products = Array.from({ length: 6 }, (_, i) => buildProduct({ id: `p-${i}` }));
      expect(selectFeaturedProducts(products)).toHaveLength(4);
    });
  });
});
