# Hooks (`src/hooks`)

## Propósito

Hooks **genéricos y reutilizables, sin conocimiento de dominio** (ver `ARCHITECTURE.md` §3).
La lógica específica de una capacidad de negocio vive en `features/<nombre>/hooks/`.

## Inventario

| Hook            | Firma                                                          | Qué hace                                                                                               |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `useErrorToast` | `(isError: boolean, error: unknown, fallback: string) => void` | Cuando `isError` es `true`, dispara `showToast.error(...)` con el mensaje del backend o el `fallback`. |

## `useErrorToast`

- Ubicación: `src/hooks/useErrorToast.ts`.
- Se usa para cumplir el RF "notificación de error enviado desde el backend": recibe el
  `error` de una query de TanStack Query y muestra su `message` (los `ApiError` de `api/`
  ya contienen el `message` que envió NestJS).
- La extracción del mensaje es lógica pura y vive en `@/utils/apiErrorMessage`
  (testeada en `apiErrorMessage.test.ts`). El hook solo conecta el estado con el toast.
- **No tiene test automático**: usa React y el proyecto no tiene `@testing-library`/`jsdom`
  (Decisión #50/#62). Su lógica testeable se cubre vía `apiErrorMessage`.

## Dependencias

- Importa de: `@/components/ui` (`showToast`), `@/utils/apiErrorMessage`, `react`.
- Importado por: páginas/secciones que consumen server state (p. ej. `CatalogPage`,
  `ProductDetailPage`, `FeaturedProductsSection` de la landing).
