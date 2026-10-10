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

- `@/types/product` — `Product`, `ProductDto`, `ProductFilters`.
- `@/services/products.service` — mapping DTO→dominio, `filterProducts`, `extractAvailableTags`, `selectFeaturedProducts`.
- `@/api/products.api` — adaptador de datos (MOCK hoy; `fetch` mañana).
- `@/components/common` — `ProductCard` (reutilizada por la landing).
- `@/features/artisans` — `useBusinesses` / `useBusinessDetail` (API pública) para el join best-effort con negocios.
- `@/features/cart` — `useCart` para "Agregar al carrito".
- `@tanstack/react-query` — server state.

## Contrato de datos

El dominio `Product` es: `id`, `businessId`, `businessName?`, `name`, `tags[]`, `imageUrls[]`, `price` (USD).

`ProductDto` (contrato crudo, snake_case) es: `id`, `business_id`, `business_name?`, `name`, `tags[]|null`, `image_urls[]|null`, `price`.

`business_name` es un enriquecimiento opcional: la UI prefiere el nombre del negocio del join con `GET /businesses` y usa `business_name` como fallback (los `business_id` del mock pueden no existir en el backend).

## Integración futura con backend

Hoy los datos son mock (`src/data/mock-products.ts`). Para conectar la API real, reemplazar el cuerpo de `getProducts`/`getProductById` en `src/api/products.api.ts` por `fetch`. No se toca ningún componente, hook ni página.

## Extensión de filtros

`ProductFilters` está preparado para crecer (país, artesano, categoría, rango de precios, disponibilidad). La búsqueda y el filtrado se hacen **en cliente** (`filterProducts`). El filtro por tags usa semántica OR y las opciones se derivan dinámicamente de los productos cargados (`extractAvailableTags`).

## Reglas importantes

- No importar de `@/api/` ni `@/lib/` en componentes/hooks.
- Usar siempre el tipo de dominio `Product`, nunca `ProductDto`, en la UI.
- Resolver imágenes con `@/utils/resolveImageUrl` y precios con `@/utils/formatCurrency`.
- Los tags son datos de producto: no se traducen (Decisión #65).
