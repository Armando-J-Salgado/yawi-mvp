import { describe, it, expect } from 'vitest';
import { filterProductsByCategoryTag } from './useProductsByCategory';
import type { Product } from '@/types/product';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Jarrón de barro',
    price: 28,
    tags: ['barro-ceramica', 'decoración'],
    imageUrls: ['/images/alfareria.webp'],
    businessId: 'biz-1',
    businessName: 'Taller San José',
  },
  {
    id: 'prod-2',
    name: 'Máscara de madera',
    price: 55,
    tags: ['maderas', 'decoración'],
    imageUrls: ['/images/maderas.webp'],
    businessId: 'biz-1',
    businessName: 'Taller San José',
  },
  {
    id: 'prod-3',
    name: 'Hamaca de algodón',
    price: 75,
    tags: ['textiles-tejidos', 'hogar'],
    imageUrls: ['/images/textiles.webp'],
    businessId: 'biz-2',
    businessName: 'Tejedoras de Cacaopera',
  },
];

describe('filterProductsByCategoryTag', () => {
  it('filtra correctamente productos que contienen el tag solicitado', () => {
    const result = filterProductsByCategoryTag(mockProducts, 'barro-ceramica');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('prod-1');
  });

  it('es insensible a mayúsculas y espacios en el tag', () => {
    const result = filterProductsByCategoryTag(mockProducts, ' MADERAS ');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('prod-2');
  });

  it('devuelve array vacío si ningún producto coincide con el tag', () => {
    const result = filterProductsByCategoryTag(mockProducts, 'joyeria');
    expect(result).toEqual([]);
  });

  it('devuelve array vacío si se pasa una lista vacía, nula o indefinida', () => {
    expect(filterProductsByCategoryTag([], 'maderas')).toEqual([]);
    expect(filterProductsByCategoryTag(null, 'maderas')).toEqual([]);
    expect(filterProductsByCategoryTag(undefined, 'maderas')).toEqual([]);
  });

  it('devuelve array vacío si el tag está vacío', () => {
    expect(filterProductsByCategoryTag(mockProducts, '')).toEqual([]);
  });
});
