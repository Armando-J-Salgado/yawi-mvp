# Seller Feature (`src/features/seller`)

## Propósito

Encapsula los componentes, configuración de imágenes y exportaciones asociados a la Landing Page "Vender con Yawi" (`/vender`), dirigida al segmento de artesanos y negocios locales.

## Contenido

- `components/`: Implementación modular de las 9 secciones visuales de la landing de vendedores.
- `seller-images.json`: Archivo centralizado de configuración de imágenes y placeholders del segmento vendedor.
- `index.ts`: Barrel export público del feature.
- `README.md`: Este archivo descriptivo.

## Reglas

- **Aislamiento de feature**: Las secciones específicas de vendedores viven exclusivamente dentro de esta carpeta.
- **Imágenes centralizadas**: Nuevas imágenes o cambios de fuentes se configuran en `seller-images.json`.
- **Textos con i18n**: Todos los textos consumen el namespace `seller` de i18n sin strings hardcodeados.
- **Tokens de diseño**: Cero valores hex/rgb directos; uso estricto de clases de diseño Tailwind con variables de `@theme`.
- **Regla de capas**: No importa desde `pages/`. Solo expone su API pública a través de `index.ts`.

## Dependencias

- Importa de: `components/ui/`, `i18n/`.
- Importado por: `pages/SellerLandingPage/`.
