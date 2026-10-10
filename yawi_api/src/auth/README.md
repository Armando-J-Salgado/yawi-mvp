# Módulo `auth`

El módulo **Auth** gestiona la autenticación JWT para los clientes (**Customers**) de la plataforma YAWI.

## Características y Alcance

- **Autenticación stateless** mediante JSON Web Tokens (JWT).
- Login exclusivo para **Customer** mediante `email` y `password`.
- Validación segura de contraseñas con **bcrypt**.
- Protección de endpoints con `JwtAuthGuard`.
- Exclusión total de contraseñas y hashes en respuestas y Swagger.

---

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo | Requerido |
|---|---|---|---|
| `JWT_SECRET` | Clave secreta para la firma y verificación de tokens | `clave_secreta_super_segura` | Sí |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1d` | Opcional (Default: `1d`) |

---

## Endpoints REST

| Método | Ruta | Descripción | Acceso | Código Éxito |
|---|---|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión con email y contraseña | Público | `200 OK` |
| `GET` | `/auth/me` | Obtener identidad del usuario autenticado | Protegido (Bearer JWT) | `200 OK` |

---

## Estructura del Payload JWT

```json
{
  "sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "userType": "customer",
  "email": "cliente@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## Ejemplos de Uso

### 1. Iniciar Sesión (`POST /auth/login`)

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "CustomerPass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "1d",
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "userType": "customer",
    "email": "cliente@example.com",
    "name": "Ana",
    "lastname": "Pérez"
  }
}
```

### 2. Consultar Usuario Autenticado (`GET /auth/me`)

**Request:**
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "userType": "customer",
  "email": "cliente@example.com",
  "name": "Ana",
  "lastname": "Pérez"
}
```
