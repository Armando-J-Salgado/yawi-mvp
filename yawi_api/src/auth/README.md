# Módulo `auth`

El módulo **Auth** gestiona la autenticación JWT para Customers y Vendors de
la plataforma YAWI.

## Características

- Login de Customer mediante `email` y `password`.
- Login de Vendor mediante `username` o `DUI` y `password`.
- Validación segura de contraseñas con `bcrypt`.
- Protección de endpoints con guards JWT.
- Exclusión de contraseñas y hashes en respuestas y Swagger.

## Variables de entorno

| Variable | Descripción | Ejemplo | Requerido |
|---|---|---|---|
| `JWT_SECRET` | Clave para firmar y verificar tokens | `<reemplazar-con-secreto-local>` | Sí |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1d` | No |

El secreto debe definirse mediante variables de entorno o un gestor de
secretos. Nunca debe copiarse literalmente ni versionarse.

## Endpoints REST

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/auth/login` | Login de Customer con email y contraseña | Público |
| `GET` | `/auth/me` | Identidad del Customer autenticado | Bearer JWT Customer |
| `POST` | `/auth/vendor/login` | Login de Vendor con username o DUI | Público |
| `GET` | `/auth/vendor/me` | Identidad del Vendor autenticado | Bearer JWT Vendor |

Un token de Customer no es válido para `/auth/vendor/me`, y un token de Vendor
no es válido para `/auth/me`.

## Payload JWT

Customer:

```json
{
  "sub": "<customer-uuid>",
  "userType": "customer",
  "email": "cliente@example.com"
}
```

Vendor:

```json
{
  "sub": "<vendor-uuid>",
  "userType": "vendor",
  "username": "jperez"
}
```

Los ejemplos son ilustrativos y no representan tokens válidos. Nunca deben
incluir contraseñas, hashes, DUI, NIT, direcciones personales ni secretos.

## Login de Vendor

Request para `POST /auth/vendor/login`:

```json
{
  "identifier": "jperez",
  "password": "<YOUR-VENDOR-PASSWORD>"
}
```

`identifier` también puede ser un DUI, por ejemplo `01234567-8`. El servicio
normaliza espacios laterales y responde con el mismo error genérico para
identificadores inexistentes, Vendors eliminados o contraseñas incorrectas.

Nunca incluyas contraseñas, hashes, JWT reales o secretos en la documentación,
ejemplos, commits o mensajes de error.
