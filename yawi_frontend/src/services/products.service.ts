import { getProducts, getProductById } from '@/api/products.api';
import type { Product, ProductDto, ProductFilters } from '@/types/product';

/** DTO → dominio. Normaliza `null` a arrays vacíos. */
export function mapProductDtoToDomain(dto: ProductDto): Product {
  return {
    id: dto.id,
    businessId: dto.business_id,
    businessName: dto.business_name,
    name: dto.name,
    tags: dto.tags ?? [],
    imageUrls: dto.image_urls ?? [],
    price: dto.price,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  return (await getProducts()).map(mapProductDtoToDomain);
}

export async function fetchProductById(id: string): Promise<Product> {
  return mapProductDtoToDomain(await getProductById(id));
}

/**
 * Filtra por nombre **o** tags (búsqueda) y por tags seleccionadas (semántica OR).
 * Preparado para crecer (ver `ProductFilters`): país, artesano, categoría, precio, disponibilidad.
 */
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const term = filters.search.trim().toLowerCase();
  return products.filter((p) => {
    const matchesSearch =
      term === '' ||
      p.name.toLowerCase().includes(term) ||
      p.tags.some((tag) => tag.toLowerCase().includes(term));
    const matchesTags =
      filters.tags.length === 0 || filters.tags.some((tag) => p.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
}

/** Tags únicos de los productos cargados, ordenados alfabéticamente. */
export function extractAvailableTags(products: Product[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b));
}

/** Selección determinista de destacados (primeros `limit`). */
export function selectFeaturedProducts(products: Product[], limit = 4): Product[] {
  return products.slice(0, limit);
}
