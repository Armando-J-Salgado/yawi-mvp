# Data (`src/data`)

## Propósito

Contenido estático **no traducible** (constantes, listas de opciones, datasets de ejemplo). No es lógica ni presentación.

## Contenido

- `categories.ts`: Definición canónica de las 6 categorías de artesanías (`Category` interface y array `CATEGORIES`) con sus slugs, tags para filtrado de productos, rutas de imágenes y claves i18n.

## Reglas

- Sin React, sin `fetch`, sin efectos secundarios.
- Datos estáticos (tags, nombres) **no** se traducen: son contenido, no interfaz (Decisión #65).
- Los textos de UI viven en `src/i18n/locales/`.

## Dependencias

- Importa de: `types/`.
- Importado por: `api/`, `features/`.
