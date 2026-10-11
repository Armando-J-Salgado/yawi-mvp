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

| Archivo           | Recurso                                                                           | Consumido por                  |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| `auth.api.ts`     | `POST /customers` (registro), `POST /auth/login` (login), `GET /auth/me` (sesión) | `services/auth.service.ts`     |
| `artisans.api.ts` | `GET /businesses`, `GET /businesses/:id`                                          | `services/artisans.service.ts` |
| `products.api.ts` | `GET /products`, `GET /products/:id` (contrato real)                              | `services/products.service.ts` |

## Auth (`auth.api.ts`)

- `registerApi(payload)` → `POST /customers` (público).
- `loginApi(credentials)` → `POST /auth/login` (público). Devuelve `LoginResponseDto`
  (`access_token`, `token_type`, `expires_in`, `user: AuthUserDto`).
- `getMeApi()` → `GET /auth/me` (protegido). Lee el JWT desde `lib/authToken`
  mediante `buildAuthHeaders()` (la capa `api` no conoce el store).
- Los errores no-2xx se normalizan a `ApiError` con el `message` del backend.

## Products (`products.api.ts`)

- **HTTP real**: `getProducts()` → `GET /products` y `getProductById(id)` → `GET /products/:id` de `yawi_api`.
- Ambas funciones lanzan `ApiError` (con el `message` del backend) si la respuesta no es 2xx. `ApiError` y `extractErrorMessage` **se reutilizan desde `auth.api.ts`** (importación lateral dentro de la capa `api/`, no se invierten capas). Ver Decisión #69.
- El contrato real (ver `yawi_api/src/products/entities/product.entity.ts`) usa `images_urls` (**plural**), `properties` y `price` como `decimal` (Postgres lo entrega como string). El DTO `ProductDto` vive en `@/types/product` y se re-exporta desde aquí.
- La coerción de `price` (`string` → `number`) y el mapeo a dominio ocurren en `services/products.service.ts`, nunca aquí.
- No se asume ninguna estructura alternativa a la del backend.

## Nota sobre el alias `@/`

`vite.config.ts` define el alias `@/` y `vitest.config.ts` lo replica en `resolve.alias`, por lo que tanto el build como los tests resuelven `@/`. Los archivos de `auth` conservan **imports relativos** por historia; los nuevos archivos pueden usar `@/` sin problema.

## Dependencias

- Importa de: env de Vite (`import.meta.env`).
- Importado por: `services/` (nunca por componentes/páginas).
