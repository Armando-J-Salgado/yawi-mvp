# Módulo `auth`

El módulo **Auth** gestiona la autenticación JWT para los clientes
(**Customers**) de la plataforma YAWI.

## Características y alcance

- Autenticación stateless mediante JSON Web Tokens (JWT).
- Login exclusivo para **Customer** mediante `email` y `password`.
- Validación segura de contraseñas con `bcrypt`.
- Protección de endpoints con `JwtAuthGuard`.
- Exclusión total de contraseñas y hashes en respuestas y Swagger.

---

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo | Requerido |
|---|---|---|---|
| `JWT_SECRET` | Clave secreta para la firma y verificación de tokens | `<reemplazar-con-secreto-local>` | Sí |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1d` | Opcional (default: `1d`) |

El valor de `JWT_SECRET` es solo un marcador de posición documental. Debe
definirse mediante variables de entorno locales o mediante el gestor de
secretos del entorno; nunca debe copiarse literalmente ni versionarse.

---

## Endpoints REST

| Método | Ruta | Descripción | Acceso | Código éxito |
|---|---|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión con email y contraseña | Público | `200 OK` |
| `GET` | `/auth/me` | Obtener identidad del usuario autenticado | Protegido (Bearer JWT) | `200 OK` |

---

## Estructura del payload JWT

El siguiente objeto es únicamente un ejemplo ilustrativo de la estructura
decodificada. No es un token válido:

```json
{
  "sub": "<customer-uuid>",
  "userType": "customer",
  "email": "cliente@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## Ejemplos de uso

### 1. Iniciar sesión (`POST /auth/login`)

**Request:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "<customer-password>"
}
```

**Response (200 OK):**

```json
{
  "access_token": "<example-jwt-access-token>",
  "token_type": "Bearer",
  "expires_in": "1d",
  "user": {
    "id": "<customer-uuid>",
    "userType": "customer",
    "email": "cliente@example.com",
    "name": "Ana",
    "lastname": "Pérez"
  }
}
```

`<example-jwt-access-token>` es un marcador de posición y no representa un
token real.

### 2. Consultar usuario autenticado (`GET /auth/me`)

**Request:**

```http
GET /auth/me
Authorization: Bearer <example-jwt-access-token>
```

**Response (200 OK):**

```json
{
  "id": "<customer-uuid>",
  "userType": "customer",
  "email": "cliente@example.com",
  "name": "Ana",
  "lastname": "Pérez"
}
```

Nunca incluyas contraseñas, hashes, JWT reales o secretos en la
documentación, ejemplos, commits o mensajes de error.
