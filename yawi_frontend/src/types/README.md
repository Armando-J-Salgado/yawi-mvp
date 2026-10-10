# Types (`src/types`)

## Propósito

Tipos de **dominio compartidos** por varias capas (componentes, servicios, store). Aquí viven los modelos que representan la app, no el contrato crudo del backend.

## Inventario

| Archivo      | Contenido                                                                   |
| ------------ | --------------------------------------------------------------------------- |
| `auth.ts`    | `AuthUser`, `CustomerRegistrationData`, `LoginCredentials`, `AuthResponse`. |
| `artisan.ts` | `Business`, `BusinessDto`, `PublicVendor`, etc.                             |
| `product.ts` | `Product`, `ProductDto`, `ProductFilters` (catálogo).                       |
| `cart.ts`    | `CartItem`.                                                                 |

## Distinción importante

- **Tipos de dominio** (usados por la UI y los servicios) → `src/types/` (compartidos) o `src/features/<x>/types.ts` (locales).
- **DTOs del backend** (contrato HTTP exacto) → dentro del `*.api.ts` correspondiente en `src/api/` (p. ej. `CustomerDto`, `CreateCustomerPayload`).

Así el dominio no se acopla a la forma exacta de la API y el mapeo queda aislado en `services/`.

## Dependencias

- No importa de otras capas de `src/`. Puede importar tipos entre sí.
- Importado por: `api/`, `services/`, `store/`, `features/`, `pages/`.
