import { describe, it, expect } from 'vitest';
import { filterProducts } from './products.service';
import type { Product } from '@/types/product';

function buildMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-1',
    businessId: 'b-1',
    businessName: 'Taller San Pedro',
    name: 'Vasija de Barro Negro',
    tags: ['barro', 'ceramica', 'artesanias'],
    imageUrls: ['/uploads/products/barro.webp'],
    price: 35.0,
    ...overrides,
  };
}

const mockCatalog: Product[] = [
  buildMockProduct({
    id: 'p-1',
    name: 'Vasija de Barro Negro',
    tags: ['barro', 'ceramica'],
  }),
  buildMockProduct({
    id: 'p-2',
    name: 'Hamaca de Algodón',
    tags: ['textiles', 'hamacas'],
  }),
  buildMockProduct({
    id: 'p-3',
    name: 'Collar de Jade Maya',
    tags: ['joyeria', 'jade'],
  }),
  buildMockProduct({
    id: 'p-4',
    name: 'Máscara de Madera Tallada',
    tags: ['maderas', 'decoracion'],
  }),
];

describe('filterProducts for global search (/buscar)', () => {
  it('returns all products when search query is empty string', () => {
    const results = filterProducts(mockCatalog, { search: '', tags: [] });
    expect(results).toHaveLength(4);
  });

  it('filters by product name (case-insensitive and partial match)', () => {
    const results = filterProducts(mockCatalog, { search: 'barro', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p-1');

    const resultsUpper = filterProducts(mockCatalog, { search: 'HAMACA', tags: [] });
    expect(resultsUpper).toHaveLength(1);
    expect(resultsUpper[0].id).toBe('p-2');
  });

  it('filters by matching a tag (case-insensitive)', () => {
    const results = filterProducts(mockCatalog, { search: 'ceramica', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p-1');
  });

  it('matches either name or tag with OR logic within single search term', () => {
    const results = filterProducts(mockCatalog, { search: 'jade', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p-3');
  });

  it('returns empty array when no product name or tag matches', () => {
    const results = filterProducts(mockCatalog, { search: 'terminoinexistente123', tags: [] });
    expect(results).toHaveLength(0);
  });

  it('handles search queries with surrounding whitespace correctly', () => {
    const results = filterProducts(mockCatalog, { search: '  madera  ', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p-4');
  });
});
