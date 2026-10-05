# Pages (`src/pages`)

## Propósito
Representa las vistas de nivel superior asociadas a rutas de la aplicación web. Actúan como integradores entre los features, layout y parámetros de URL.

## Contenido
- `LandingPage/`: Página de inicio que orquesta y ensambla las 9 secciones del feature de landing.
- `README.md`: Este archivo descriptivo.

## Reglas
- **Composición, no implementación**: Las páginas deben limitarse a orquestar features y componentes. No deben contener estilos complejos ad-hoc ni lógica de negocio interna.
- **Rutas relativas en M1**: Los imports se realizan mediante rutas relativas hasta la configuración de alias en M2.
- **Regla de capas**: Las páginas pueden importar de `features/*`, `components/*`, `store/`, `hooks/`. Ninguna capa inferior puede importar de `pages/`.

## Dependencias
- Importa de: `features/landing/`.
- Importado por: `routes/index.tsx`.
