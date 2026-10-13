/**
 * Relación `business` tal como la devuelve `GET /products` / `GET /products/:id`
 * (cargada con `relations: { business: true }`). NO incluye `owner`.
 */
export interface ProductBusinessDto {
  id: string;
  name: string;
  description: string;
  address: string;
  balance: number | string;
  imagesUrls: string[] | null;
  owner_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * DTO crudo del contrato real de `yawi_api` (`GET /products`, `GET /products/:id`).
 *
 * - `images_urls` es JSON (lista de strings) y puede llegar `null`. ⚠️ Plural.
 * - `tags` puede llegar `null` de forma defensiva (la columna tiene default `[]`).
 * - `price` es `decimal(10,2)`: Postgres lo entrega como string (`"12.50"`).
 * - `properties` existe en el contrato pero NO se usa en la UI (fuera de alcance).
 * - `business` siempre viene en la respuesta; se tipa opcional por robustez del mapper.
 */
export interface ProductDto {
  id: string;
  business_id: string;
  name: string;
  tags: string[] | null;
  images_urls: string[] | null;
  properties?: Record<string, unknown> | null;
  price: number | string;
  business?: ProductBusinessDto | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Modelo de dominio de un producto artesanal para la UI.
 * El DTO crudo vive en `@/types/product` y se re-exporta desde `api/products.api.ts`.
 */
export interface Product {
  id: string;
  businessId: string; // FK → Business.id
  businessName?: string; // derivado de `business.name`
  name: string;
  tags: string[]; // nunca null (array vacío si no tiene)
  imageUrls: string[]; // nunca null (array vacío si no tiene)
  price: number; // moneda fija USD (Decisión #51)
}

/**
 * Estado de filtros del catálogo.
 * Diseñado para extenderse en el futuro con:
 * `country`, `artisanId`, `category`, `priceMin`, `priceMax`, `availability`.
 */
export interface ProductFilters {
  search: string; // nombre o tags
  tags: string[]; // tags seleccionadas (semántica OR)
}
