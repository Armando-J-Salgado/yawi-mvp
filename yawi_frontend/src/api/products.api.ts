import { ApiError, extractErrorMessage } from '@/api/auth.api';
import type { ProductDto } from '@/types/product';

export type { ProductDto } from '@/types/product';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * `GET /products` → lista de productos (con su `business`).
 * El backend ordena por `createdAt DESC` y siempre incluye la relación `business`.
 *
 * @throws {ApiError} si el backend responde con status != 2xx.
 * @throws {TypeError} si falla la red (fetch rechaza).
 */
export async function getProducts(): Promise<ProductDto[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as ProductDto[];
}

/**
 * `GET /products/:id` → producto (con su `business`).
 *
 * @throws {ApiError} si el backend responde con status != 2xx (p. ej. 404).
 * @throws {TypeError} si falla la red (fetch rechaza).
 */
export async function getProductById(id: string): Promise<ProductDto> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as ProductDto;
}
