# Plan de Implementación — Módulo `customers`

## 1. Alcance y restricciones

Este plan define la implementación del módulo `customers` exclusivamente dentro
de `yawi_api`.

El módulo representa a la persona que compra productos a través de los
negocios/vendors. En el modelo actual, un Customer se relacionará con sus
órdenes mediante `orders.customer_id`; sin embargo, el módulo `orders` todavía
no existe en esta API. Por lo tanto, esta fase implementará únicamente la
entidad y el CRUD de Customer, sin crear órdenes ni acoplar el módulo a una
entidad inexistente.

### Incluido

- Entidad TypeORM `Customer`.
- Módulo NestJS `CustomersModule`.
- DTOs de creación, actualización y filtros.
- Servicio con CRUD y soft delete.
- Controlador REST documentado con Swagger.
- Hashing de contraseñas con `bcrypt`.
- Pruebas unitarias de servicio y controlador.
- Prueba e2e del flujo CRUD en SQLite in-memory.
- Registro mínimo del módulo en `AppModule`.

### Excluido

- Auth, login, registro de sesión, JWT, guards y estrategias Passport.
- Frontend.
- n8n y workflows.
- Módulo `orders`.
- Relaciones con órdenes en esta fase.
- Cambios en Vendors, Businesses, Products o Payment Preferences, salvo el
  registro estrictamente necesario del nuevo módulo en `AppModule`.
- Migraciones de producción; el proyecto usa actualmente
  `synchronize: true` durante el desarrollo del MVP.

---

## 2. Modelo funcional

Un Customer es un comprador independiente de un Vendor. Sus datos se
utilizarán posteriormente para asociar órdenes, pero Customer no tendrá una
relación directa con Vendor o Business en esta fase.

### 2.1 Atributos

| Campo | Tipo | Requerido | Restricciones |
|---|---|---:|---|
| `id` | UUID v4 | Generado | Clave primaria |
| `email` | string | Sí | Único, normalizado y válido |
| `password` | string | Sí | Almacenada únicamente como hash bcrypt |
| `name` | string | Sí | No vacío |
| `lastname` | string | Sí | No vacío |
| `country` | string | Sí | No vacío |
| `personal_address` | string | Sí | No vacío |
| `createdAt` | timestamp | Generado | Fecha de creación |
| `updatedAt` | timestamp | Generado | Fecha de actualización |
| `deletedAt` | timestamp nullable | Generado | Soft delete |

La columna `email` debe tener restricción de unicidad a nivel de entidad y
base de datos. La comparación y persistencia del email deben realizarse de
forma consistente, preferiblemente eliminando espacios laterales y usando
minúsculas.

La columna `password` no debe devolverse en respuestas HTTP, Swagger ni
relaciones cargadas para el cliente. El hash solo debe utilizarse internamente
para futuras verificaciones de credenciales.

---

## 3. Estructura de archivos

Crear únicamente la siguiente área funcional:

```text
yawi_api/
├── src/
│   ├── customers/
│   │   ├── entities/
│   │   │   └── customer.entity.ts
│   │   ├── dto/
│   │   │   ├── create-customer.dto.ts
│   │   │   ├── update-customer.dto.ts
│   │   │   └── filter-customer.dto.ts
│   │   ├── customers.controller.ts
│   │   ├── customers.service.ts
│   │   ├── customers.module.ts
│   │   ├── customers.controller.spec.ts
│   │   ├── customers.service.spec.ts
│   │   └── README.md
│   └── app.module.ts              # Solo registrar CustomersModule
├── test/
│   └── customer.e2e-spec.ts
└── docs/
    └── IMPLEMENTATION_PLAN_CUSTOMER.md
```

No se deben crear carpetas de auth, orders, frontend o n8n como parte de este
trabajo.

---

## 4. Fases de implementación

### Fase 0 — Verificación previa

Antes de editar:

1. Confirmar que no exista ya una carpeta `src/customers`.
2. Confirmar que no exista una entidad o tabla `Customer` en la API.
3. Revisar las convenciones usadas por `businesses` para nombres, DTOs,
   errores, soft delete, Swagger y pruebas.
4. Verificar que `bcrypt` y `@types/bcrypt` ya estén disponibles en
   `package.json`; no agregar dependencias duplicadas.
5. Confirmar que el árbol de trabajo no contenga cambios ajenos que deban
   integrarse o preservarse.

### Fase 1 — Entidad `Customer`

Crear `src/customers/entities/customer.entity.ts` siguiendo el estilo de
`Business` y `Vendor`:

- `@Entity('customers')`.
- `@PrimaryGeneratedColumn('uuid')`.
- Columnas tipadas para los siete atributos del diagrama.
- `email` con `unique: true`.
- `@CreateDateColumn()`, `@UpdateDateColumn()` y `@DeleteDateColumn()`.
- Decoradores Swagger para documentar campos públicos.
- No incluir una relación `orders` hasta que exista la entidad y el módulo
  correspondiente.
- Evitar exponer el campo de contraseña en el modelo de respuesta.

La entidad no debe tener `owner_id`, porque Customer no pertenece a un Vendor.

### Fase 2 — DTOs y validación

#### `CreateCustomerDto`

Campos requeridos:

- `email`: `@IsEmail()`, `@IsNotEmpty()`, `@IsString()`.
- `password`: `@IsString()`, `@IsNotEmpty()`, longitud mínima definida de forma
  explícita.
- `name`, `lastname`, `country`, `personal_address`:
  `@IsString()` y `@IsNotEmpty()`.

La validación debe aprovechar el `ValidationPipe` global existente con
`whitelist`, `forbidNonWhitelisted` y `transform`.

#### `UpdateCustomerDto`

- Extender el patrón de actualización parcial usado por `Business`.
- Todos los campos deben ser opcionales.
- Si se recibe `password`, debe volver a hashearse; nunca debe persistirse en
  texto plano.
- Si se recibe `email`, debe normalizarse y verificarse su unicidad.

#### `FilterCustomerDto`

Incluir únicamente filtros útiles para este módulo:

- `email` para búsqueda exacta.
- `name` para búsqueda exacta, siguiendo la convención actual de filtros.
- `country` para búsqueda exacta.
- `withDeleted` como `@IsBooleanString()`.

No incluir filtros por `order_id`, `vendor_id` o `business_id`, porque esas
relaciones no existen todavía.

### Fase 3 — `CustomersService`

Implementar las operaciones:

#### `create(createCustomerDto)`

1. Normalizar el email.
2. Verificar que no exista un Customer activo o eliminado con el mismo email,
   según la política definida para unicidad.
3. Hashear la contraseña con `bcrypt`.
4. Crear y guardar el registro.
5. Retornar una representación sin `password`.
6. Convertir conflictos de unicidad a `ConflictException`, siguiendo el estilo
   de errores del proyecto.

#### `findAll(filters)`

- Aplicar filtros opcionales.
- Excluir eliminados por defecto.
- Permitir `withDeleted=true`.
- Ordenar por `createdAt DESC`.
- No incluir la contraseña en la respuesta.

#### `findOne(id)`

- Validar el UUID en el controlador con `ParseUUIDPipe`.
- Buscar el Customer activo.
- Lanzar `NotFoundException` si no existe.
- No exponer la contraseña.

#### `update(id, updateCustomerDto)`

- Buscar el Customer.
- Normalizar email si fue enviado.
- Verificar conflictos de email.
- Hashear una nueva contraseña si fue enviada.
- Guardar los cambios parciales.
- Retornar la representación sin contraseña.

#### `remove(id)`

- Verificar existencia.
- Ejecutar `softDelete`.
- No borrar físicamente el registro.

#### `recover(id)`

- Buscar con `withDeleted: true`.
- Lanzar `NotFoundException` si no existe.
- Restaurar mediante `restore`.
- Retornar el Customer activo sin contraseña.

El servicio no debe contener lógica de auth, emisión de tokens, llamadas a
n8n ni llamadas al frontend.

### Fase 4 — `CustomersController`

Crear rutas REST bajo `/customers`:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/customers` | Crear Customer |
| `GET` | `/customers` | Listar con filtros |
| `GET` | `/customers/:id` | Obtener por UUID |
| `PATCH` | `/customers/:id` | Actualizar parcialmente |
| `DELETE` | `/customers/:id` | Soft delete |
| `PATCH` | `/customers/:id/recover` | Recuperar |

El controlador debe:

- Usar `@ApiTags('Customers')`.
- Documentar operaciones y respuestas con Swagger.
- Usar `ParseUUIDPipe` en `:id`.
- Usar `@HttpCode(HttpStatus.NO_CONTENT)` para `DELETE`, como en Businesses.
- Delegar la lógica al servicio.
- No contener queries directas ni lógica de hashing.

Swagger debe mostrar los DTOs públicos sin presentar el hash ni ejemplos de
contraseñas reales.

### Fase 5 — `CustomersModule` e integración mínima

Crear `CustomersModule` con:

```typescript
TypeOrmModule.forFeature([Customer])
```

Registrar el controller, service y exportar el service si el diseño del
proyecto lo requiere para futuras órdenes.

Agregar únicamente `CustomersModule` a los imports de
`src/app.module.ts`. No modificar la configuración global, el bootstrap, n8n,
el frontend ni otros módulos.

La futura integración con `OrdersModule` deberá hacerse en un plan separado,
cuando exista la entidad `Order`. En ese momento se agregará la relación
inversa `@OneToMany` y se definirá explícitamente su política de eliminación.

---

## 5. Pruebas requeridas

### 5.1 Pruebas unitarias del servicio

Usar repositorio mock o SQLite in-memory siguiendo los patrones existentes.
Cubrir, como mínimo:

#### Create

- Crea un Customer válido.
- Hashea la contraseña y no guarda el valor plano.
- Normaliza el email.
- Rechaza un email duplicado.
- Rechaza datos inválidos mediante DTO/validación.

#### Find

- Lista Customers activos.
- Aplica filtros.
- Incluye eliminados únicamente con `withDeleted=true`.
- Obtiene un Customer existente sin exponer `password`.
- Lanza `NotFoundException` para UUID inexistente.

#### Update

- Actualiza parcialmente datos permitidos.
- Hashea una nueva contraseña.
- Rechaza un email duplicado.
- No modifica campos no permitidos.

#### Remove y recover

- Ejecuta soft delete.
- No devuelve registros eliminados en búsquedas normales.
- Recupera un Customer eliminado.
- Devuelve correctamente un Customer que no necesita recuperación, si esa es
  la convención adoptada por el módulo Business.
- Lanza `NotFoundException` cuando corresponde.

### 5.2 Pruebas unitarias del controlador

Verificar que cada endpoint delega al método correspondiente del servicio y
que pasa correctamente:

- DTOs.
- UUIDs.
- Query params.
- Código `204` en DELETE.

### 5.3 Prueba e2e

Crear `test/customer.e2e-spec.ts` con SQLite in-memory y ejecución secuencial,
siguiendo `test/jest-e2e.json`.

Flujo mínimo:

1. Crear Customer.
2. Verificar respuesta pública sin `password`.
3. Obtenerlo por ID.
4. Listarlo.
5. Filtrarlo por email o country.
6. Actualizarlo.
7. Eliminarlo lógicamente.
8. Confirmar que no aparece en listados normales.
9. Consultarlo con `withDeleted=true`.
10. Recuperarlo.
11. Confirmar que vuelve a aparecer.
12. Verificar conflicto de email.

No agregar pruebas de órdenes hasta que exista `OrdersModule`.

---

## 6. Contrato HTTP esperado

### Crear

`POST /customers`

```json
{
  "email": "cliente@example.com",
  "password": "CustomerPass123!",
  "name": "Ana",
  "lastname": "Pérez",
  "country": "El Salvador",
  "personal_address": "San Salvador"
}
```

La respuesta debe contener `id`, datos públicos y timestamps, pero no
`password`.

### Listar

```text
GET /customers
GET /customers?email=cliente@example.com
GET /customers?country=El%20Salvador
GET /customers?withDeleted=true
```

### Actualizar

`PATCH /customers/:id`

El body puede contener uno o varios campos editables. La contraseña, si se
actualiza, debe ser procesada con bcrypt antes de persistir.

---

## 7. Decisiones y puntos que deben confirmarse antes de codificar

Estas decisiones no bloquean la estructura general del plan, pero deben
confirmarse antes de implementar los DTOs y pruebas:

1. **Longitud mínima de password:** se recomienda mínimo 8 caracteres.
2. **Unicidad de email eliminado:** se recomienda mantener el email único
   también para registros soft-deleted, evitando duplicados ambiguos.
3. **Normalización de email:** se recomienda `trim()` y `toLowerCase()`.
4. **Búsqueda de nombre/country:** el patrón actual usa coincidencia exacta;
   mantenerlo en esta fase para no introducir una estrategia nueva.
5. **Eliminación futura de órdenes:** al crear `OrdersModule`, definir si un
   Customer con órdenes puede eliminarse lógicamente y no físicamente.

Si el equipo decide cambiar cualquiera de estos puntos, actualizar este plan
antes de implementar para que los DTOs, servicio y pruebas mantengan un único
contrato.

---

## 8. Validación final

Desde `yawi_api` ejecutar:

```powershell
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
```

La implementación solo se considera completa cuando:

- El build pasa sin errores TypeScript.
- Las pruebas unitarias y e2e pasan.
- Swagger expone `/customers`.
- Ninguna respuesta pública contiene `password`.
- Los registros se eliminan y recuperan mediante soft delete.
- No se modificaron frontend, n8n, auth ni módulos de negocio fuera de la
  integración mínima en `AppModule`.
