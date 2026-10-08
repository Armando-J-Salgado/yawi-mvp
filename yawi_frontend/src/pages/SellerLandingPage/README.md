# Seller Landing Page (`src/pages/SellerLandingPage`)

## Propósito

Vista de nivel superior asociada a la ruta `/vender`. Ensambla y orquesta las 9 secciones del feature `seller` dentro del layout global.

## Contenido

- `SellerLandingPage.tsx`: Componente de página que compone secuencialmente las 9 secciones.
- `index.ts`: Barrel export de la página para consumo en las rutas de la aplicación.
- `README.md`: Este archivo descriptivo.

## Reglas

- **Solo composición**: La página no implementa lógica de negocio propia ni maneja estado complejo; delega toda la renderización a los componentes del feature `seller`.
- **Regla de capas**: Importa de `features/seller`. No contiene estilos ad-hoc.
- **Export default nombrado**: Utiliza export default para facilitar lazy-loading y named re-export en `index.ts`.

## Dependencias

- Importa de: `features/seller`.
- Importado por: `routes/index.tsx`.
