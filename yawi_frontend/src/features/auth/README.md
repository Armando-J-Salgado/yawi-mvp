# Feature: Auth

Vertical slice para autenticación de clientes (login y registro).

## Estructura

```
auth/
  components/
    LoginForm/         # Formulario de inicio de sesión
    RegisterForm/      # Formulario de registro (2 steps)
  hooks/
    useCountries.ts    # Hook para lista de países (i18n-iso-countries)
  types.ts             # Tipos locales (RegisterFormState, RegisterStep)
  index.ts             # API pública del feature
```

## Dependencias externas

- `i18n-iso-countries`: Lista de países traducida ES/EN.

## Conexión con backend

- **Registro (M4-1, real):** `RegisterForm` → `services/auth.service.ts#registerUser` → `api/auth.api.ts#registerApi` → `POST /customers`. El servicio mapea el formulario al contrato de `yawi_api` (`address` → `personal_address`, país ISO → nombre) y normaliza errores a `AuthResponse` (mensaje del backend o fallback i18n).
- **Login (mock):** sigue sin autenticación real. `loginApi` y `authStore.login` conservan el mock; conectar en un milestone posterior (buscar `TODO [M4]`).
- El registro **no pasa por el store**: el formulario llama al servicio directamente porque no persiste estado de sesión.

## Notas

- Login usa seguridad por oscuridad: no revela qué campo falla.
- Registro valida cada campo individualmente y resalta errores.
- El formulario de registro está dividido en 2 steps para no saturar al usuario.
