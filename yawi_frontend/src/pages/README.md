# Pages (`src/pages`)

## Propósito

Representa las vistas de nivel superior asociadas a rutas de la aplicación web. Actúan como integradores entre los features, layout y parámetros de URL.

## Contenido

- `LandingPage/`: Página de inicio que orquesta y ensambla las 9 secciones del feature de landing (usa `AppLayout`).
- `SellerLandingPage/`: Página de vendedores (`/vender`) que orquesta y ensambla las 9 secciones del feature seller (usa `AppLayout`).
- `LoginPage/`: Página de inicio de sesión (`/login`) que orquesta el feature `auth` (usa `AuthLayout`).
- `RegisterPage/`: Página de registro de clientes (`/register`) que orquesta el feature `auth` en 2 pasos (usa `AuthLayout`).
- `ArtisansPage/`: Página de exploración de artesanos (`/artisans`) que orquesta el feature `artisans` (usa `AppLayout`).
- `BusinessDetailPage/`: Página de detalle de negocio/artesano (`/artisans/:id`) que orquesta el feature `artisans` (usa `AppLayout`).
- `CatalogPage/`: Página de catálogo de productos (`/products`) que orquesta el feature `catalog` (usa `AppLayout`).
- `ProductDetailPage/`: Página de detalle de producto (`/products/:id`) que orquesta el feature `catalog` (usa `AppLayout`).
- `CartPage/`: Página del carrito (`/cart`) que orquesta el feature `cart` (usa `AppLayout`).
- `README.md`: Este archivo descriptivo.

## Reglas

- **Composición, no implementación**: Las páginas deben limitarse a orquestar features y componentes. No deben contener estilos complejos ad-hoc ni lógica de negocio interna.
- **Rutas relativas en M1, M2 y M3**: Los imports se realizan mediante rutas relativas hasta la configuración de alias.
- **Regla de capas**: Las páginas pueden importar de `features/*`, `components/*`, `store/`, `hooks/`. Ninguna capa inferior puede importar de `pages/`.

## Dependencias

- Importa de: `features/landing/`, `features/seller/`, `features/auth/`, `features/artisans/`, `features/catalog/`, `features/cart/`.
- Importado por: `routes/index.tsx`.
