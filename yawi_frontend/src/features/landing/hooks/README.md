# Landing Feature Hooks (`src/features/landing/hooks`)

## Propósito

Centraliza los custom hooks encargados de proveer datos, lógica de negocio y estados específicos del feature de la Landing Page.

## Contenido

- `useFeaturedProducts.ts`: Hook que expone la lista de productos destacados junto con banderas de estado (`isLoading`, `isError`).

## Reglas

- **Contrato de API desacoplado**: Diseñado para que la transición de datos locales a llamadas remotas mediante TanStack Query o Supabase no requiera refactorizar los componentes visuales.
- **Prefijo use**: Todos los hooks deben seguir las convenciones de React (`use...`).

## Dependencias

- Importa de: `features/landing/data/`, `features/landing/types.ts`.
- Importado por: `features/landing/components/FeaturedProductsSection/`, `features/landing/index.ts`.
