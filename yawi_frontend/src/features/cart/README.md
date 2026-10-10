# Feature: Cart

## Propósito

Carrito de compra **frontend** de Yawi: agregar, incrementar, reducir, eliminar, vaciar y ver subtotal.

Se expone de dos formas:

- **Drawer** (`CartDrawer`): panel lateral global montado en `App.tsx`, abierto desde el Navbar.
- **Página** `/cart`: resumen amplio (items + resumen sticky en escritorio).

## Estructura

- `hooks/useCart.ts` — capa que desacopla la UI del store global (`@/store/cartStore`) y expone items, totales y acciones. Es el "contexto/capa equivalente" del requerimiento.
- `components/` — `CartDrawer`, `CartItemRow`, `CartSummary`, `CartEmptyState`.
- `index.ts` — API pública (`useCart` + componentes).

## Estado y persistencia

- Store global: `src/store/cartStore.ts` (Zustand). Estado: `items`, `isOpen`.
- Persistencia local en `localStorage` bajo la clave `yawi-cart` (solo `items`; `isOpen` es efímero).
- Lógica pura (totales, add/inc/dec/remove): `src/services/cart.service.ts` (testeada en `cart.service.test.ts`).

## Fuera de alcance

Checkout, pagos, creación de órdenes y persistencia **remota** del carrito. El botón "Finalizar compra" se muestra deshabilitado.

## Reglas importantes

- Los componentes de la feature usan `useCart()`; no acceden a `@/store` ni `@/services` directamente.
- El Navbar (layout) sí lee el store global (`selectTotalItems`, `openCart`), igual que con `authStore`.
- Totales y precios se formatean con `@/utils/formatCurrency`; imágenes con `@/utils/resolveImageUrl`.
