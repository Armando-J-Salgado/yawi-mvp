# Landing Feature Hooks (`src/features/landing/hooks`)

## Propósito

Custom hooks que proveen datos y estados específicos del feature de la Landing Page.

## Contenido

### `useFeaturedProducts.ts`

- Devuelve los productos destacados consumiendo la **API real**:
  - `useQuery({ queryKey: ['products'], queryFn: fetchProducts })` — comparte cache con el catálogo.
  - `useBusinesses()` de `@/features/artisans` — join best-effort para país y nombre de negocio.
- Retorno: `{ products, businessNameById, countryByBusinessId, isLoading, isError, error, refetch }`.
- `products` es `Product[]` (dominio de `@/types/product`) ya limitado con `selectFeaturedProducts(..., 6)`.

## Reglas

- **Prefijo use**: todos los hooks siguen la convención `use...`.
- **Sin fetch directo**: los datos se piden por `services/` (nunca aquí).
- Los componentes visuales reciben los datos por props; no llaman a la API.

## Dependencias

- Importa de: `@/services/products.service`, `@/features/artisans` (API pública), `@/types/product`, `@tanstack/react-query`.
- Importado por: `features/landing/components/FeaturedProductsSection/`, `features/landing/index.ts`.
