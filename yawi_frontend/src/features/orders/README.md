# Feature `orders`

## Propósito

Listado y detalle (solo lectura) de las órdenes del **cliente autenticado**. Rutas: `/orders` y `/orders/:id`, ambas protegidas por `RequireAuth`.

## Flujo

- `OrdersPage` → `useOrders(user.id)` → `GET /orders?customer_id=<id>` (solo las órdenes propias).
- `OrderDetailPage` → `useOrderDetail(id)` → `GET /orders/:id`.
- El usuario **no** puede cancelar ni cambiar el estado de una orden (no se usan `PATCH /orders/:id/status`, `DELETE` ni `recover`).

## Modelo (dominio)

- `Order`: `id`, `customerId`, `deliveryAddress`, `status`, `subtotal`, `shippingFee`, `total`, `items`, `createdAt`.
- `OrderItem`: `id`, `productId`, `businessId`, `productName`, `unitPrice`, `quantity`, `subtotal`.
- Los decimales del backend (string) se coercionan con `@/utils/toNumber` en `services/order.service.ts`.

## Estados (`OrderStatus`)

`pending | confirmed | preparing | delivered | cancelled` — etiquetas en el namespace i18n `orders` (`status.*`) y colores por token en `OrderStatusBadge`.

## Estructura

```text
features/orders/
  hooks/         # useOrders, useOrderDetail (TanStack Query)
  components/    # OrdersList, OrderCard, OrderStatusBadge, OrderItemsList,
                 # OrderTotals, OrdersEmptyState
  types.ts       # re-export de ./types/order
  index.ts       # API pública
```

## Dependencias

- Importa de: `@/services/order.service`, `@/utils/formatCurrency`, `@/components/ui`, `@/types/order`.
- Importado por: `pages/OrdersPage`, `pages/OrderDetailPage`, `routes/index.tsx`.
- Restricción: hoy el aislamiento por propietario es **frontend** (filtro `customer_id` + guarda). Cuando `yawi_api` agregue guards, no cambia nada aquí (ya se envía el token).
