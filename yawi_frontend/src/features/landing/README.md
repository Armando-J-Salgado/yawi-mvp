# Landing Feature (`src/features/landing`)

## Propósito

Encapsula todos los componentes, hooks, tipos y configuraciones de datos asociados a la experiencia de la Landing Page principal de Yawi.

## Contenido

- `components/`: Implementación modular de las 9 secciones visuales de la landing page.
- `data/`: Datos estáticos simulados (productos destacados).
- `hooks/`: Hooks de consumo de datos y lógica del feature (`useFeaturedProducts`).
- `landing-images.json`: Archivo centralizado de configuración de imágenes y placeholders de la landing.
- `types.ts`: Interfaces y tipos de TypeScript para los modelos de datos del feature.
- `index.ts`: Barrel export público del feature.

## Reglas

- **Aislamiento de feature**: Las secciones específicas de la landing viven exclusivamente dentro de esta carpeta.
- **Imágenes centralizadas**: Nuevas imágenes o cambios de fuentes deben configurarse en `landing-images.json`.
- **Textos con i18n**: Todos los títulos, descripciones y etiquetas consumen el namespace `landing` de i18n.
- **Regla de capas**: No importa desde `pages/`. Solo expone su API pública a través de `index.ts`.

## Dependencias

- Importa de: `components/ui/`, `components/common/`, `i18n/`.
- Importado por: `pages/LandingPage/`.
