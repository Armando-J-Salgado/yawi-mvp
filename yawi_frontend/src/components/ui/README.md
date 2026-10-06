# UI Components (`src/components/ui`)

## Propósito

Contiene los componentes atómicos y reutilizables del sistema de diseño de Yawi. Son componentes domain-agnostic (desacoplados de cualquier modelo de negocio o feature específico).

## Contenido

- `Button/`: Botón interactivo con variantes (primary, secondary, ghost, cta) y tamaños.
- `Skeleton/`: Placeholder animado (pulse) para estados de carga.
- `ImagePlaceholder/`: Contenedor de imágenes con skeleton automático y estado de fallback de error.
- `SectionContainer/`: Envoltorio estandarizado para secciones de página con espaciado vertical y fondo configurable.
- `Card/`: Contenedor tipo tarjeta con esquinas redondeadas (`24px`), borde y elevación hover opcional.
- `Badge/`: Etiqueta tipo píldora para estados, categorías y roles.
- `index.ts`: Barrel export de todos los componentes y tipos de la capa UI.

## Reglas

- **Cero dependencias de negocio**: Prohibido importar de `api/`, `services/`, `store/`, `i18n/` o `features/`.
- **Texto vía props**: Todos los textos deben ser pasados por los consumidores vía props o `children`.
- **Estilos centralizados**: Usar exclusivamente tokens del tema Tailwind v4 definidos en `@theme` (`index.css`).
- **Exportaciones con nombre**: Siempre exportar componentes y tipos explícitamente.

## Dependencias

- Importa de: Librerías base (React, Lucide React).
- Importado por: `components/layout/`, `components/common/`, `features/*`, `pages/*`.
