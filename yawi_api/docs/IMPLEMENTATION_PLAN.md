# Plan de Implementación — Módulos `vendors` y `phone-numbers`

Este plan de trabajo está diseñado con el detalle técnico y la secuencia exacta de pasos para que un agente de IA con nivel junior (o desarrollador) implemente las funcionalidades requeridas con calidad de nivel senior, bajo lineamientos de TDD, arquitectura modular de NestJS, TypeORM y Swagger.

---

## 1. Resumen Ejecutivo y Alcance

- **Módulo Database**: Conexión TypeORM a PostgreSQL (Supabase) con variables de entorno desde `.env.local`, soporte para SQLite en testing in-memory, auto-seeding al arrancar y script `migrate:fresh`.
- **Módulo Vendors**: Entidad, DTOs con validación, repositorio, servicio con 6 operaciones (create, list con filtros, show, update, delete lógico, recover) y controlador documentado en Swagger.
- **Módulo Phone Numbers**: Entidad con relación N:1 a Vendor, DTOs, repositorio, servicio con 6 operaciones y controlador documentado.
- **Transaccionalidad**: Creación atómica de `Vendor` + `PhoneNumber` inicial mediante `DataSource.transaction()`.
- **Testing**: Pruebas unitarias completas por módulo (≥ 3 tests por operación: happy path, excepción, caso límite) y prueba de integración e2e secuencial en SQLite in-memory (`better-sqlite3`).
- **Documentación & NFRs**: Documentación OpenAPI/Swagger enriquecida, archivo `DECISIONS.md` y `README.md` en carpetas relevantes.

---

## 2. Estructura de Directorios Final

```text
yawi_api/
├── src/
│   ├── database/
│   │   ├── database.module.ts            # TypeORM forRoot + servicio
│   │   ├── database.service.ts           # Métodos seed(), clear(), isDatabaseEmpty()
│   │   ├── clear-database.script.ts      # Script para npm run migrate:fresh
│   │   └── README.md
│   │
│   ├── vendors/
│   │   ├── entities/
│   │   │   └── vendor.entity.ts          # Entidad TypeORM con decoradores y Swagger
│   │   ├── dto/
│   │   │   ├── create-vendor.dto.ts      # Incluye campo phone_number
│   │   │   ├── update-vendor.dto.ts
│   │   │   └── filter-vendor.dto.ts      # Filtros para list (con withDeleted)
│   │   ├── vendors.controller.ts
│   │   ├── vendors.service.ts            # Lógica de negocio + transacciones + bcrypt
│   │   ├── vendors.module.ts
│   │   ├── vendors.controller.spec.ts    # Unit tests controller
│   │   ├── vendors.service.spec.ts       # Unit tests service (SQLite in-memory)
│   │   └── README.md
│   │
│   ├── phone-numbers/
│   │   ├── entities/
│   │   │   └── phone-number.entity.ts    # Entidad con FK owner_id y ManyToOne
│   │   ├── dto/
│   │   │   ├── create-phone-number.dto.ts
│   │   │   ├── update-phone-number.dto.ts
│   │   │   └── filter-phone-number.dto.ts
│   │   ├── phone-numbers.controller.ts
│   │   ├── phone-numbers.service.ts
│   │   ├── phone-numbers.module.ts
│   │   ├── phone-numbers.controller.spec.ts
│   │   ├── phone-numbers.service.spec.ts
│   │   └── README.md
│   │
│   ├── app.module.ts                    # Registra DatabaseModule, VendorsModule, PhoneNumbersModule
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.service.ts
│   └── main.ts                          # Swagger, GlobalValidationPipe, Auto-seeding check
│
├── test/
│   ├── vendor-phone_number.e2e-spec.ts # Test de integración e2e
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json                   # maxWorkers: 1 para secuencialidad
│
├── docs/
│   ├── IMPLEMENTATION_PLAN.md           # Este documento
│   ├── DECISIONS.md                     # Registro de decisiones arquitectónicas
│   └── README.md                        # Índice de documentación
│
├── package.json
└── tsconfig.json
```

---

## 3. Fases de Implementación Paso a Paso

### Fase 0: Instalación de Dependencias

Ejecutar en la raíz del proyecto `yawi_api`:

```bash
npm install @nestjs/typeorm typeorm pg @nestjs/swagger class-validator class-transformer bcrypt
npm install -D @types/bcrypt better-sqlite3 @types/better-sqlite3
```

---

### Fase 1: Módulo Database (`src/database/`)

#### 1.1. `src/database/database.module.ts`
- Utilizar `TypeOrmModule.forRootAsync()` consumiendo `ConfigService`.
- Variables leídas de `.env.local`:
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_NAME`
  - `DATABASE_USER`
  - `DATABASE_PASSWORD`
- Configurar:
  - `type: 'postgres'`
  - `autoLoadEntities: true` (para que los módulos individuales registren sus entidades con `.forFeature()`)
  - `synchronize: true`
- Proveer y exportar `DatabaseService`.

#### 1.2. `src/database/database.service.ts`
- Inyectar `DataSource` de TypeORM.
- **`isDatabaseEmpty(): Promise<boolean>`**:
  - Consulta `getRepository(Vendor).count()` (o `count({ withDeleted: true })`).
  - Retorna `true` si el conteo es 0.
- **`seed(): Promise<void>`**:
  - Inserta 3-5 vendors ficticios con contraseñas hasheadas (`bcrypt.hash`) y al menos un `PhoneNumber` asociado a cada uno.
  - Es idempotente (verifica primero con `isDatabaseEmpty()`).
- **`clear(): Promise<void>`**:
  - Trunca las tablas respetando la integridad referencial: primero `phone_numbers`, luego `vendors`.
  - En PostgreSQL puede utilizar: `TRUNCATE TABLE phone_numbers, vendors RESTART IDENTITY CASCADE`.
  - En SQLite (para testing): borra registros secuencialmente con `delete({})`.

#### 1.3. `src/database/clear-database.script.ts`
- Script standalone para invocar `DatabaseService.clear()`.
- Inicializa el contexto de NestJS con `NestFactory.createApplicationContext(AppModule)`.
- Ejecuta `app.get(DatabaseService).clear()`.
- Imprime log de éxito y finaliza el proceso con `process.exit(0)`.

#### 1.4. `src/database/README.md`
- Documentación del módulo de base de datos, explicación de auto-seeding y comando `npm run migrate:fresh`.

---

### Fase 2: Módulo Vendors — Entidad y DTOs

#### 2.1. Generar recurso base
```bash
npx nest g resource vendors --no-spec
```

#### 2.2. `src/vendors/entities/vendor.entity.ts`
- `@Entity('vendors')`
- `@PrimaryGeneratedColumn('uuid') id: string;`
- `@Column({ unique: true }) username: string;`
- `@Column() password: string;`
- `@Column() name: string;`
- `@Column() surname: string;`
- `@Column({ nullable: true }) lastname?: string;`
- `@Column({ nullable: true }) second_lastname?: string;`
- `@Column({ type: 'date' }) birthdate: Date;`
- `@Column() country: string;`
- `@Column() personal_address: string;`
- `@Column({ unique: true }) DUI: string;`
- `@Column({ unique: true }) NIT: string;`
- `@OneToMany(() => PhoneNumber, (phone) => phone.owner)`
  `phone_numbers: PhoneNumber[];`
- `@CreateDateColumn() createdAt: Date;`
- `@UpdateDateColumn() updatedAt: Date;`
- `@DeleteDateColumn() deletedAt: Date;` (Soft delete nativo)
- Añadir decoradores `@ApiProperty()` en cada campo para Swagger con descripciones y ejemplos.

#### 2.3. `src/vendors/dto/create-vendor.dto.ts`
- Validaciones con `class-validator` (`@IsString()`, `@IsNotEmpty()`, `@MinLength(8)`, `@IsDateString()`, `@IsOptional()`).
- Incluye `@ApiProperty()` en cada campo.
- Incluye `@IsString() @IsNotEmpty() phone_number: string;` (para crear el teléfono inicial).

#### 2.4. `src/vendors/dto/update-vendor.dto.ts`
- Extiende de `PartialType(OmitType(CreateVendorDto, ['phone_number'] as const))`.

#### 2.5. `src/vendors/dto/filter-vendor.dto.ts`
- Campos opcionales para filtros en endpoint `list`:
  - `name`, `surname`, `country`, `DUI`, `NIT`, `username`.
  - `withDeleted?: string` (`'true'` / `'false'`).
- Validaciones con `@IsOptional()`, `@IsString()`, `@IsBooleanString()`.

---

### Fase 3: Módulo Vendors — Servicio

#### `src/vendors/vendors.service.ts`
- Inyecciones:
  - `@InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>`
  - `private readonly dataSource: DataSource`
- Métodos:
  1. **`create(dto: CreateVendorDto): Promise<Vendor>`**:
     - Ejecuta dentro de `this.dataSource.transaction(async (manager) => { ... })`.
     - Hashea `dto.password` con `bcrypt.hash(dto.password, 10)`.
     - Crea y guarda la entidad `Vendor` mediante `manager.getRepository(Vendor).save(...)`.
     - Crea y guarda la entidad `PhoneNumber` con `owner_id = vendor.id` y `number = dto.phone_number` mediante `manager.getRepository(PhoneNumber).save(...)`.
     - Si ocurre un error, la transacción revierte automáticamente ambas operaciones.
  2. **`findAll(filters?: FilterVendorDto): Promise<Vendor[]>`**:
     - Construye `FindOptionsWhere<Vendor>` con los campos provistos.
     - Aplica `withDeleted: filters?.withDeleted === 'true'`.
     - Incluye relación `relations: { phone_numbers: true }`.
     - Retorna array de vendors.
  3. **`findOne(id: string): Promise<Vendor>`**:
     - Busca por ID con `withDeleted: true` o estándar, cargando relación `phone_numbers`.
     - Lanza `NotFoundException('Vendor not found')` si no existe.
  4. **`update(id: string, dto: UpdateVendorDto): Promise<Vendor>`**:
     - Verifica existencia previa con `this.findOne(id)`.
     - Si el DTO incluye `password`, hashea antes de guardar.
     - Actualiza con `this.vendorRepo.save({ ...vendor, ...dto })`.
  5. **`remove(id: string): Promise<void>`**:
     - Verifica existencia con `this.findOne(id)`.
     - Ejecuta `this.vendorRepo.softDelete(id)`.
  6. **`recover(id: string): Promise<Vendor>`**:
     - Verifica existencia incluyendo borrados (`withDeleted: true`).
     - Ejecuta `this.vendorRepo.restore(id)`.
     - Retorna el vendor restaurado.

---

### Fase 4: Módulo Vendors — Controlador y Módulo

#### 4.1. `src/vendors/vendors.controller.ts`
- Decoradores `@ApiTags('Vendors')` y `@Controller('vendors')`.
- Endpoints con `@ApiOperation` y `@ApiResponse`:
  - `POST /vendors` (status 201, 400, 409) → `create(@Body() dto: CreateVendorDto)`
  - `GET /vendors` (status 200) → `findAll(@Query() filters: FilterVendorDto)`
  - `GET /vendors/:id` (status 200, 404) → `findOne(@Param('id', ParseUUIDPipe) id: string)`
  - `PATCH /vendors/:id` (status 200, 404) → `update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVendorDto)`
  - `DELETE /vendors/:id` (status 200, 404) → `remove(@Param('id', ParseUUIDPipe) id: string)`
  - `PATCH /vendors/:id/recover` (status 200, 404) → `recover(@Param('id', ParseUUIDPipe) id: string)`

#### 4.2. `src/vendors/vendors.module.ts`
- `imports: [TypeOrmModule.forFeature([Vendor, PhoneNumber])]`
- `controllers: [VendorsController]`
- `providers: [VendorsService]`
- `exports: [VendorsService]`

---

### Fase 5: Módulo Phone Numbers (`src/phone-numbers/`)

#### 5.1. Generar recurso base
```bash
npx nest g resource phone-numbers --no-spec
```

#### 5.2. `src/phone-numbers/entities/phone-number.entity.ts`
- `@Entity('phone_numbers')`
- `@PrimaryGeneratedColumn('uuid') id: string;`
- `@Column() number: string;`
- `@Column() owner_id: string;` (Columna explícita)
- `@ManyToOne(() => Vendor, (vendor) => vendor.phone_numbers, { onDelete: 'CASCADE' })`
  `@JoinColumn({ name: 'owner_id' })`
  `owner: Vendor;`
- `@CreateDateColumn() createdAt: Date;`
- `@UpdateDateColumn() updatedAt: Date;`
- `@DeleteDateColumn() deletedAt: Date;`
- Decoradores Swagger `@ApiProperty()` en cada campo.

#### 5.3. `src/phone-numbers/dto/create-phone-number.dto.ts`
- `number: string;` (`@IsString()`, `@IsNotEmpty()`)
- `owner_id: string;` (`@IsUUID()`, `@IsNotEmpty()`)
- Decoradores `@ApiProperty()`.

#### 5.4. `src/phone-numbers/dto/update-phone-number.dto.ts`
- Extiende de `PartialType(OmitType(CreatePhoneNumberDto, ['owner_id'] as const))`.

#### 5.5. `src/phone-numbers/dto/filter-phone-number.dto.ts`
- `number?: string;`
- `owner_id?: string;`
- `withDeleted?: string;`

#### 5.6. `src/phone-numbers/phone-numbers.service.ts`
- Inyecciones: `@InjectRepository(PhoneNumber) private readonly phoneRepo: Repository<PhoneNumber>`, `@InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>`.
- Métodos:
  1. `create(dto: CreatePhoneNumberDto)`: Valida que `owner_id` pertenezca a un vendor existente (lanza `NotFoundException` si no).
  2. `findAll(filters?: FilterPhoneNumberDto)`: Filtros por `number`, `owner_id`, `withDeleted`.
  3. `findOne(id: string)`: Con relación `owner`.
  4. `update(id: string, dto: UpdatePhoneNumberDto)`.
  5. `remove(id: string)`: Soft delete (`softDelete(id)`).
  6. `recover(id: string)`: Restore (`restore(id)`).

#### 5.7. `src/phone-numbers/phone-numbers.controller.ts`
- Mapeo REST con decoradores Swagger:
  - `POST /phone-numbers`
  - `GET /phone-numbers`
  - `GET /phone-numbers/:id`
  - `PATCH /phone-numbers/:id`
  - `DELETE /phone-numbers/:id`
  - `PATCH /phone-numbers/:id/recover`

#### 5.8. `src/phone-numbers/phone-numbers.module.ts`
- `imports: [TypeOrmModule.forFeature([PhoneNumber, Vendor])]`
- `controllers: [PhoneNumbersController]`
- `providers: [PhoneNumbersService]`
- `exports: [PhoneNumbersService]`

---

### Fase 6: Integración en AppModule y Main

#### 6.1. `src/app.module.ts`
- Importar `DatabaseModule`, `VendorsModule`, `PhoneNumbersModule`.

#### 6.2. `src/main.ts`
- Activar `ValidationPipe` global con `whitelist: true`, `transform: true`.
- Configurar `SwaggerModule` con `DocumentBuilder` en la ruta `/api/docs`.
- Ejecutar verificación de base de datos vacía al arrancar: si `isDatabaseEmpty() === true`, ejecutar `DatabaseService.seed()`.

---

### Fase 7: Scripts en `package.json`

Agregar o actualizar en `yawi_api/package.json`:

```json
{
  "scripts": {
    "migrate:fresh": "ts-node src/database/clear-database.script.ts",
    "test:unit": "jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json --runInBand",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

---

### Fase 8: Testing Unitario (TDD con SQLite in-memory)

Configurar cada suite `.spec.ts` usando `better-sqlite3`:

```typescript
TypeOrmModule.forRoot({
  type: 'better-sqlite3',
  database: ':memory:',
  entities: [Vendor, PhoneNumber],
  synchronize: true,
})
```

#### Archivos de prueba:
1. `src/vendors/vendors.service.spec.ts` (≥ 3 tests por método: create, findAll, findOne, update, remove, recover).
2. `src/vendors/vendors.controller.spec.ts` (Pruebas unitarias de controladores con mocks).
3. `src/phone-numbers/phone-numbers.service.spec.ts` (≥ 3 tests por método).
4. `src/phone-numbers/phone-numbers.controller.spec.ts`.

---

### Fase 9: Test de Integración (`test/vendor-phone_number.e2e-spec.ts`)

Configurar en `test/jest-e2e.json`: `"maxWorkers": 1`.

#### Casos de prueba en `test/vendor-phone_number.e2e-spec.ts`:
1. `POST /vendors`: Crear Vendor con `phone_number` → 201, verificar creación en ambas tablas.
2. `GET /vendors`: Listar vendors → verifica que incluye array de `phone_numbers`.
3. `GET /vendors/:id`: Obtener vendor específico con sus teléfonos.
4. `POST /phone-numbers`: Agregar un segundo teléfono al vendor creado → 201.
5. `DELETE /vendors/:id`: Soft delete de vendor → 200, verificar que no aparece en listado normal pero sí con `withDeleted=true`.
6. `PATCH /vendors/:id/recover`: Restaurar vendor → 200, verificar que reaparece en listado normal.
7. `DELETE /phone-numbers/:id`: Soft delete del teléfono → 200.
8. `PATCH /phone-numbers/:id/recover`: Restaurar teléfono → 200.
9. **Transaccionalidad (Rollback test)**: Intentar crear vendor con datos inválidos o fallar deliberadamente la inserción de phone_number → verificar que no se crea ni el vendor ni el phone_number en la base de datos.

---

### Fase 10: Documentación y NFRs

1. `src/database/README.md`: Guía de conexión, seeding y reseteo de base de datos.
2. `src/vendors/README.md`: Arquitectura del módulo vendors, DTOs y endpoints.
3. `src/phone-numbers/README.md`: Arquitectura del módulo phone-numbers, relación con vendor y endpoints.
4. `docs/DECISIONS.md`: Registro completo de decisiones arquitectónicas (ADRs).
5. `docs/README.md`: Índice general de la documentación técnica.

---

## 4. Guía de Verificación y Criterios de Aceptación

1. **Compilación limpia**: `npm run build` sin errores de TypeScript ni decoradores.
2. **Pruebas unitarias**: `npm run test:unit` pasa al 100% con 0 fallos.
3. **Pruebas de integración**: `npm run test:e2e` pasa al 100% de manera secuencial y aislada.
4. **Documentación OpenAPI**: Al navegar a `http://localhost:3000/api/docs`, todos los endpoints deben tener tags, descripciones, schemas de DTOs y respuestas de ejemplo (200/201, 400, 404, 409).
5. **Seeding & Reset**:
   - `npm run migrate:fresh` limpia la base de datos por completo.
   - Al iniciar la aplicación con `npm run start:dev`, si la base de datos está vacía, se ejecuta el seeding automático.
