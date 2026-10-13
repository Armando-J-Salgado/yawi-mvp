# IMPLEMENTATION PLAN — Milestone 8: Checkout, Pagos (mock Stripe/Wompi) y Órdenes

> **Redactado por**: Arquitecto Senior (rol de planificación)
> **Implementador objetivo**: Agente IA nivel junior
> **Fecha**: 2026-10-10
> **Rama sugerida**: `feature/m8-checkout-orders`
> **Estado**: Aprobado e implementado (incluye cargo de envío explícito en el checkout, Decisión #93)

---

## 0. Prerequisitos — Leer antes de tocar cualquier archivo

1. Leer `src/ARCHITECTURE.md` completo. **Si algún paso de este plan contradice ese archivo, la arquitectura manda y debes pausar para consultar.**
2. Leer `docs/DESIGN.md` (colores, spacing, cards, CTAs, responsive) y `docs/DECISIONS.md` (decisiones #1–#75). Este plan agrega la sección **Milestone 8 (#76–#92)**.
3. Leer `docs/IMPLEMENTATION_PLAN_M6.md` y `docs/IMPLEMENTATION_PLAN_M7.md`: **catálogo, detalle de producto, carrito y la integración real de productos YA están implementados**. Este milestone NO los rehace; solo los reutiliza y conecta.
4. Leer (SOLO LECTURA, no modificar) el contrato real de órdenes en `yawi_api/src/orders/` (entidades, DTOs, controlador) y `yawi_api/src/customers/`.
5. **`yawi_api` es de SOLO LECTURA.** No modificar entidades, DTOs, controladores ni servicios.
6. **Nunca** escribir hexadecimales de color en componentes. Solo tokens Tailwind del `@theme` (`text-primary-navy`, `bg-peach-accent`, etc.) o `var(--color-*)`.
7. **TDD**: para `utils`, adaptadores `api/`, servicios, stores y proveedores de pago se escribe **primero el test**, se ve fallar y luego la implementación hasta ponerlo en verde.
8. **No** ejecutar `npm run lint` ni `oxlint`. Al terminar ejecutar `npx tsc --noEmit`, `npx vitest run`, `npm run format:check` (y `npm run format` si falla).
9. `@/` alias ya está activo (vite + vitest). Usarlo en todos los imports nuevos.
10. **No** crear carpetas top-level nuevas en `src/`. No introducir `adapters/`, `contexts/`, ni features fuera de `checkout`/`orders`.
11. Tests sin React: **no hay RTL ni jsdom** (Decisión #50). Solo lógica pura (Vitest node).

---

## 1. Contexto y hallazgos

### 1.1 Situación actual (lo que ya existe)

| Pieza                                                        | Estado                                      |
| ------------------------------------------------------------ | ------------------------------------------- |
| Catálogo `/products`, detalle `/products/:id`                | ✅ Implementado (M6)                        |
| Carrito `/cart` + `CartDrawer` global + `cartStore`          | ✅ Implementado (M6)                        |
| API real de productos (`GET /products`, `GET /products/:id`) | ✅ Implementado (M7)                        |
| Sesión de cliente (`authStore`, `restoreSession`, JWT)       | ✅ Implementado (M4/M4-2)                   |
| `useErrorToast`, `formatCurrency`, `apiErrorMessage`         | ✅ Disponibles en `src/hooks` y `src/utils` |
| **Checkout, órdenes, pagos, guardas de ruta**                | ❌ **No existen** — este milestone          |

Hoy el CTA "Finalizar compra" del `CartDrawer` y de `CartPage` está **deshabilitado** con el texto `checkout_coming_soon`. Este milestone lo activa.

### 1.2 Contrato real de `yawi_api` para órdenes (SOLO LECTURA)

Controlador `yawi_api/src/orders/orders.controller.ts`:

| Método                   | Ruta                            | Uso en este milestone                       |
| ------------------------ | ------------------------------- | ------------------------------------------- |
| `POST`                   | `/orders`                       | Crear la orden (+ líneas).                  |
| `GET`                    | `/orders?customer_id=<uuid>`    | Listar las órdenes del cliente autenticado. |
| `GET`                    | `/orders/:id`                   | Detalle de una orden.                       |
| `PATCH`                  | `/orders/:id/status`            | **NO usar** (el usuario no cambia estados). |
| `DELETE`/`PATCH recover` | **NO usar** (fuera de alcance). |

**Payload de creación** (`CreateOrderDto`) — el cliente SOLO envía esto:

```json
{
  "customer_id": "uuid-del-customer",
  "delivery_address": "Colonia Escalón, San Salvador",
  "items": [{ "product_id": "uuid-producto-1", "quantity": 2 }]
}
```

El cliente **NO debe enviar**: `total`, `subtotal`, `shipping_fee`, `unit_price`, `product_name`, `business_id` (en items) ni `status`. El backend calcula totales y aplica `shipping_fee = $10.00` fijo.

**Respuesta** (`Order` con `items: OrderProduct[]`):

```ts
Order {
  id: string;
  customer_id: string;
  delivery_address: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  subtotal: number | string;      // decimal → string en runtime (Postgres/pg)
  shipping_fee: number | string;
  total: number | string;
  items: OrderProduct[];
  createdAt: string; updatedAt: string; deletedAt: string | null;
}
OrderProduct {
  id: string; order_id: string; product_id: string; business_id: string;
  product_name: string; unit_price: number | string; quantity: number;
  subtotal: number | string; createdAt: string; updatedAt: string;
}
```

> **Decimales:** igual que `Product.price` en M7, `pg` entrega las columnas `decimal(10,2)` como **string** (`"24.00"`). Hay que coercionar a `number` antes de formatear (reutilizar `toNumber`, ver Paso 1).

### 1.3 Datos del cliente autenticado

- `GET /auth/me` devuelve `{ id, userType, email, name, lastname }`; el `id` de un `userType: 'customer'` **es el `customer_id`** que exige `POST /orders`. `AuthUser.id` ya está en `authStore`.
- La dirección (`personal_address`) **no** viene en `/auth/me`. Se obtiene con `GET /customers/:id` (entidad `Customer`), y se usa **solo como prefill** del formulario de entrega.

### 1.4 Ausencia de auth en el backend (deuda conocida)

El plan de órdenes de `yawi_api` **excluye explícitamente** los guards (`Excluido: Auth, JWT, roles...`). Por lo tanto:

- La protección real de `/checkout` y `/orders` en esta iteración es **frontend** (`RequireAuth`), y el filtrado por `customer_id` se hace en la petición.
- Esto es una **deuda registrada** (Decisión #81): cuando `yawi_api` agregue guards, el frontend no cambia (ya envía el token vía `buildAuthHeaders`).

### 1.5 Imágenes / image uploader (verificación solicitada)

Ya resuelto en M7: el contrato real es `images_urls` (plural) y `resolveImageUrl` maneja rutas relativas `/uploads/...` y absolutas. **No hay trabajo nuevo aquí**; se reutiliza tal cual en las líneas de orden (aunque el snapshot de orden usa `product_name` y `unit_price`, no imágenes).

---

## 2. Alcance

### Dentro del alcance

- **Guardas de ruta** `RequireAuth` para `/checkout`, `/orders`, `/orders/:id`.
- **Checkout** (`/checkout`): resumen del pedido, formulario de dirección de entrega (prefill opcional), selector visual de método de pago (**Stripe** y **Wompi**), confirmación de compra, creación de la orden y pantalla de confirmación con instrucciones de transferencia mock.
- **Capa de pagos mock** con contratos claros (`PaymentProvider`) y dos adaptadores (`stripeProvider`, `wompiProvider`) que simulan transferencia bancaria. Sin red, sin tarjetas, sin tokens, sin webhooks.
- **Órdenes** (`/orders` y `/orders/:id`): listado de las órdenes del cliente autenticado y detalle con líneas, totales y estado actual (solo lectura).
- **Servicios y adaptadores** (`api/orders.api.ts`, `api/customers.api.ts`, `services/order.service.ts`) con mocks de red controlados por tests.
- **i18n** ES/EN para todos los textos nuevos (namespaces `checkout` y `orders`).
- **TDD** en utils, adaptadores, servicios, store de checkout y proveedores de pago.
- READMEs por carpeta relevante y actualización de `docs/DECISIONS.md`.

### Fuera del alcance (explícitamente NO hacer)

- Integración real con Stripe o Wompi; cobros, tarjetas, tokens, webhooks, credenciales.
- Cancelación de órdenes por el usuario ni cambios manuales de estado (no se usa `PATCH /orders/:id/status`, `DELETE` ni `recover`).
- Persistencia remota del carrito.
- Rehacer catálogo, detalle de producto o carrito (ya implementados en M6/M7).
- Modificar `yawi_api`.
- Crear carpetas top-level nuevas en `src/` (`adapters/`, `contexts/`, etc.).
- Valoraciones, reseñas, métricas comerciales.

---

## 3. Decisiones arquitectónicas de este Milestone

Se documentarán en `docs/DECISIONS.md` (sección **Milestone 8 — Checkout, Pagos y Órdenes**), continuando desde #75.

| #      | Decisión                                | Opciones consideradas                                        | Elección                                                               | Justificación                                                                                                                 |
| ------ | --------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **76** | **Alcance del milestone**               | Re-especificar las 5 páginas, centrarse en lo nuevo          | **Solo checkout, órdenes, guards y pagos mock**                        | Catálogo/detalle/carrito ya están implementados (M6/M7). Rehacerlos sería re-trabajo y riesgo.                                |
| **77** | **Rutas nuevas**                        | `/checkout`+`/orders`, `/pagar`+`/mis-ordenes`               | **`/checkout`, `/orders`, `/orders/:id`**                              | Convención de URLs en inglés del proyecto (Decisión #54).                                                                     |
| **78** | **Guardas de ruta**                     | Diferir, `RequireAuth` con `<Outlet/>`                       | **`routes/guards.tsx` → `RequireAuth`**                                | El requerimiento exige autenticación previa para checkout y órdenes. Se materializa la deuda diferida en `DECISIONS.md`.      |
| **79** | **Origen de `customer_id`**             | Re-llamar `/auth/me`, usar `authStore.user.id`               | **`authStore.user.id`**                                                | El `id` del customer autenticado ya está en el store; cero llamadas redundantes.                                              |
| **80** | **Dirección de entrega**                | Solo API, solo formulario, formulario + prefill              | **Input requerido con prefill opcional vía `GET /customers/:id`**      | `delivery_address` es obligatorio; el prefill mejora UX sin bloquear si la API falla.                                         |
| **81** | **Aislamiento de órdenes (ownership)**  | Guard en backend, filtro en frontend                         | **Filtro `GET /orders?customer_id` + `RequireAuth` (deuda)**           | El backend aún no tiene guards (plan de órdenes lo excluye). Se documenta la deuda; el frontend ya envía el token.            |
| **82** | **Ubicación de la capa de pagos**       | `src/adapters/`, `services/`, `features/checkout/providers/` | **`features/checkout/providers/`**                                     | `ARCHITECTURE.md` no define `adapters/` (Decisión #61). Los proveedores son específicos de checkout → internos del feature.   |
| **83** | **Persistencia del proveedor de pago**  | Persistir en Order/localStorage, no persistir                | **No persistir (solo UI efímera)**                                     | `Order` no tiene campos de pago; no tocar `yawi_api`. El contrato `PaymentProvider` queda listo para integración real futura. |
| **84** | **Estado del checkout**                 | `useState`, Zustand persist, Zustand sin persist             | **`features/checkout/store/checkoutStore.ts` (Zustand, SIN persist)**  | Mantiene el estado efímero, desacopla la UI y es testeable en Vitest node. El carrito ya persiste aparte.                     |
| **85** | **Orquestación del checkout**           | Todo en el componente, hook `useMutation` en el feature      | **`useCheckout`/`useCreateOrder` (TanStack `useMutation`)**            | Separa "lógica de checkout" de "lógica de órdenes" y "proveedores". Continúa el patrón TanStack de #26.                       |
| **86** | **Modelo de dominio de orden**          | Usar DTO crudo en la UI                                      | **`types/order.ts` + mapping en `services/order.service.ts`**          | `ARCHITECTURE.md` §3: el servicio mapea DTO→dominio y coercionar decimales.                                                   |
| **87** | **Namespaces i18n**                     | `shop`, `checkout`+`orders`                                  | **`checkout` + `orders`**                                              | Separación por dominio, consistente con `catalog`/`cart` (Decisiones #60).                                                    |
| **88** | **Comportamiento post-orden**           | Mantener carrito, vaciar + confirmación                      | **Vaciar carrito + paso de confirmación con instrucciones**            | Cumple "mostrar instrucciones de transferencia" y deja CTA al detalle de la orden.                                            |
| **89** | **Acceso a órdenes en la UI**           | Solo URL directa, enlaces en menús                           | **Enlace "Mis órdenes" en `ProfileMenu` y `MobileMenu`**               | Descubribilidad para el cliente autenticado.                                                                                  |
| **90** | **Redirect post-login**                 | Siempre `/`, honrar `from`                                   | **`LoginForm` honra `location.state.from` (fallback `/`)**             | Permite volver a `/checkout` tras loguearse (UX del guard). No rompe el comportamiento actual si no hay `from`.               |
| **91** | **Estados de UI (loading/error/empty)** | Crear `common/EmptyState`+`ErrorState`, inline               | **Inline por feature (patrón M6/M7)**                                  | Esos componentes no existen aún; crearlos sería ampliar alcance. Se reutiliza `Skeleton`, `useErrorToast` y estados inline.   |
| **92** | **`toNumber` compartido**               | Duplicar, extraer a `utils`                                  | **`utils/toNumber.ts` usado por `products.service` y `order.service`** | Evita duplicar la coerción decimal. `products.service` RE-EXPORTA `toNumber` para no romper los tests de M7.                  |

> **Decisión adicional (aprobación del dueño del producto):**
>
> | #      | Decisión                          | Elección                                               | Justificación                                                                                              |
> | ------ | --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
> | **93** | **Cargo de envío en el checkout** | **Mostrar el envío fijo ($10.00) y un total estimado** | El checkout debe indicar que habrá cobro por envío; el total autoritativo lo sigue confirmando el backend. |

> **Deuda registrada (no implementar ahora):** cuando `yawi_api` agregue Auth/guards a `orders`, el frontend no cambia (ya envía `Authorization`). Además, la selección de proveedor de pago no se persiste hasta que exista un campo de pago en `Order`.

---

## 4. Estructura de archivos

### 4.1 Archivos nuevos

```text
src/
├── types/
│   └── order.ts                              ← Order, OrderItem, OrderStatus, OrderDto, OrderItemDto, CreateOrderPayload
│
├── utils/
│   ├── toNumber.ts                           ← coercion decimal (compartido)
│   └── toNumber.test.ts
│
├── api/
│   ├── orders.api.ts                         ← createOrder, getOrders, getOrderById (fetch real)
│   ├── orders.api.test.ts
│   ├── customers.api.ts                      ← getCustomerById (prefill de dirección)
│   └── customers.api.test.ts
│
├── services/
│   ├── order.service.ts                      ← mapping DTO→dominio, buildOrderPayload, fetch/submit
│   └── order.service.test.ts
│
├── routes/
│   └── guards.tsx                            ← RequireAuth (redirige a /login con state.from)
│
├── features/
│   ├── checkout/
│   │   ├── providers/
│   │   │   ├── types.ts                      ← PaymentProvider, PaymentSession, TransferInstructions, PaymentProviderId
│   │   │   ├── stripeProvider.ts
│   │   │   ├── stripeProvider.test.ts
│   │   │   ├── wompiProvider.ts
│   │   │   ├── wompiProvider.test.ts
│   │   │   ├── paymentProviders.ts           ← registry (PAYMENT_PROVIDERS, getPaymentProvider)
│   │   │   └── paymentProviders.test.ts
│   │   ├── store/
│   │   │   ├── checkoutStore.ts              ← Zustand SIN persist (providerId, step, session)
│   │   │   └── checkoutStore.test.ts
│   │   ├── hooks/
│   │   │   ├── useCheckout.ts                ← orquesta carrito + orden + proveedor
│   │   │   └── useCustomerProfile.ts         ← prefill de dirección (GET /customers/:id)
│   │   ├── components/
│   │   │   ├── CheckoutSummary/              (CheckoutSummary.tsx, index.ts)
│   │   │   ├── DeliveryAddressForm/          (DeliveryAddressForm.tsx, index.ts)
│   │   │   ├── PaymentMethodSelector/        (PaymentMethodSelector.tsx, index.ts)
│   │   │   ├── CheckoutConfirmation/         (CheckoutConfirmation.tsx, index.ts)
│   │   │   └── CheckoutEmptyCart/            (CheckoutEmptyCart.tsx, index.ts)
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   └── orders/
│       ├── hooks/
│       │   ├── useOrders.ts
│       │   └── useOrderDetail.ts
│       ├── components/
│       │   ├── OrdersList/                   (OrdersList.tsx, index.ts)
│       │   ├── OrderCard/                    (OrderCard.tsx, index.ts)
│       │   ├── OrderStatusBadge/             (OrderStatusBadge.tsx, index.ts)
│       │   ├── OrderItemsList/               (OrderItemsList.tsx, index.ts)
│       │   ├── OrderTotals/                  (OrderTotals.tsx, index.ts)
│       │   └── OrdersEmptyState/             (OrdersEmptyState.tsx, index.ts)
│       ├── types.ts
│       ├── index.ts
│       └── README.md
│
├── pages/
│   ├── CheckoutPage/                         (CheckoutPage.tsx, index.ts)
│   ├── OrdersPage/                           (OrdersPage.tsx, index.ts)
│   └── OrderDetailPage/                      (OrderDetailPage.tsx, index.ts)
│
└── i18n/locales/
    ├── es/checkout.json
    ├── en/checkout.json
    ├── es/orders.json
    └── en/orders.json
```

### 4.2 Archivos a modificar (edición puntual, nunca reemplazo masivo)

| Archivo                                                                                                            | Cambio                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `src/routes/index.tsx`                                                                                             | Registrar rutas nuevas dentro de `<AppLayout/>`, envueltas por `<RequireAuth/>`.         |
| `src/routes/README.md`                                                                                             | Documentar `guards.tsx` y `RequireAuth`.                                                 |
| `src/features/auth/components/LoginForm/LoginForm.tsx`                                                             | Redirigir a `location.state.from` si existe (fallback `/`).                              |
| `src/components/layout/Navbar/ProfileMenu.tsx`                                                                     | Agregar enlace "Mis órdenes" → `/orders`.                                                |
| `src/components/layout/Navbar/MobileMenu.tsx`                                                                      | Agregar enlace "Mis órdenes" → `/orders` (cierra el menú).                               |
| `src/features/cart/components/CartDrawer/CartDrawer.tsx`                                                           | Activar CTA "Finalizar compra" → `/checkout` (quitar `disabled`/`checkout_coming_soon`). |
| `src/pages/CartPage/CartPage.tsx`                                                                                  | Activar CTA "Finalizar compra" → `/checkout`.                                            |
| `src/i18n/i18n.ts`                                                                                                 | Registrar namespaces `checkout` y `orders` en `es` y `en`.                               |
| `src/i18n/locales/es/nav.json` y `en/nav.json`                                                                     | Agregar clave `my_orders`.                                                               |
| `src/i18n/locales/es/cart.json` y `en/cart.json`                                                                   | Eliminar `checkout_coming_soon` (ya no aplica); conservar `checkout`.                    |
| `src/services/products.service.ts`                                                                                 | Importar `toNumber` de `@/utils/toNumber` y re-exportarlo (compatibilidad M7).           |
| `src/types/README.md`, `src/api/README.md`, `src/services/README.md`, `src/utils/README.md`, `src/pages/README.md` | Documentar los archivos nuevos.                                                          |
| `docs/DECISIONS.md`                                                                                                | Agregar sección Milestone 8 (#76–#92).                                                   |

---

## 5. Contratos y tipos

### 5.1 `src/types/order.ts`

```ts
/** Estados posibles de una orden (contrato de yawi_api). */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

/** DTO de una línea de orden (`OrderProduct`) tal como lo devuelve el backend. */
export interface OrderItemDto {
  id: string;
  order_id: string;
  product_id: string;
  business_id: string;
  product_name: string;
  unit_price: number | string; // decimal → string en runtime
  quantity: number;
  subtotal: number | string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO de una orden (`GET /orders`, `GET /orders/:id`, `POST /orders`).
 * Los totales son decimales → `number | string`. `items` viene cargado.
 */
export interface OrderDto {
  id: string;
  customer_id: string;
  delivery_address: string;
  status: OrderStatus;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  items?: OrderItemDto[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Payload de `POST /orders`.
 * El cliente SOLO envía customer_id, delivery_address e items.
 * NO enviar total/unit_price/product_name/subtotal/shipping_fee/business_id/status.
 */
export interface CreateOrderPayload {
  customer_id: string;
  delivery_address: string;
  items: { product_id: string; quantity: number }[];
}

/** Modelo de dominio de una línea de orden (para la UI). */
export interface OrderItem {
  id: string;
  productId: string;
  businessId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/** Modelo de dominio de una orden (para la UI). Totales ya coercionados a number. */
export interface Order {
  id: string;
  customerId: string;
  deliveryAddress: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}
```

### 5.2 `src/utils/toNumber.ts`

```ts
/** Coerciona un `decimal` del backend (`number | string | null`) a un número seguro (0 si no es finito). */
export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}
```

> En `src/services/products.service.ts`: eliminar la definición local de `toNumber`, importarla desde `@/utils/toNumber` y **re-exportarla** (`export { toNumber } from '@/utils/toNumber';`) para que `products.service.test.ts` (M7) siga pasando sin cambios.

### 5.3 `src/api/orders.api.ts`

```ts
import { ApiError, extractErrorMessage } from '@/api/auth.api';
import { buildAuthHeaders } from '@/lib/authToken';
import type { CreateOrderPayload, OrderDto } from '@/types/order';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** `POST /orders` → crea la orden (totales y envío los calcula el backend). */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as OrderDto;
}

/** `GET /orders?customer_id=<id>` → órdenes del cliente autenticado. */
export async function getOrders(customerId: string): Promise<OrderDto[]> {
  const url = `${API_BASE}/orders?customer_id=${encodeURIComponent(customerId)}`;
  const res = await fetch(url, { headers: { ...buildAuthHeaders() } });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as OrderDto[];
}

/** `GET /orders/:id` → detalle de una orden con sus líneas. */
export async function getOrderById(id: string): Promise<OrderDto> {
  const res = await fetch(`${API_BASE}/orders/${id}`, { headers: { ...buildAuthHeaders() } });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as OrderDto;
}
```

### 5.4 `src/api/customers.api.ts`

```ts
import { ApiError, extractErrorMessage } from '@/api/auth.api';
import { buildAuthHeaders } from '@/lib/authToken';
import type { CustomerDto } from '@/api/auth.api';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** `GET /customers/:id` → perfil público del cliente (para prefill de dirección). */
export async function getCustomerById(id: string): Promise<CustomerDto> {
  const res = await fetch(`${API_BASE}/customers/${id}`, { headers: { ...buildAuthHeaders() } });
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as CustomerDto;
}
```

> Reutiliza el tipo `CustomerDto` ya definido en `@/api/auth.api` (import tipo, misma capa `api/`; continúa Decisión #69). Import lateral permitido.

### 5.5 `src/services/order.service.ts`

```ts
import { createOrder, getOrders, getOrderById } from '@/api/orders.api';
import { toNumber } from '@/utils/toNumber';
import type { CartItem } from '@/types/cart';
import type { CreateOrderPayload, Order, OrderDto, OrderItem, OrderItemDto } from '@/types/order';

/** DTO de línea → dominio (coerciona decimales). */
export function mapOrderItemDtoToDomain(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    productId: dto.product_id,
    businessId: dto.business_id,
    productName: dto.product_name,
    unitPrice: toNumber(dto.unit_price),
    quantity: dto.quantity,
    subtotal: toNumber(dto.subtotal),
  };
}

/** DTO de orden → dominio. Normaliza `items` ausente a `[]`. */
export function mapOrderDtoToDomain(dto: OrderDto): Order {
  return {
    id: dto.id,
    customerId: dto.customer_id,
    deliveryAddress: dto.delivery_address,
    status: dto.status,
    subtotal: toNumber(dto.subtotal),
    shippingFee: toNumber(dto.shipping_fee),
    total: toNumber(dto.total),
    items: (dto.items ?? []).map(mapOrderItemDtoToDomain),
    createdAt: dto.createdAt,
  };
}

/**
 * Construye el payload de creación SOLO con los campos permitidos.
 * Toma los `product_id` y `quantity` del carrito.
 */
export function buildOrderPayload(
  customerId: string,
  deliveryAddress: string,
  items: CartItem[],
): CreateOrderPayload {
  return {
    customer_id: customerId,
    delivery_address: deliveryAddress,
    items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
  };
}

export async function fetchOrders(customerId: string): Promise<Order[]> {
  return (await getOrders(customerId)).map(mapOrderDtoToDomain);
}

export async function fetchOrderById(id: string): Promise<Order> {
  return mapOrderDtoToDomain(await getOrderById(id));
}

export async function submitOrder(payload: CreateOrderPayload): Promise<Order> {
  return mapOrderDtoToDomain(await createOrder(payload));
}
```

### 5.6 `src/features/checkout/providers/types.ts`

```ts
export type PaymentProviderId = 'stripe' | 'wompi';

/** Datos de transferencia simulados (placeholders, nunca credenciales reales). */
export interface TransferInstructions {
  beneficiary: string;
  bank: string;
  accountNumber: string;
  reference: string;
}

/** Resultado de iniciar un pago mock. Efímero; no se persiste. */
export interface PaymentSession {
  providerId: PaymentProviderId;
  status: 'pending_transfer';
  instructions: TransferInstructions;
}

export interface CreatePaymentSessionInput {
  orderId: string;
  amount: number;
}

/**
 * Contrato de proveedor de pago.
 * En esta iteración ambas implementaciones son MOCK (transferencia).
 * Para la integración real futura, basta con reemplazar la implementación
 * manteniendo esta interfaz (sin tocar componentes ni páginas).
 */
export interface PaymentProvider {
  id: PaymentProviderId;
  /** Clave i18n del nombre visible (p. ej. `payment.stripe`). */
  labelKey: string;
  createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession>;
}
```

### 5.7 `src/features/checkout/providers/stripeProvider.ts` (y `wompiProvider.ts`)

```ts
import type { PaymentProvider, PaymentSession } from './types';

/** ⚠️ MOCK de Stripe: NO hay red, tarjetas, tokens ni webhooks. Simula transferencia. */
export const stripeProvider: PaymentProvider = {
  id: 'stripe',
  labelKey: 'payment.stripe',
  async createPaymentSession({ orderId }): Promise<PaymentSession> {
    return {
      providerId: 'stripe',
      status: 'pending_transfer',
      instructions: {
        beneficiary: 'Yawi Marketplace',
        bank: 'Banco Mock Stripe',
        accountNumber: '0000-0000-0000-0001',
        reference: `STRIPE-${orderId.slice(0, 8).toUpperCase()}`,
      },
    };
  },
};
```

`wompiProvider.ts` idéntico con `id: 'wompi'`, `labelKey: 'payment.wompi'`, banco/cuenta/referencia propios (`WOMPI-...`).

### 5.8 `src/features/checkout/providers/paymentProviders.ts`

```ts
import { stripeProvider } from './stripeProvider';
import { wompiProvider } from './wompiProvider';
import type { PaymentProvider, PaymentProviderId } from './types';

export const PAYMENT_PROVIDERS: PaymentProvider[] = [stripeProvider, wompiProvider];

/** Devuelve el proveedor por id. Lanza si el id no existe (contrato defensivo). */
export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  const provider = PAYMENT_PROVIDERS.find((p) => p.id === id);
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}
```

### 5.9 `src/features/checkout/store/checkoutStore.ts`

```ts
import { create } from 'zustand';
import type { PaymentProviderId, PaymentSession } from '../providers/types';

export type CheckoutStep = 'review' | 'confirmation';

export interface CheckoutState {
  providerId: PaymentProviderId;
  step: CheckoutStep;
  session: PaymentSession | null;
  setProvider: (id: PaymentProviderId) => void;
  setStep: (step: CheckoutStep) => void;
  setSession: (session: PaymentSession | null) => void;
  reset: () => void;
}

/** Estado efímero del checkout. SIN `persist`: no sobrevive recargas (Decisión #84). */
export const useCheckoutStore = create<CheckoutState>()((set) => ({
  providerId: 'stripe',
  step: 'review',
  session: null,
  setProvider: (providerId) => set({ providerId }),
  setStep: (step) => set({ step }),
  setSession: (session) => set({ session }),
  reset: () => set({ providerId: 'stripe', step: 'review', session: null }),
}));
```

---

## 6. Pasos de implementación (orden estricto, TDD)

> Completar y verificar `npx tsc --noEmit` antes de avanzar. En pasos con test, escribir el test **primero** y verlo fallar.

### Paso 1 — `utils/toNumber` (TDD) y refactor de `products.service`

1. `src/utils/toNumber.test.ts` (primero): `120 → 120`; `"12.50" → 12.5`; `"abc" → 0`; `null → 0`; `undefined → 0`; `NaN → 0`; `Infinity → 0`.
2. `src/utils/toNumber.ts`.
3. En `products.service.ts`: quitar la función local `toNumber` y añadir `import { toNumber } from '@/utils/toNumber';` + `export { toNumber } from '@/utils/toNumber';`.
4. Verificar: `npx vitest run src/services/products.service.test.ts src/utils/toNumber.test.ts`.

### Paso 2 — Tipo `types/order.ts`

Crear `src/types/order.ts` con el contenido de 5.1.

### Paso 3 — Adaptador `api/orders.api.ts` (TDD)

1. `src/api/orders.api.test.ts` (primero) con `vi.stubGlobal('fetch', vi.fn())` y `vi.unstubAllGlobals()` en `afterEach`:
   - `createOrder` hace `POST ${API_BASE}/orders` con `Content-Type` y body igual al payload; resuelve `ok` y devuelve el DTO.
   - `createOrder` con 400 y `{ message: 'items no puede estar vacío' }` → rechaza `ApiError` con ese `message` y `status`.
   - `getOrders('abc')` llama `GET ${API_BASE}/orders?customer_id=abc` y devuelve el array.
   - `getOrderById('x')` llama `GET ${API_BASE}/orders/x`; con 404 rechaza `ApiError`.
2. `src/api/orders.api.ts` (5.3).

Ejecutar: `npx vitest run src/api/orders.api.test.ts`.

### Paso 4 — Adaptador `api/customers.api.ts` (TDD)

1. `src/api/customers.api.test.ts` (primero): `getCustomerById('abc')` llama `GET ${API_BASE}/customers/abc` y devuelve `CustomerDto`; con 404 rechaza `ApiError`.
2. `src/api/customers.api.ts` (5.4).

### Paso 5 — Servicio `services/order.service.ts` (TDD)

1. `src/services/order.service.test.ts` (primero), mockeando `@/api/orders.api` con `vi.mock`:
   - `buildOrderPayload`: mapea `CartItem[]` a `{ product_id, quantity }`, **no** incluye precios ni business_id.
   - `mapOrderItemDtoToDomain`: coerciona `unit_price`/`subtotal` (`"24.00" → 24`), mapea snake→camel.
   - `mapOrderDtoToDomain`: coerciona `subtotal/shipping_fee/total`; `items` ausente → `[]`.
   - `fetchOrders` mapea el array; `fetchOrderById` mapea uno; `submitOrder` mapea la respuesta.
2. `src/services/order.service.ts` (5.5).

Ejecutar: `npx vitest run src/services/order.service.test.ts`.

### Paso 6 — Proveedores de pago mock (TDD)

1. `src/features/checkout/providers/stripeProvider.test.ts` (primero): `createPaymentSession({ orderId: 'abcd1234-...', amount: 39 })` devuelve `{ providerId: 'stripe', status: 'pending_transfer' }` y `instructions.reference` contiene el prefijo del `orderId` en mayúsculas.
2. `src/features/checkout/providers/stripeProvider.ts` (5.7).
3. Repetir para `wompiProvider` (`id: 'wompi'`, referencia `WOMPI-...`).
4. `src/features/checkout/providers/paymentProviders.test.ts` (primero): `PAYMENT_PROVIDERS` tiene 2 elementos con ids `stripe` y `wompi`; `getPaymentProvider('wompi')` devuelve el adaptador correcto; un id inválido (cast) lanza.
5. `src/features/checkout/providers/paymentProviders.ts` (5.8).

> Los adaptadores NO usan `fetch`. Son puros y testeables en node.

### Paso 7 — Store `checkoutStore.ts` (TDD)

1. `src/features/checkout/store/checkoutStore.test.ts` (primero): estado inicial `{ providerId: 'stripe', step: 'review', session: null }`; `setProvider('wompi')`; `setStep('confirmation')`; `setSession({...})`; `reset()` vuelve al inicial. Resetear con `useCheckoutStore.setState({ providerId: 'stripe', step: 'review', session: null })` en `beforeEach`.
2. `src/features/checkout/store/checkoutStore.ts` (5.9).

### Paso 8 — Guarda de ruta `routes/guards.tsx`

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Protege rutas privadas. Si no hay sesión, redirige a /login conservando el destino. */
export function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
```

> No hay tests de RTL para esto; la lógica de sesión ya está cubierta por `authStore.test.ts`. Documentar en `routes/README.md`.

### Paso 9 — Registrar rutas y homenajear `from` en LoginForm

En `src/routes/index.tsx`, dentro de `<Route element={<AppLayout />}>`:

```tsx
const CheckoutPage = lazy(() => import('../pages/CheckoutPage/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage/OrderDetailPage'));
```

```tsx
<Route element={<RequireAuth />}>
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/orders/:id" element={<OrderDetailPage />} />
</Route>
```

En `LoginForm.tsx`: leer `const location = useLocation();` y en el éxito:

```ts
const from = (location.state as { from?: string } | null)?.from ?? '/';
navigate(from, { replace: true });
```

> Fallback `/` mantiene el comportamiento actual (Decisión #46). `LoginForm.test.tsx` debe seguir pasando (sin `state` → `/`).

### Paso 10 — i18n

Crear `src/i18n/locales/es/checkout.json`, `en/checkout.json`, `es/orders.json`, `en/orders.json` (misma jerarquía de claves en ES/EN). Registrar en `src/i18n/i18n.ts` (`esCheckout`, `enCheckout`, `esOrders`, `enOrders` → claves `checkout`, `orders`). Agregar `my_orders` en `nav.json`. Quitar `checkout_coming_soon` de `cart.json` (ya no se usa).

**`es/checkout.json` (referencia; `en` con mismas claves):**

```json
{
  "title": "Finalizar compra",
  "subtitle": "Revisa tu pedido antes de confirmar la compra.",
  "back_to_cart": "Volver al carrito",
  "delivery": {
    "title": "Dirección de entrega",
    "label": "Dirección de entrega",
    "placeholder": "Calle, número, ciudad, país",
    "required": "La dirección de entrega es obligatoria."
  },
  "items": { "title": "Tu pedido" },
  "payment": {
    "title": "Método de pago",
    "subtitle": "Elige cómo deseas pagar (simulación por transferencia).",
    "stripe": "Stripe",
    "wompi": "Wompi",
    "transfer_note": "Pago simulado por transferencia bancaria",
    "selected": "Seleccionado"
  },
  "summary": {
    "subtotal": "Subtotal",
    "shipping": "Envío",
    "shipping_note": "El envío es de $10.00. El total final se confirma al generar la orden.",
    "total": "Total estimado"
  },
  "submit": "Confirmar compra",
  "submitting": "Procesando...",
  "empty_cart": {
    "title": "No hay productos para pagar",
    "message": "Tu carrito está vacío.",
    "cta": "Explorar productos"
  },
  "error": { "generic": "No pudimos completar tu compra. Intenta de nuevo." },
  "confirmation": {
    "title": "¡Orden creada!",
    "message": "Tu orden fue registrada. Completa el pago por transferencia con los datos de abajo.",
    "order_id": "Número de orden",
    "total": "Total",
    "instructions_title": "Datos para la transferencia",
    "beneficiary": "Beneficiario",
    "bank": "Banco",
    "account": "Cuenta",
    "reference": "Referencia",
    "view_order": "Ver mi orden",
    "go_to_orders": "Ir a mis órdenes"
  }
}
```

**`es/orders.json` (referencia; `en` con mismas claves):**

```json
{
  "title": "Mis órdenes",
  "subtitle": "Historial de tus compras en Yawi.",
  "list": {
    "loading": "Cargando órdenes...",
    "error": "No pudimos cargar tus órdenes.",
    "retry": "Reintentar",
    "empty_title": "Aún no tienes órdenes",
    "empty_message": "Cuando realices una compra aparecerá aquí.",
    "empty_cta": "Explorar productos"
  },
  "card": {
    "order": "Orden",
    "date": "Fecha",
    "total": "Total",
    "view": "Ver detalle",
    "items_count": "{{count}} artículos"
  },
  "detail": {
    "title": "Detalle de la orden",
    "order_id": "Número de orden",
    "date": "Fecha de creación",
    "status": "Estado",
    "delivery_address": "Dirección de entrega",
    "items_title": "Productos",
    "quantity": "Cantidad",
    "unit_price": "Precio unitario",
    "subtotal": "Subtotal",
    "shipping": "Envío",
    "total": "Total",
    "back": "Volver a mis órdenes",
    "loading": "Cargando orden...",
    "error": "No pudimos cargar la orden.",
    "not_found": "Orden no encontrada."
  },
  "status": {
    "pending": "Pendiente",
    "confirmed": "Confirmada",
    "preparing": "En preparación",
    "delivered": "Entregada",
    "cancelled": "Cancelada"
  }
}
```

> Evitar claves plurales (`_one`/`_plural`); usar interpolación `{{count}}`.

### Paso 11 — Feature `orders`

1. `hooks/useOrders.ts`:
   ```ts
   export function useOrders(customerId: string) {
     return useQuery({
       queryKey: ['orders', customerId],
       queryFn: () => fetchOrders(customerId),
       enabled: Boolean(customerId),
     });
   }
   ```
2. `hooks/useOrderDetail.ts`: análogo con `queryKey: ['order', id]` y `fetchOrderById`.
3. Componentes (presentacionales, texto vía `useTranslation('orders')`, sin imports de `@/api`/`@/lib`):
   - `OrderStatusBadge`: recibe `status`; usa `t('status.'+status)` y un mapa de clases con **tokens** (p. ej. `pending → bg-peach-accent/20 text-primary-navy`, `delivered → bg-primary-indigo text-white`, `cancelled → bg-muted-text/20 text-muted-text`, etc.). Sin hex.
   - `OrderCard`: id corto (`id.slice(0,8)`), fecha (`new Date(createdAt).toLocaleDateString(i18n.language)`), badge, total (`formatCurrency`), `items.length`, CTA "Ver detalle" (`Link` a `/orders/:id`).
   - `OrderItemsList`: filas con `productName`, `quantity` × `unitPrice`, `subtotal` (`formatCurrency`).
   - `OrderTotals`: subtotal, envío, total (`formatCurrency`).
   - `OrdersList`: maneja loading (`Skeleton`), error (mensaje + reintentar), empty (`OrdersEmptyState`) y lista.
   - `OrdersEmptyState`: ícono + textos + CTA a `/products`.
4. `index.ts` (API pública) y `README.md`.

### Paso 12 — Feature `checkout`

1. `hooks/useCustomerProfile.ts`: `useQuery(['customer', id], () => fetchCustomerById(id), { enabled: Boolean(id) })` sobre `services` (crear un pequeño wrapper `fetchCustomerProfile` en `services/order.service.ts` **no**; en su lugar, llamar `getCustomerById` desde un servicio. **Regla de capas:** los hooks NO pueden importar de `api/`. Por eso agregar `fetchCustomerProfile(id)` a `services/customer.service.ts` (nuevo, con test) que envuelva `getCustomerById` y devuelva `{ address, country }`.)

   > Ajuste a la estructura: agregar `src/services/customer.service.ts` + `customer.service.test.ts`.

2. `hooks/useCheckout.ts` (orquesta; usa `useCart`, `authStore`, `checkoutStore`, `services/order.service` y `providers`):
   ```ts
   const mutation = useMutation({
     mutationFn: async (deliveryAddress: string) => {
       const order = await submitOrder(buildOrderPayload(user!.id, deliveryAddress, items));
       const session = await getPaymentProvider(providerId).createPaymentSession({
         orderId: order.id,
         amount: order.total,
       });
       return { order, session };
     },
     onSuccess: ({ order, session }) => {
       setSession(session);
       setOrderId(order.id); // guardar id para la confirmación
       clear(); // vaciar carrito (Decisión #88)
       setStep('confirmation');
     },
   });
   ```
   > Añadir `orderId: string | null` y `setOrderId` al `checkoutStore` (actualizar 5.9 y su test en consecuencia). Alternativa: guardar el `Order` completo en el store. Preferir guardar `{ orderId, total }` (lo mínimo para la confirmación).
3. `components/`:
   - `CheckoutSummary`: lista de ítems del carrito (nombre, cantidad, precio) + subtotal (`formatCurrency`) + nota de envío i18n. No recalcula el total definitivo (autoridad = backend).
   - `DeliveryAddressForm`: `Input` requerido, controlado; prefill desde `useCustomerProfile`; valida no vacío (usa el mensaje `delivery.required`); `onSubmit(address)`.
   - `PaymentMethodSelector`: tarjetas seleccionables para `PAYMENT_PROVIDERS` (muestra `t(provider.labelKey)`), resalta `providerId`, llama `setProvider`, y muestra `payment.transfer_note`.
   - `CheckoutConfirmation`: muestra `order_id`, `total` (del backend), instrucciones (`beneficiary/bank/account/reference`) y CTAs `view_order` → `/orders/:id` y `go_to_orders` → `/orders`.
   - `CheckoutEmptyCart`: si el carrito está vacío en el paso `review`.
4. `index.ts` y `README.md`.

### Paso 13 — Páginas

- `pages/CheckoutPage/CheckoutPage.tsx`: composición. Si `step === 'confirmation'` → `CheckoutConfirmation`; si carrito vacío → `CheckoutEmptyCart`; si no → `CheckoutSummary` + `DeliveryAddressForm` + `PaymentMethodSelector` + botón `submit` (usa `mutation.isPending` para `submitting`). `useErrorToast(mutation.isError, mutation.error, t('error.generic'))`.
- `pages/OrdersPage/OrdersPage.tsx`: `useAuthStore().user`, `useOrders(user?.id ?? '')`, `useErrorToast`, `OrdersList`. Título i18n.
- `pages/OrderDetailPage/OrderDetailPage.tsx`: `useParams().id`, `useOrderDetail(id)`, `useErrorToast`; loading (`Skeleton`), error/`not_found` con enlace "Volver a mis órdenes", éxito → cabecera + `OrderStatusBadge` + `OrderItemsList` + `OrderTotals` (subtotal/envío/total) + dirección + fecha.
- Cada `index.ts`: `export { default as XPage } from './XPage';`

`toLocaleDateString` recibe `i18n.language` para ES/EN.

### Paso 14 — Navbar, MobileMenu, CartDrawer y CartPage

- `ProfileMenu.tsx`: agregar un `Link` a `/orders` (`t('my_orders', { ns: 'nav' })`) arriba del botón de logout.
- `MobileMenu.tsx`: agregar `Link` a `/orders` (con `onClose`) junto al de "Ver carrito".
- `CartDrawer.tsx`: reemplazar el CTA deshabilitado por `Button` con `onClick={() => { closeCart(); navigate('/checkout'); }}` (usar `Link` o `useNavigate`). Quitar `checkout_coming_soon`.
- `CartPage.tsx`: cambiar el CTA deshabilitado por `Link` a `/checkout` / `Button`.

### Paso 15 — READMEs y DECISIONS (NFR)

- Crear `src/features/checkout/README.md` y `src/features/orders/README.md` (propósito, rutas, hooks, proveedores, contrato, cómo sustituir los mocks).
- Actualizar los READMEs de la tabla 4.2.
- Agregar la sección **Milestone 8** a `docs/DECISIONS.md` con la tabla de la sección 3.

### Paso 16 — Verificación final

```bash
npx tsc --noEmit
npx vitest run
npm run format:check   # si falla → npm run format
npm run dev
```

Checklist manual (sección 11).

---

## 7. Estrategia de pruebas (TDD)

| Capa                | Herramienta                 | Archivo                                                               | Qué cubre                                                                |
| ------------------- | --------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Util                | Vitest (node)               | `utils/toNumber.test.ts`                                              | Coerción decimal (string/number/null/NaN).                               |
| Adaptador `api/`    | Vitest + `stubGlobal fetch` | `api/orders.api.test.ts`, `api/customers.api.test.ts`                 | URL/método/body, `ApiError` con mensaje del backend, 404.                |
| Servicio            | Vitest + `vi.mock`          | `services/order.service.test.ts`, `services/customer.service.test.ts` | Mapping DTO→dominio, coerción, `buildOrderPayload`.                      |
| Proveedores de pago | Vitest (node)               | `features/checkout/providers/*.test.ts`                               | Contrato `PaymentProvider`, referencias, registry.                       |
| Store de checkout   | Vitest (node)               | `features/checkout/store/checkoutStore.test.ts`                       | Acciones y reset; sin `persist`.                                         |
| Regresión           | Vitest                      | Suites de M6/M7                                                       | Siguen verdes (incluido `products.service` con `toNumber` re-exportado). |

**Reglas**:

- Test primero, implementación después.
- Sin RTL/jsdom: los componentes y hooks de React NO se testean directamente; la lógica se extrae a `services/`, `utils` y `providers` (puras).
- Consultar por rol/texto cuando aplique; nunca por clase CSS.
- `order.service.test.ts` mockea `@/api/orders.api` (sin red real). `orders.api.test.ts` usa `stubGlobal('fetch')` y restaura con `unstubAllGlobals()`.

---

## 8. Reglas de diseño (resumen de `DESIGN.md`)

| Elemento    | Regla                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| Colores     | Solo tokens Tailwind del `@theme` / `var(--color-*)`. **Cero hex.**        |
| Cards       | `rounded-card`, `bg-surface`, `border-border`, `shadow-card`, hover.       |
| Secciones   | `py-16 md:py-24`; `SectionContainer` cuando aplique.                       |
| CTA         | Máximo dos acciones compitiendo (primaria navy, secundaria outline).       |
| Estados     | Badge de estado con tokens (peach para pending/positivo; sin verde nuevo). |
| Responsive  | Mobile First: 1 col (móvil) → 2 (tablet) → 3 (desktop) en checkout.        |
| Animaciones | `transition-all duration-200/300`, suaves.                                 |

> M8 **no introduce una paleta nueva**: reutiliza `Button`, `Input`, `Badge`, `Card`, `Skeleton`, `SectionContainer` y `formatCurrency`. La galería de colores sigue centralizada en `src/index.css` (`@theme`).

---

## 9. Documentación (NFR)

| Documento                         | Acción                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `src/features/checkout/README.md` | Crear: propósito, ruta, flujo, proveedores mock, contrato, cómo integrar real. |
| `src/features/orders/README.md`   | Crear: propósito, rutas, hooks, entidades Order/OrderItem, estados.            |
| `src/routes/README.md`            | Actualizar: `guards.tsx` / `RequireAuth`.                                      |
| `src/types/README.md`             | Actualizar: `order.ts`.                                                        |
| `src/api/README.md`               | Actualizar: `orders.api.ts`, `customers.api.ts`.                               |
| `src/services/README.md`          | Actualizar: `order.service.ts`, `customer.service.ts`, `toNumber` compartido.  |
| `src/utils/README.md`             | Actualizar: `toNumber`.                                                        |
| `src/pages/README.md`             | Agregar `CheckoutPage`, `OrdersPage`, `OrderDetailPage`.                       |
| `docs/DECISIONS.md`               | Agregar Milestone 8 (#76–#92).                                                 |

> Cada carpeta nueva (`features/checkout`, `features/checkout/providers`, `features/checkout/store`, `features/orders`) debe quedar documentada por el README del feature (evitar leer los archivos innecesariamente).

---

## 10. Riesgos y notas para el agente

1. **Decimales como string.** `subtotal`, `shipping_fee`, `total`, `unit_price` llegan como **string** desde Postgres. Coercionar SIEMPRE con `toNumber` antes de formatear/subtotalizar. No sumar strings.
2. **Payload restringido.** `POST /orders` rechaza campos extra (`business_id`, `unit_price`, `status`, `total`…). `buildOrderPayload` debe enviar SOLO `customer_id`, `delivery_address`, `items[{product_id, quantity}]`.
3. **`customer_id` = `authStore.user.id`.** No re-llamar `/auth/me`. Si `user` es `null` (no debería, por el guard), no ejecutar la mutación.
4. **No tocar `yawi_api`.** Solo lectura.
5. **No usar** `PATCH /orders/:id/status`, `DELETE /orders/:id` ni `recover` (fuera de alcance; el usuario no modifica estados).
6. **Capas.** Hooks/componentes NO importan `@/api` ni `@/lib`. Los `providers/` pertenecen a `features/checkout` y NO hacen `fetch`.
7. **Import lateral en `api/`:** `orders.api.ts` y `customers.api.ts` importan `ApiError`/`extractErrorMessage` de `auth.api.ts` (misma capa, permitido — Decisión #69/#38).
8. **`products.service.ts` re-exporta `toNumber`** para que el test de M7 siga verde. No borrar la exportación.
9. **Guards:** `RequireAuth` debe envolver las rutas dentro de `AppLayout` (para conservar Navbar/Footer). No crear un layout nuevo.
10. **`localStorage` en tests:** `checkoutStore` NO usa `persist`, así que no hay I/O; se prueba en memoria.
11. Si algo contradice `ARCHITECTURE.md`, pausar y consultar.

---

## 11. Checklist de verificación manual

- [ ] Sin sesión, ir a `/checkout` redirige a `/login`; tras loguearse vuelve a `/checkout`.
- [ ] Sin sesión, ir a `/orders` y `/orders/:id` redirige a `/login`.
- [ ] Con carrito: `/checkout` muestra el resumen, la dirección (prellenada si la API responde) y las opciones **Stripe** y **Wompi**.
- [ ] El resumen del checkout indica explícitamente el **cargo de envío ($10.00)** y un **total estimado** (subtotal + envío).
- [ ] Seleccionar Wompi/Stripe cambia la selección visual (sin errores).
- [ ] Confirmar con dirección vacía → error i18n, no crea orden.
- [ ] Confirmar válido → se crea la orden, se vacía el carrito y aparece la confirmación con número de orden, total e instrucciones de transferencia.
- [ ] "Ver mi orden" abre `/orders/:id` con líneas, cantidades, totales (subtotal + envío $10 = total) y estado `Pendiente`.
- [ ] `/orders` lista SOLO las órdenes del usuario autenticado (`customer_id` correcto).
- [ ] El detalle NO ofrece cancelar ni cambiar estado.
- [ ] Error de backend (caído) → toast con el mensaje del backend + estado de error con reintentar.
- [ ] El CTA "Finalizar compra" del `CartDrawer` y de `CartPage` navega a `/checkout`.
- [ ] "Mis órdenes" aparece en `ProfileMenu` (escritorio) y `MobileMenu`.
- [ ] ES/EN cambia todos los textos nuevos; no hay claves faltantes.
- [ ] Ningún hex en componentes; todo con tokens.
- [ ] `npx tsc --noEmit`, `npx vitest run` y `npm run format:check` en verde.

---

_Plan listo para revisión y aprobación antes de implementar._
