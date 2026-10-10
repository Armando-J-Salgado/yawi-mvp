# Utils (`src/utils`)

## Propósito

Funciones utilitarias puras y helpers sin estado ni dependencias directas del DOM o React.

## Contenido

- `formatAddress.ts`: Utilidad para obtener el primer segmento de una dirección formateada.
- `countryName.ts`: Convierte un código ISO alpha-2 al nombre oficial del país.
- `formatCurrency.ts`: Formatea montos en USD (moneda fija del MVP), p. ej. `120` → `"$120.00 USD"`.
- `resolveImageUrl.ts`: Resuelve URLs de imagen del backend (rutas `/uploads/...` relativas → prefijadas con `VITE_API_URL`; absolutas y assets públicos → intactas).
- `validation.ts`: Validadores puros de campos para formularios de login y registro.
