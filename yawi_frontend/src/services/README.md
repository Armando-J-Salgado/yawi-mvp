# Services Layer (`src/services`)

## Propósito

Lógica de dominio **pura** (sin React): mapea DTOs del backend a modelos de dominio, construye payloads, calcula y orquesta varias llamadas de `api/`. Los componentes y stores consumen servicios, nunca la API directamente.

## Reglas

- **Sin React** (ni hooks, ni JSX).
- **Mapeo DTO ↔ dominio** aquí, no en `api/` ni en componentes.
- **Orquestación**: un servicio puede llamar a varios `*.api.ts`.
- Una responsabilidad por archivo, nombrado `<dominio>.service.ts`, con su test colocado `<dominio>.service.test.ts`.

## Contenido

| Archivo               | Responsabilidad                                                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.service.ts`     | `loginUser` (real, `POST /auth/login`), `registerUser` (real, `POST /customers`) y `fetchCurrentUser` (`GET /auth/me`, bootstrap). Mapea DTOs ↔ `AuthUser`/`AuthResponse` y normaliza errores a `AuthResponse`. |
| `artisans.service.ts` | Mapea `BusinessDto` → `Business`, sanea datos públicos del vendor (`PublicVendor`).                                                                                                                             |
| `products.service.ts` | Mapea `ProductDto` → `Product`; `filterProducts` (búsqueda por nombre/tags + filtro por tags OR), `extractAvailableTags`, `selectFeaturedProducts`.                                                             |
| `cart.service.ts`     | Lógica pura del carrito: `toCartItem`, `addItem`, `incrementItem`, `decrementItem`, `removeItem`, `computeTotalItems`, `computeSubtotal`.                                                                       |

## Nota sobre imports (`@/` vs relativos)

El alias `@/` está configurado tanto en `vite.config.ts` como en `vitest.config.ts` (`resolve.alias`), así que resuelve en build y en tests. Los archivos de `auth` conservan imports relativos por historia; los nuevos pueden usar `@/`.

## Dependencias

- Importa de: `api/`, `utils/`, `types/`.
- Importado por: `features/`, `pages/`, `store/`.
