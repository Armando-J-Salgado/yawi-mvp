# API Layer (`src/api`)

## Propósito

Contiene las llamadas **crudas** al backend. Es la **única** capa autorizada a usar `fetch` (o el cliente HTTP/Supabase). No contiene React ni lógica de mapeo de dominio: recibe/retorna DTOs del backend y lanza errores tipados.

## Reglas

- **Nadie más hace `fetch`.** Componentes, hooks, páginas, stores y servicios consumen estos archivos.
- **DTOs dentro del archivo de recurso.** Los tipos del contrato del backend (`CustomerDto`, `BusinessDto`, etc.) se definen y exportan en el propio `*.api.ts` (no en `types/`), tal como indica `src/ARCHITECTURE.md`.
- **Un archivo por recurso**, nombrado `<recurso>.api.ts`.
- **Errores tipados.** Las respuestas no-2xx se convierten en `ApiError` (ver `auth.api.ts`) con el `message` del backend.

## Patrón HTTP vigente

```ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const res = await fetch(`${API_BASE}/<recurso>`, {/* ... */});
```

`VITE_API_URL` se define en `.env.local` / `.env.example` (por defecto `http://localhost:3000`).

## Recursos

| Archivo           | Recurso                                                                                             | Consumido por                  |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| `auth.api.ts`     | `POST /customers` (registro), `POST /auth/login` (login), `GET /auth/me` (sesión)                   | `services/auth.service.ts`     |
| `artisans.api.ts` | `GET /businesses`, `GET /businesses/:id`                                                            | `services/artisans.service.ts` |
| `products.api.ts` | **MOCK** de `GET /products`, `GET /products/:id` (reemplazar por `fetch` cuando exista el endpoint) | `services/products.service.ts` |

## Auth (`auth.api.ts`)

- `registerApi(payload)` → `POST /customers` (público).
- `loginApi(credentials)` → `POST /auth/login` (público). Devuelve `LoginResponseDto`
  (`access_token`, `token_type`, `expires_in`, `user: AuthUserDto`).
- `getMeApi()` → `GET /auth/me` (protegido). Lee el JWT desde `lib/authToken`
  mediante `buildAuthHeaders()` (la capa `api` no conoce el store).
- Los errores no-2xx se normalizan a `ApiError` con el `message` del backend.

## Products (`products.api.ts`)

- **Adaptador mock temporal**: `yawi_api` aún no expone `Product`. `getProducts()` y `getProductById(id)` devuelven el dataset `src/data/mock-products.ts` con la MISMA firma que tendrá la implementación HTTP real.
- Al existir el endpoint, reemplazar el cuerpo de ambas funciones por `fetch(`${API_BASE}/products`)` / `fetch(`${API_BASE}/products/${id}`)`; eliminar `src/data/mock-products.ts`. No se tocan componentes ni servicios.
- El DTO `ProductDto` **se declara en `@/types/product`** (no en el `.api.ts`) y se re-exporta desde aquí, para romper el ciclo `api ↔ data` (regla de capas: `data → types`).

## Nota sobre el alias `@/`

`vite.config.ts` define el alias `@/` y `vitest.config.ts` lo replica en `resolve.alias`, por lo que tanto el build como los tests resuelven `@/`. Los archivos de `auth` conservan **imports relativos** por historia; los nuevos archivos pueden usar `@/` sin problema.

## Dependencias

- Importa de: env de Vite (`import.meta.env`).
- Importado por: `services/` (nunca por componentes/páginas).
