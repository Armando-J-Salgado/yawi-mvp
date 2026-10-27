# Feature: Artesanías

## Propósito

Página principal transaccional del sitio y páginas de categoría individual.
Rutas: `/artesanias` (landing SEO) y `/artesanias/:slug` (categoría).

## Estructura

- `components/` — ArtesaniasHeroBanner, CategoryGrid, CategoryGridCard, CategoryHeroBanner, Breadcrumb, CategorySidebar.
- `hooks/` — useProductsByCategory (filtra productos por tag de categoría).
- `index.ts` — API pública del feature.

## Dependencias

- `@/data/categories` — Definición estática de las 6 categorías canónicas.
- `@/features/catalog` — useProducts (reutilizado para datos reales de productos).
- `@/components/common` — Componentes compartidos de UI.
- `@/types/product` — Contrato de dominio de Product.
