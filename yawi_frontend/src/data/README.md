# Data (`src/data`)

## Propósito

Contenido estático **no traducible** (constantes, listas de opciones, datasets de ejemplo). No es lógica ni presentación.

## Contenido

- **Actualmente sin datasets.** El antiguo `mock-products.ts` se eliminó al integrar la API real de productos (Decisión #73). Los productos ahora se obtienen vía `src/api/products.api.ts` (`GET /products`).

## Reglas

- Sin React, sin `fetch`, sin efectos secundarios.
- Datos estáticos (tags, nombres) **no** se traducen: son contenido, no interfaz (Decisión #65).
- Los textos de UI viven en `src/i18n/locales/`.

## Dependencias

- Importa de: `types/`.
- Importado por: `api/`, `features/`.
