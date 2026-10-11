# Utils (`src/utils`)

## Propósito

Funciones utilitarias puras y helpers sin estado ni dependencias directas del DOM o React.

## Contenido

- `formatAddress.ts`: Utilidad para obtener el primer segmento de una dirección formateada.
- `countryName.ts`: Convierte un código ISO alpha-2 al nombre oficial del país.
- `formatCurrency.ts`: Formatea montos en USD (moneda fija del MVP), p. ej. `120` → `"$120.00 USD"`.
- `resolveImageUrl.ts`: Resuelve URLs de imagen del backend (rutas `/uploads/...` relativas → prefijadas con `VITE_API_URL`; absolutas y assets públicos → intactas).
- `validation.ts`: Validadores puros de campos para formularios de login y registro.
- `apiErrorMessage.ts`: Extrae un mensaje mostrable de un error desconocido (prioriza el `message` del backend, p. ej. `ApiError`); usa un fallback i18n si no hay mensaje útil. Alimenta las notificaciones de error (`useErrorToast`).
- `toNumber.ts`: Coerciona un `decimal` del backend (`number | string | null`) a `number` seguro (0 si no es finito). Compartido por `products.service` y `order.service` (Decisión #92).
