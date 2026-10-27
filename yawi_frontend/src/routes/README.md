# Application Routes (`src/routes`)

## Propósito

Define la configuración central de enrutamiento y jerarquía de vistas de la aplicación Yawi mediante `react-router-dom`.

## Contenido

- `index.tsx`: Componente `AppRoutes` que envuelve las páginas en `AppLayout` y mapea rutas URL a vistas (`/` redirige a `/artesanias`, `/artesanias` landing principal, `/artesanias/:slug` categoría, `/buscar` resultados de búsqueda con parámetro `?q=`, `/cultura-yawi` landing cultural, `/products` catálogo fallback).
- `guards.tsx`: `RequireAuth`, guarda de rutas privadas. Envuelve `/checkout`, `/orders` y `/orders/:id`; si no hay sesión redirige a `/login` con `state.from` para volver tras autenticarse.

## Reglas

- **Envoltorio de Layout**: Las rutas públicas y protegidas se organizan alrededor del `AppLayout` correspondiente.
- **Rutas centralizadas**: Toda nueva página de la aplicación debe registrarse en `index.tsx`.
- **Rutas privadas**: se agrupan bajo `<Route element={<RequireAuth />}>` dentro de `AppLayout` (así conservan Navbar/Footer).

## Dependencias

- Importa de: `react-router-dom`, `components/layout/`, `pages/`.
- Importado por: `App.tsx`.
