# Plan de Implementación — Módulo `auth`

## 1. Alcance y restricciones

Este plan define una autenticación propia para la API mediante JWT. El alcance
es únicamente `yawi_api`; no incluye Supabase Auth, frontend, n8n ni servicios
externos.

La autenticación permitirá iniciar sesión únicamente a **Customer** mediante
su `email`. Los Vendors no tendrán pantallas ni login en esta API: su gestión
se realizará por WhatsApp mediante n8n en un alcance separado.

### Incluido

- Módulo NestJS `AuthModule`.
- Login para Customer.
- Validación de contraseñas con `bcrypt`.
- Generación de access tokens JWT.
- Guard JWT para proteger endpoints.
- Estrategia mínima para validar el token.
- Endpoint para consultar el usuario autenticado.
- DTOs, respuestas documentadas con Swagger y pruebas.
- Configuración mediante variables de entorno existentes.

### Excluido

- Supabase Auth o cualquier autenticación de Supabase.
- Flujo de registro dentro de Auth; la creación de Customers permanece en el
  módulo CRUD de Customers.
- Cambio de contraseña.
- Recuperación de contraseña, email de recuperación o códigos temporales.
- Refresh tokens, rotación o revocación persistente de tokens.
- OAuth, redes sociales, Passport complejo o proveedores externos.
- Roles y permisos avanzados.
- Frontend, n8n y cambios de infraestructura no relacionados.

El JWT será el token de sesión del MVP. El logout será responsabilidad del
cliente: al usar JWT stateless, la API no mantendrá una blacklist ni una sesión
persistente en base de datos.

---

## 2. Modelo de autenticación

### 2.1 Credenciales

| Usuario | Identificador | Fuente |
|---|---|---|
| Customer | `email` | Entidad `Customer` |

El servicio debe:

1. Recibir el email y la contraseña.
2. Normalizar el email con `trim()` y `toLowerCase()`.
3. Buscar el Customer activo.
4. Comparar la contraseña recibida contra el hash almacenado con `bcrypt`.
5. Rechazar credenciales inválidas con una respuesta genérica.
6. Generar un JWT con la identidad mínima necesaria.

No se debe revelar si el identificador existe. Las credenciales inválidas
deben producir el mismo `UnauthorizedException` tanto si falla el usuario
como si falla la contraseña.

### 2.2 Contrato de login

El login no debe pedir `userType` ni `identifier`. El frontend existente ya
espera `email` y `password`, y ese será el contrato del MVP:

```json
{
  "email": "cliente@example.com",
  "password": "..."
}
```

### 2.3 Payload JWT

El payload debe ser pequeño y no contener contraseñas, datos personales
completos ni información sensible:

```typescript
{
  sub: string,                 // UUID del usuario
  userType: 'customer',
  email: string,
}
```

`sub` será el identificador canónico y `email` permitirá identificar al
Customer autenticado sin incluir datos sensibles.

La respuesta de login tendrá esta forma:

```json
{
  "access_token": "jwt...",
  "token_type": "Bearer",
  "expires_in": "1d",
  "user": {
    "id": "uuid",
    "userType": "customer",
    "email": "cliente@example.com",
    "name": "Ana",
    "lastname": "Pérez"
  }
}
```

La respuesta nunca debe incluir `password` ni su hash.

---

## 3. Variables de entorno

Usar la configuración existente del backend:

```env
JWT_SECRET=una-clave-larga-y-segura
JWT_EXPIRES_IN=1d
```

### Reglas

- `JWT_SECRET` es obligatorio para ejecutar Auth.
- No usar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, JWKS ni
  `SUPABASE_ANON_KEY`.
- No colocar `JWT_SECRET` en frontend, n8n ni en el repositorio.
- No definir un secreto débil por defecto en código.
- `JWT_EXPIRES_IN` debe tener un valor explícito y válido.

El módulo debe fallar claramente durante el arranque si falta `JWT_SECRET`,
en lugar de generar tokens con una clave vacía o predecible.

---

## 4. Estructura de archivos

Crear únicamente el área funcional de Auth y los cambios mínimos de
integración:

```text
yawi_api/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── auth-response.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.service.spec.ts
│   │   └── README.md
│   └── app.module.ts              # Solo registrar AuthModule
├── test/
│   └── auth.e2e-spec.ts
└── docs/
    └── IMPLEMENTACION_PLAN_AUTH.md
```

No crear carpetas para password reset, refresh tokens, sesiones, OAuth ni
Supabase.

---

## 5. Dependencias y configuración

### 5.1 Dependencias mínimas

Verificar primero si están instaladas. Agregar solo las que falten:

```powershell
npm install @nestjs/jwt
```

`bcrypt`, `@types/bcrypt`, `@nestjs/config`, `class-validator` y
`class-transformer` ya son dependencias del backend y deben reutilizarse.

No agregar Passport ni `@nestjs/passport` si el guard puede implementarse con
`JwtService` de forma clara y suficiente para este MVP.

### 5.2 `AuthModule`

El módulo debe:

- Importar `ConfigModule` si el proyecto no lo expone globalmente.
- Configurar `JwtModule.registerAsync()` usando `ConfigService`.
- Inyectar `Customer` con `TypeOrmModule.forFeature()`.
- Registrar `AuthService`, `AuthController`, `JwtStrategy` y
  `JwtAuthGuard`.
- Exportar el guard o los elementos necesarios para los módulos protegidos.

El cambio en `AppModule` debe limitarse a agregar `AuthModule`.

---

## 6. DTOs y validación

### `LoginDto`

Campos:

- `email`: email válido y no vacío.
- `password`: string no vacío.

La validación debe usar el `ValidationPipe` global existente.

No aceptar propiedades adicionales gracias a `whitelist` y
`forbidNonWhitelisted`.

### `AuthResponseDto`

Documentar únicamente la forma pública de la respuesta. No incluir el campo
`password` en DTOs de respuesta ni en decoradores Swagger.

---

## 7. `AuthService`

### `login(loginDto)`

1. Normalizar el email.
2. Buscar el Customer activo.
3. Comparar la contraseña con `bcrypt.compare`.
4. Lanzar un error genérico si el usuario no existe o la contraseña no
   coincide.
5. Construir un payload mínimo con `userType: 'customer'`.
6. Firmar el JWT con `JwtService`.
7. Devolver token, expiración y datos públicos del usuario.

Los usuarios con `deletedAt` no deben poder iniciar sesión. La búsqueda debe
excluir soft-deleted por defecto.

### `validateTokenPayload(payload)`

1. Validar que `sub` sea UUID.
2. Confirmar que `userType` sea `customer`.
3. Buscar el Customer activo.
4. Rechazar el token si el Customer no existe o fue eliminado.
5. Retornar una identidad pública mínima para `request.user`.

Esto permite invalidar de forma natural los tokens de usuarios eliminados,
aunque todavía no exista revocación individual de JWT.

---

## 8. Guard y estrategia JWT

### `JwtStrategy`

La estrategia debe extraer el token desde:

```text
Authorization: Bearer <token>
```

Debe validar firma y expiración usando `JWT_SECRET`. No aceptar tokens desde
query params ni desde cuerpos de requests.

### `JwtAuthGuard`

El guard debe proteger endpoints de forma explícita con:

```typescript
@UseGuards(JwtAuthGuard)
```

No hacer que todos los endpoints existentes queden protegidos
automáticamente en esta fase. La protección de cada módulo debe definirse en
un trabajo separado, para evitar cambios fuera del alcance.

El guard debe devolver `401 Unauthorized` para:

- Token ausente.
- Esquema distinto de Bearer.
- Token malformado.
- Firma inválida.
- Token expirado.
- Usuario inexistente o eliminado.

No usar `as any` para acceder a `request.user`; definir una interfaz de
identidad autenticada.

---

## 9. `AuthController`

Crear únicamente estos endpoints:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/auth/login` | Autenticar Customer |
| `GET` | `/auth/me` | Obtener identidad del token actual |

### `POST /auth/login`

- Público.
- Recibe `LoginDto`.
- Devuelve `AuthResponseDto`.
- Documentar `200`, `400` y `401`.
- No revelar si falló el email o la contraseña.

### `GET /auth/me`

- Protegido con `JwtAuthGuard`.
- Devuelve la identidad pública del usuario autenticado.
- No devolver password, hash ni credenciales.

No crear endpoints de logout, cambio de password, recuperación, refresh ni
registro dentro de este módulo.

---

## 10. Protección de datos y errores

- Nunca registrar passwords, JWT completos, `JWT_SECRET` ni hashes.
- Nunca devolver hashes en respuestas o errores.
- Usar mensajes genéricos para credenciales inválidas.
- Mantener `ValidationPipe` y las excepciones estándar de NestJS.
- No capturar errores de forma amplia ni devolver respuestas exitosas
  simuladas.
- No modificar la lógica de hashing existente de Customers fuera de la
  reutilización necesaria para login.

---

## 11. Pruebas requeridas

### 11.1 Pruebas unitarias de `AuthService`

Cubrir como mínimo:

#### Login Customer

- Login exitoso con email normalizado.
- Rechazo de email inexistente.
- Rechazo de contraseña incorrecta.
- Rechazo de Customer eliminado.
- Generación de payload con `userType: 'customer'`.

#### Respuesta

- Incluye `access_token`.
- Incluye tipo y expiración.
- No incluye `password`.
- No incluye hash.
- El payload contiene únicamente datos mínimos.

#### Validación del payload

- Acepta payload válido.
- Rechaza UUID inválido.
- Rechaza un email inválido.
- Rechaza usuario inexistente.
- Rechaza usuario eliminado.

### 11.2 Pruebas del guard/estrategia

- Acepta `Bearer` con token válido.
- Rechaza header ausente.
- Rechaza esquema incorrecto.
- Rechaza token expirado.
- Rechaza firma inválida.
- Rechaza identidad eliminada.

### 11.3 Pruebas unitarias del controlador

- `POST /auth/login` delega al servicio.
- `GET /auth/me` devuelve el usuario de `request.user`.
- Los DTOs se pasan correctamente.

### 11.4 Prueba e2e

Crear `test/auth.e2e-spec.ts` con SQLite in-memory y ejecución secuencial:

1. Preparar un Customer con hash bcrypt.
2. Hacer login válido de Customer con email y password.
3. Consultar `/auth/me` con el token.
4. Verificar que no aparece ningún password.
5. Probar credenciales inválidas.
6. Probar token ausente, alterado y expirado.
7. Soft-delete del Customer y verificar que su token deja de ser válido.

No probar frontend, n8n, Supabase ni recuperación de contraseña.

---

## 12. Integración con otros módulos

En este plan únicamente se registra `AuthModule` en `AppModule`.

No proteger automáticamente Customers, Businesses, Phone Numbers ni Payment
Preferences. Después de validar Auth en aislamiento, se puede crear un plan
separado para:

- Proteger rutas específicas de Customer.
- Definir autorización para Customer.
- Aplicar `request.user` a reglas de negocio.

Esto evita mezclar autenticación con autorización y reduce el riesgo de
romper el CRUD existente.

---

## 13. Validación final

Desde `yawi_api` ejecutar:

```powershell
npm run format
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
```

La implementación solo se considera completa cuando:

- El build pasa sin errores TypeScript.
- Las pruebas unitarias y e2e pasan.
- Swagger expone `/auth/login` y `/auth/me`.
- Customer puede autenticarse con email y password.
- Ninguna respuesta contiene passwords o hashes.
- Los usuarios eliminados no pueden autenticarse.
- No se agregó Supabase Auth ni dependencia externa de autenticación.
- No se modificaron frontend, n8n ni módulos fuera de la integración mínima.
