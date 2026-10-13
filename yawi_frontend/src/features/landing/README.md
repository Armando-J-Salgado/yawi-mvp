# Landing Feature (`src/features/landing`)

## Propósito

Encapsula todos los componentes, hooks, tipos y configuraciones de datos asociados a la experiencia de la Landing Page principal de Yawi.

## Contenido

- `components/`: Implementación modular de las 9 secciones visuales de la landing page.
- `hooks/`: Hooks de consumo de datos y lógica del feature (`useFeaturedProducts`).
- `landing-images.json`: Archivo centralizado de configuración de imágenes y placeholders de la landing.
- `types.ts`: Tipos locales del feature (`LatamCountry`). El producto destacado usa el dominio `Product` de `@/types/product`.
- `index.ts`: Barrel export público del feature.

### Productos destacados

- La sección "Productos Destacados" (`FeaturedProductsSection`) se sirve desde la **API real** vía `useFeaturedProducts`: `GET /products` (comparte `queryKey: ['products']` con el catálogo) + `GET /businesses` (join best-effort para conservar país y nombre de negocio). Decisión #71.
- Se eliminó el dataset estático `data/featured-products.ts` (Decisión #73).
- Los errores del backend se notifican con `useErrorToast` y el estado de error inline del carrusel.

## Reglas

- **Aislamiento de feature**: Las secciones específicas de la landing viven exclusivamente dentro de esta carpeta.
- **Imágenes centralizadas**: Nuevas imágenes o cambios de fuentes deben configurarse en `landing-images.json`.
- **Textos con i18n**: Todos los títulos, descripciones y etiquetas consumen el namespace `landing` de i18n.
- **Regla de capas**: No importa desde `pages/`. Solo expone su API pública a través de `index.ts`.

## Dependencias

- Importa de: `components/ui/`, `components/common/`, `i18n/`, `features/artisans/` (API pública `useBusinesses`), `services/products.service`, `hooks/useErrorToast`, `types/product`.
- Importado por: `pages/LandingPage/`.
