# Feature: Catalog

## Propósito

Catálogo público de productos artesanales de Yawi.
Rutas: `/products` (catálogo) y `/products/:id` (detalle).

Cubre: explorar, buscar (nombre + tags), filtrar por tags, ver detalle, y agregar al carrito.

## Estructura

- `components/` — Componentes exclusivos de la feature:
  - Catálogo: `CatalogHero`, `ProductSearchBar`, `ProductFilters`, `ProductGrid`, `FeaturedProductsSection`, `CatalogCultureSection`.
  - Detalle: `ProductDetailHero`, `ProductGallery`, `ProductInfo`, `ProductArtisan`, `AddToCartButton`, `ProductCultureSection`.
- `hooks/` — `useProducts` (lista) y `useProductDetail` (detalle por id). Usan TanStack Query.
- `types.ts` — `BusinessNameMap` (tipos locales). Los tipos compartidos viven en `@/types/product`.
- `index.ts` — API pública del feature. Importar solo desde aquí.

## Dependencias clave

- `@/types/product` — `Product`, `ProductDto`, `ProductBusinessDto`, `ProductFilters`.
- `@/services/products.service` — mapping DTO→dominio (`business.name` → `businessName`, coerción de `price`), `filterProducts`, `extractAvailableTags`, `selectFeaturedProducts`.
- `@/api/products.api` — `GET /products` y `GET /products/:id` (HTTP real).
- `@/components/common` — `ProductCard` (reutilizada por la landing).
- `@/features/artisans` — `useBusinessDetail` (API pública) en `ProductDetailPage` para el bloque de artesano (el producto no trae `owner`).
- `@/features/cart` — `useCart` para "Agregar al carrito".
- `@/hooks/useErrorToast` — notificación del error del backend.
- `@tanstack/react-query` — server state.

## Contrato de datos

El dominio `Product` es: `id`, `businessId`, `businessName?`, `name`, `tags[]`, `imageUrls[]`, `price` (USD).

`ProductDto` (contrato crudo real de `yawi_api`, snake_case) es: `id`, `business_id`, `name`, `tags[]|null`, `images_urls[]|null` (**plural**), `properties`, `price: number | string`, `business` (relación anidada con `name`), `createdAt`, `updatedAt`, `deletedAt`.

- No viene `business_name` plano: `businessName` se deriva de `dto.business.name`.
- `price` es `decimal(10,2)`: Postgres lo entrega como **string**, por lo que el servicio lo coerciona con `toNumber`.
- El catálogo **no** hace join con `GET /businesses`: `business.name` ya viene denormalizado en el producto (Decisión #72).

## Integración con el backend

Los datos son reales (`GET /products`, `GET /products/:id`). Los errores del backend se muestran con `useErrorToast` (toast) manteniendo el estado inline con "Reintentar" (Decisión #70).

## Extensión de filtros

`ProductFilters` está preparado para crecer (país, artesano, categoría, rango de precios, disponibilidad). La búsqueda y el filtrado se hacen **en cliente** (`filterProducts`). El filtro por tags usa semántica OR y las opciones se derivan dinámicamente de los productos cargados (`extractAvailableTags`).

## Reglas importantes

- No importar de `@/api/` ni `@/lib/` en componentes/hooks.
- Usar siempre el tipo de dominio `Product`, nunca `ProductDto`, en la UI.
- Resolver imágenes con `@/utils/resolveImageUrl` y precios con `@/utils/formatCurrency`.
- Los tags son datos de producto: no se traducen (Decisión #65).
