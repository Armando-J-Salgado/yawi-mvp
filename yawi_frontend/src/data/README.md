# Data (`src/data`)

## Propósito

Contenido estático **no traducible** (constantes, listas de opciones, datasets de ejemplo). No es lógica ni presentación.

## Contenido

- `mock-products.ts`: dataset mock que simula el futuro `GET /products` de `yawi_api`. Expone `MOCK_PRODUCTS: ProductDto[]`.

## Cómo sustituir el mock por la API real

1. Abrir `src/api/products.api.ts`.
2. Reemplazar el cuerpo de `getProducts()` y `getProductById()` por llamadas `fetch(`${API_BASE}/products`)` / `fetch(`${API_BASE}/products/${id}`)`.
3. Eliminar `mock-products.ts`.

No se deben modificar componentes, hooks, servicios, tiendas ni pantallas.

## Reglas

- Sin React, sin `fetch`, sin efectos secundarios.
- Datos de producto (tags, nombres) **no** se traducen: son contenido, no interfaz (Decisión #65).
- Los textos de UI viven en `src/i18n/locales/`.

## Dependencias

- Importa de: `types/`.
- Importado por: `api/`.
