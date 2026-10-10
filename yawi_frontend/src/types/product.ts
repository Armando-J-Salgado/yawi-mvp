/**
 * DTO crudo equivalente al futuro contrato `GET /products` de `yawi_api`.
 *
 * Propiedades mínimas del producto: `id`, `business_id`, `name`, `tags`, `image_urls`
 * (más `price` requerido por el MVP). `tags` e `image_urls` son JSON (lista de strings)
 * y pueden llegar `null`.
 *
 * `business_name` es un enriquecimiento opcional (algunos endpoints devuelven el nombre
 * del negocio denormalizado). La UI lo usa solo como fallback del join con `GET /businesses`.
 */
export interface ProductDto {
  id: string;
  business_id: string;
  business_name?: string;
  name: string;
  tags: string[] | null;
  image_urls: string[] | null;
  price: number;
}

/**
 * Modelo de dominio de un producto artesanal para la UI.
 * El DTO crudo vive en `@/types/product` y se re-exporta desde `api/products.api.ts`.
 */
export interface Product {
  id: string;
  businessId: string; // FK → Business.id
  businessName?: string; // enriquecimiento opcional (fallback del join)
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
