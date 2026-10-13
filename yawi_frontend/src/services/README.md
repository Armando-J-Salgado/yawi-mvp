# Services Layer (`src/services`)

## Propósito

Lógica de dominio **pura** (sin React): mapea DTOs del backend a modelos de dominio, construye payloads, calcula y orquesta varias llamadas de `api/`. Los componentes y stores consumen servicios, nunca la API directamente.

## Reglas

- **Sin React** (ni hooks, ni JSX).
- **Mapeo DTO ↔ dominio** aquí, no en `api/` ni en componentes.
- **Orquestación**: un servicio puede llamar a varios `*.api.ts`.
- Una responsabilidad por archivo, nombrado `<dominio>.service.ts`, con su test colocado `<dominio>.service.test.ts`.

## Contenido

| Archivo               | Responsabilidad                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.service.ts`     | `loginUser` (real, `POST /auth/login`), `registerUser` (real, `POST /customers`) y `fetchCurrentUser` (`GET /auth/me`, bootstrap). Mapea DTOs ↔ `AuthUser`/`AuthResponse` y normaliza errores a `AuthResponse`.                                                        |
| `artisans.service.ts` | Mapea `BusinessDto` → `Business`, sanea datos públicos del vendor (`PublicVendor`).                                                                                                                                                                                    |
| `products.service.ts` | Mapea `ProductDto` → `Product` (deriva `businessName` de `business.name` y coerciona `price` con `toNumber`, por el `decimal`→string de Postgres); `filterProducts` (búsqueda por nombre/tags + filtro por tags OR), `extractAvailableTags`, `selectFeaturedProducts`. |
| `cart.service.ts`     | Lógica pura del carrito: `toCartItem`, `addItem`, `incrementItem`, `decrementItem`, `removeItem`, `computeTotalItems`, `computeSubtotal`.                                                                                                                              |
| `order.service.ts`    | Mapea `OrderDto`/`OrderItemDto` → `Order`/`OrderItem` (coerciona `subtotal`/`shipping_fee`/`total`/`unit_price` con `toNumber`); `buildOrderPayload` (SOLO `product_id` + `quantity` desde el carrito); `fetchOrders`, `fetchOrderById`, `submitOrder`.                |
| `customer.service.ts` | Mapea `CustomerDto` → `CustomerProfile` (`personal_address` → `address`) para prellenar la dirección de entrega del checkout.                                                                                                                                          |

## Nota sobre imports (`@/` vs relativos)

El alias `@/` está configurado tanto en `vite.config.ts` como en `vitest.config.ts` (`resolve.alias`), así que resuelve en build y en tests. Los archivos de `auth` conservan imports relativos por historia; los nuevos pueden usar `@/`.

## Nota sobre `toNumber`

`toNumber` vive en `@/utils/toNumber.ts` (Decisión #92) y es compartido por `products.service` y `order.service`. `products.service` lo re-exporta por compatibilidad con consumidores previos.

## Dependencias

- Importa de: `api/`, `utils/`, `types/`.
- Importado por: `features/`, `pages/`, `store/`.
