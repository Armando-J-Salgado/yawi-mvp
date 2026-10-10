# Global State Store (`src/store`)

## Propósito

Centraliza los stores de estado global de la aplicación web utilizando Zustand para una gestión ligera, desacoplada y con mínimo boilerplate.

## Contenido

- `authStore.ts`: Store global del estado de sesión del usuario. Estado: `isAuthenticated`, `user`, `token`. Acciones: `setAuthenticated`, `setUser`, `login`, `logout`, `restoreSession`.
- `cartStore.ts`: Store global del carrito. Estado: `items`, `isOpen`. Acciones: `addToCart`, `increment`, `decrement`, `remove`, `clear`, `openCart`, `closeCart`, `toggleCart`. Selectores: `selectTotalItems`, `selectSubtotal`. Persistencia local (`localStorage`, clave `yawi-cart`, solo `items`). La lógica pura vive en `services/cart.service.ts`.

## Sesión y persistencia

- El store usa el middleware `persist` de Zustand con `localStorage` bajo la clave `yawi-auth`
  (`partialize` persiste `isAuthenticated`, `user` y `token`).
- `login(email, password)` llama a `services/auth.service.ts` y, si hay éxito, guarda el JWT
  y lo inyecta en `lib/authToken` (`setAuthToken`) para autorizar futuras peticiones.
- `restoreSession()` valida el token persistido con `GET /auth/me` al montar la app
  (vía `features/auth/hooks/useSessionBootstrap`); si es inválido, limpia la sesión.
- `logout()` limpia estado y helper de token.

## Reglas

- **Zustand como estándar**: Se utiliza Zustand en lugar de Redux Toolkit para simplificar el flujo y optimizar tiempos en el MVP (Decisión #1 en `DECISIONS.md`).
- **Stores modulares**: Cada dominio de estado global debe tener su propio archivo (ej. `authStore.ts`, `cartStore.ts` en hitos futuros).
- **Acceso mediante hooks**: Consumir los estados en componentes usando los custom hooks exportados (`useAuthStore`).

## Dependencias

- Importa de: `zustand`.
- Importado por: `components/layout/Navbar/`, `features/cart/` y futuros componentes con estado autenticado o de carrito.
