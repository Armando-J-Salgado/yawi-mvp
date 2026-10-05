# Application Routes (`src/routes`)

## Propósito
Define la configuración central de enrutamiento y jerarquía de vistas de la aplicación Yawi mediante `react-router-dom`.

## Contenido
- `index.tsx`: Componente `AppRoutes` que envuelve las páginas en `AppLayout` y mapea rutas URL a vistas (`/` -> `LandingPage`).

## Reglas
- **Envoltorio de Layout**: Las rutas públicas y protegidas se organizan alrededor del `AppLayout` correspondiente.
- **Rutas centralizadas**: Toda nueva página de la aplicación debe registrarse en `index.tsx`.

## Dependencias
- Importa de: `react-router-dom`, `components/layout/`, `pages/`.
- Importado por: `App.tsx`.
