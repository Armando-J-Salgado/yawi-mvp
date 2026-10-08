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

El backend no está conectado en M3. Los archivos relevantes para conectar:

- `src/api/auth.api.ts` — Reemplazar mocks con llamadas reales (buscar TODO [M4]).
- `src/store/authStore.ts` — La acción `login` usa mock; actualizar para usar el servicio real.

## Notas

- Login usa seguridad por oscuridad: no revela qué campo falla.
- Registro valida cada campo individualmente y resalta errores.
- El formulario de registro está dividido en 2 steps para no saturar al usuario.
