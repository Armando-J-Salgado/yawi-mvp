# Plan de Implementación — Auth para Vendor

## 1. Alcance

Implementar autenticación de **Vendor únicamente en `yawi_api`**, reutilizando
la infraestructura JWT existente para Customer.

### Incluido

- Login de Vendor con `username` o `DUI`.
- Validación de contraseña con `bcrypt`.
- Generación de JWT con `userType: 'vendor'`.
- Validación de tokens de Vendor.
- Endpoint `POST /auth/vendor/login`.
- Endpoint `GET /auth/vendor/me`.
- Pruebas unitarias y e2e.
- Actualización de la documentación de Auth.

### Excluido

- Cambios en frontend o n8n.
- Registro de Vendors.
- Cambio o recuperación de contraseña.
- Refresh tokens, OAuth o Supabase Auth.
- Cambios funcionales al CRUD de Vendors.
- Cambios en Businesses, Products, Orders o Customers.
- Migraciones de base de datos.

El endpoint existente `POST /auth/login` continuará siendo exclusivo para
Customer.

## 2. Contrato de login de Vendor

### Endpoint

```http
POST /auth/vendor/login
```

### Request

```json
{
  "identifier": "jperez",
  "password": "SecureVendorPass123!"
}
```

`identifier` podrá contener un `username` o un `DUI`, por ejemplo:

```json
{
  "identifier": "01234567-8",
  "password": "SecureVendorPass123!"
}
```

El servicio deberá aplicar `trim()`, buscar por `username` o `DUI`, comparar
la contraseña con `bcrypt` y responder con el mismo mensaje genérico cuando el
Vendor no exista, esté eliminado o la contraseña sea incorrecta.

La respuesta pública será:

```json
{
  "access_token": "jwt...",
  "token_type": "Bearer",
  "expires_in": "1d",
  "user": {
    "id": "uuid",
    "userType": "vendor",
    "username": "jperez",
    "name": "Juan",
    "surname": "Pérez",
    "lastname": "Carlos",
    "second_lastname": "López"
  }
}
```

Nunca se devolverá `password`, su hash ni relaciones completas del Vendor.

## 3. Payload JWT

El payload mantendrá una unión discriminada por tipo de usuario:

```typescript
{
  sub: string;
  userType: 'customer';
  email: string;
}
```

```typescript
{
  sub: string;
  userType: 'vendor';
  username: string;
}
```

El token de Vendor no incluirá contraseña, DUI, NIT, dirección personal ni
otros datos sensibles. `sub` será el UUID canónico del usuario.

## 4. Endpoints

Se conservarán sin cambios:

```http
POST /auth/login
GET /auth/me
```

Estos endpoints seguirán siendo exclusivos para Customer.

Se agregarán:

```http
POST /auth/vendor/login
GET /auth/vendor/me
```

`GET /auth/vendor/me` requerirá un Bearer JWT cuyo `userType` sea `vendor`,
volverá a validar que el Vendor exista y esté activo, y rechazará tokens de
Customer con `401 Unauthorized`.

## 5. Archivos y cambios previstos

### Auth

- Modificar `src/auth/auth.controller.ts` para agregar los dos endpoints de
  Vendor y su documentación Swagger.
- Modificar `src/auth/auth.service.ts` para inyectar `Repository<Vendor>`,
  implementar el login de Vendor y validar tokens de Vendor.
- Modificar `src/auth/auth.module.ts` para registrar `Vendor` en
  `TypeOrmModule.forFeature`.
- Modificar `src/auth/interfaces/jwt-payload.interface.ts` para representar
  Customers y Vendors.
- Modificar `src/auth/strategies/jwt.strategy.ts` y el guard para validar el
  tipo de usuario correspondiente.

### DTOs

Agregar `src/auth/dto/vendor-login.dto.ts` con:

- `identifier` obligatorio y no vacío.
- `password` obligatorio y no vacío.

Actualizar `src/auth/dto/auth-response.dto.ts` para documentar las respuestas
de Customer y Vendor sin exponer contraseñas.

### Fuera de alcance directo

No modificar `src/vendors/entities/vendor.entity.ts`,
`src/vendors/vendors.service.ts` ni `src/vendors/vendors.controller.ts`, salvo
que aparezca una incompatibilidad estrictamente necesaria para consultar el
hash durante Auth.

## 6. Pruebas

Actualizar las pruebas unitarias de Auth para cubrir:

1. Login exitoso por `username`.
2. Login exitoso por `DUI`.
3. Identificador con espacios laterales.
4. Contraseña incorrecta.
5. Vendor inexistente o eliminado.
6. Payload con `userType: 'vendor'`.
7. Token Vendor válido.
8. Token Customer rechazado en flujo Vendor.
9. Token Vendor rechazado en flujo Customer.
10. Ausencia de contraseña en la respuesta.

Extender `test/auth.e2e-spec.ts` para probar:

- `POST /auth/vendor/login` con username y DUI.
- Respuestas `400` y `401`.
- `GET /auth/vendor/me` con token válido, ausente, alterado, expirado o de
  Customer.
- Invalidación posterior del token cuando el Vendor sea soft-deleted.
- Compatibilidad del flujo existente de Customer.

## 7. Documentación y validación final

Actualizar `src/auth/README.md` con los contratos de Vendor y mantener
documentados `JWT_SECRET` y `JWT_EXPIRES_IN` sin incluir secretos reales.

Validar únicamente desde `yawi_api`:

1. Pruebas unitarias de Auth.
2. Prueba e2e de Auth.
3. Build de NestJS.
4. Que no se hayan modificado frontend, n8n ni módulos fuera de Auth.
