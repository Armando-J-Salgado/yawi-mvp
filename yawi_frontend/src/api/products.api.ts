import { MOCK_PRODUCTS } from '@/data/mock-products';
import type { ProductDto } from '@/types/product';

export type { ProductDto } from '@/types/product';

/**
 * ⚠️ ADAPTADOR MOCK TEMPORAL.
 *
 * `yawi_api` todavía no expone la entidad `Product`. Estas funciones devuelven el
 * dataset estático de `src/data/mock-products.ts` con la MISMA firma que tendrá la
 * implementación HTTP real.
 *
 * TODO(backend): reemplazar el cuerpo por:
 *   const res = await fetch(`${API_BASE}/products`);
 *   if (!res.ok) throw new Error(`Error fetching products: ${res.status}`);
 *   return res.json() as Promise<ProductDto[]>;
 *
 * La firma pública no debe cambiar. Los componentes/páginas/servicios no se tocan.
 */
export async function getProducts(): Promise<ProductDto[]> {
  return Promise.resolve(MOCK_PRODUCTS);
}

/**
 * ⚠️ ADAPTADOR MOCK TEMPORAL.
 * TODO(backend): reemplazar por `fetch(`${API_BASE}/products/${id}`)`.
 */
export async function getProductById(id: string): Promise<ProductDto> {
  const found = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`Product ${id} not found`);
  return Promise.resolve(found);
}
