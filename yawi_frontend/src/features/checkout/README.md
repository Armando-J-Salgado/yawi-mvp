# Feature `checkout`

## Propósito

Implementa el flujo de finalización de compra: resumen del pedido, dirección de entrega, selección de método de pago (Stripe/Wompi **mock**) y creación de la orden asociada al cliente autenticado. Ruta: `/checkout` (protegida por `RequireAuth`).

## Flujo

1. `CheckoutPage` toma el carrito (`useCart`) y el usuario (`authStore`).
2. `useCheckout` construye el payload con `buildOrderPayload` y crea la orden (`submitOrder` → `POST /orders`).
3. Inmediatamente crea una `PaymentSession` mock con el proveedor seleccionado.
4. En éxito: guarda `orderId`/`orderTotal`/`session`, **vacía el carrito** y pasa al paso `confirmation`.
5. `CheckoutConfirmation` muestra el id de orden, el total y las instrucciones de transferencia.

## Estructura

```text
features/checkout/
  providers/     # adaptadores de pago (mock) + registry
  store/         # checkoutStore (Zustand SIN persist)
  hooks/         # useCheckout (orquesta), useCustomerProfile (prefill)
  components/    # CheckoutSummary, DeliveryAddressForm, PaymentMethodSelector,
                 # CheckoutConfirmation, CheckoutEmptyCart
  checkoutTotals.ts  # DEFAULT_SHIPPING_FEE ($10) + estimateOrderTotal
  index.ts       # API pública
```

## Cómo integrar pagos reales (futuro)

- Reemplazar el cuerpo de `providers/stripeProvider.ts` / `providers/wompiProvider.ts` por la integración real, **manteniendo la interfaz `PaymentProvider`** (`createPaymentSession`). No se tocan componentes, páginas ni stores.
- La selección de proveedor hoy es efímera (no se persiste). Persistirla requerirá un campo de pago en `Order` (hoy no existe; no tocar `yawi_api` sin permiso).

## Envío (cargo por envío)

- El backend aplica `shipping_fee = $10.00` fijo (MVP). El checkout lo **muestra explícitamente** en `CheckoutSummary` (usa `DEFAULT_SHIPPING_FEE` y `estimateOrderTotal`).
- El checkout solo muestra un **total estimado**. El total autoritativo lo devuelve el backend al crear la orden (se muestra en `CheckoutConfirmation`).

## Dependencias

- Importa de: `@/services/order.service`, `@/services/customer.service`, `@/features/cart` (API pública), `@/store/authStore`, `@/components/ui`, `@/utils/*`.
- Importado por: `pages/CheckoutPage`, `routes/index.tsx`.
- Capas prohibidas: `providers/`, `hooks/` y `components/` NO importan de `@/api` ni `@/lib`.
