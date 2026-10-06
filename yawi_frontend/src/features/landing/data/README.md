# Landing Feature Data (`src/features/landing/data`)

## Propósito

Alberga conjuntos de datos estáticos y mocks utilizados durante el desarrollo de la Landing Page antes de la integración con el backend.

## Contenido

- `featured-products.ts`: Lista de productos artesanales destacados con precios, artesanos y países.

## Reglas

- **Mocks tipados**: Todos los datos deben implementar interfaces de `features/landing/types.ts`.
- **Transición a API**: En hitos posteriores (M2), estos archivos serán reemplazados por endpoints de la API vía TanStack Query manteniendo el contrato de tipos.

## Dependencias

- Importa de: `features/landing/types.ts`.
- Importado por: `features/landing/hooks/`.
