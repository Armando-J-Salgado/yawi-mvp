# Plan de Implementación M2 — Módulos `businesses` y `payment-preferences`

Este plan de trabajo está diseñado con el detalle técnico y la secuencia exacta de pasos para que un agente de IA con nivel junior (o desarrollador) implemente las funcionalidades requeridas de los módulos `businesses` y `payment-preferences` con calidad de nivel senior, bajo lineamientos de TDD, arquitectura modular de NestJS, TypeORM y Swagger.

---

## 1. Resumen Ejecutivo y Alcance

- **Módulo Businesses**: Entidad `Business` con relación `ManyToOne` a `Vendor`, DTOs con validación, repositorio, servicio con 6 operaciones (create, list con filtros, show, update, delete lógico, recover) y controlador documentado en Swagger.
- **Módulo Payment Preferences**: Entidad `PaymentPreference` con relación `ManyToOne` a `Vendor` y campo JSON nullable (`account_information`), DTOs, repositorio, servicio con 6 operaciones y controlador documentado.
- **Actualización de Vendor**: Agregar relaciones inversas `@OneToMany` para `businesses` y `payment_preferences` en la entidad `Vendor`.
- **Actualización de DatabaseService**: Ampliar `seed()` con datos de `Business` y `PaymentPreference`, y `clear()` con las nuevas tablas.
- **Actualización de Swagger**: Agregar tags `Businesses` y `Payment Preferences` en `main.ts`.
- **Testing**: Pruebas unitarias completas por módulo (≥ 3 tests por operación) y pruebas de integración e2e secuenciales para `business-vendor` y `payment_preference-vendor` en SQLite in-memory (`better-sqlite3`).
- **Documentación & NFRs**: README.md en carpetas creadas, actualización de `DECISIONS.md`.

### Fuera del Alcance

- Autenticación y autorización (Guards).
- Política CORS.

---

## 2. Decisiones Arquitectónicas Tomadas

Las siguientes decisiones se agregarán a `docs/DECISIONS.md` al finalizar la implementación:

| # | Decisión | Justificación |
|---|----------|---------------|
| **ADR-013** | `decimal(10,2)` para columna `balance` en Business | Evita errores de punto flotante (`0.1 + 0.2 ≠ 0.3` en `float`). Precisión exacta requerida para operaciones financieras en USD. |
| **ADR-014** | `balance` con default `0.00` y validación `@Min(0)` en DTO | Valor por defecto coherente para negocios nuevos. `@Min(0)` previene balances negativos desde el DTO. |
| **ADR-015** | `simple-json` para `account_information` en PaymentPreference | Serializa como string en SQLite (testing) y como JSON nativo en PostgreSQL (producción). Garantiza compatibilidad dual sin configuración extra. |
| **ADR-016** | Relaciones inversas `@OneToMany` en Vendor para Business y PaymentPreference | Permite cargar businesses y payment_preferences desde Vendor con `relations: {}` sin necesidad de joins manuales. Consistente con el patrón de `phone_numbers`. |
| **ADR-017** | Patrón `PhoneNumbersService` replicado para Businesses y PaymentPreferences | Ambos módulos siguen la misma estructura: validación de `owner_id` contra `Vendor`, repositorio inyectado con `@InjectRepository`, sin transacciones complejas. Facilita mantenimiento por consistencia. |

---

## 3. Estructura de Directorios Final (Post-Implementación)

```text
yawi_api/
├── src/
│   ├── database/
│   │   ├── database.module.ts            # (SIN CAMBIOS en estructura)
│   │   ├── database.service.ts           # [MODIFICAR] Agregar seed/clear para Business y PaymentPreference
│   │   ├── clear-database.script.ts
│   │   └── README.md                     # [MODIFICAR] Documentar nuevas entidades en seed
│   │
│   ├── vendors/
│   │   ├── entities/
│   │   │   └── vendor.entity.ts          # [MODIFICAR] Agregar @OneToMany para businesses y payment_preferences
│   │   ├── dto/                          # (SIN CAMBIOS)
│   │   ├── vendors.controller.ts         # (SIN CAMBIOS)
│   │   ├── vendors.service.ts            # (SIN CAMBIOS)
│   │   ├── vendors.module.ts             # (SIN CAMBIOS)
│   │   ├── vendors.controller.spec.ts    # (SIN CAMBIOS)
│   │   ├── vendors.service.spec.ts       # (SIN CAMBIOS)
│   │   └── README.md                     # [MODIFICAR] Documentar nuevas relaciones
│   │
│   ├── phone-numbers/                    # (SIN CAMBIOS)
│   │
│   ├── businesses/                       # [NUEVO] Módulo completo
│   │   ├── entities/
│   │   │   └── business.entity.ts
│   │   ├── dto/
│   │   │   ├── create-business.dto.ts
│   │   │   ├── update-business.dto.ts
│   │   │   └── filter-business.dto.ts
│   │   ├── businesses.controller.ts
│   │   ├── businesses.service.ts
│   │   ├── businesses.module.ts
│   │   ├── businesses.controller.spec.ts
│   │   ├── businesses.service.spec.ts
│   │   └── README.md
│   │
│   ├── payment-preferences/              # [NUEVO] Módulo completo
│   │   ├── entities/
│   │   │   └── payment-preference.entity.ts
│   │   ├── dto/
│   │   │   ├── create-payment-preference.dto.ts
│   │   │   ├── update-payment-preference.dto.ts
│   │   │   └── filter-payment-preference.dto.ts
│   │   ├── payment-preferences.controller.ts
│   │   ├── payment-preferences.service.ts
│   │   ├── payment-preferences.module.ts
│   │   ├── payment-preferences.controller.spec.ts
│   │   ├── payment-preferences.service.spec.ts
│   │   └── README.md
│   │
│   ├── app.module.ts                    # [MODIFICAR] Registrar BusinessesModule y PaymentPreferencesModule
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.service.ts
│   └── main.ts                          # [MODIFICAR] Agregar tags Swagger para Businesses y Payment Preferences
│
├── test/
│   ├── vendor-phone_number.e2e-spec.ts  # (SIN CAMBIOS)
│   ├── business-vendor.e2e-spec.ts      # [NUEVO] Test de integración
│   ├── payment_preference-vendor.e2e-spec.ts  # [NUEVO] Test de integración
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json                    # (SIN CAMBIOS, maxWorkers: 1 ya configurado)
│
├── docs/
│   ├── IMPLEMENTATION_PLAN.md           # (SIN CAMBIOS)
│   ├── IMPLEMENTATION_PLAN_M2.md        # [NUEVO] Este documento
│   ├── DECISIONS.md                     # [MODIFICAR] Agregar ADR-013 a ADR-017
│   └── README.md
│
├── package.json                         # (SIN CAMBIOS — todas las dependencias ya están instaladas)
└── tsconfig.json
```

---

## 4. Prerequisitos y Verificación del Entorno

Antes de comenzar, verificar que todas las dependencias necesarias **ya están instaladas** en `package.json`:

| Dependencia | Versión actual | Uso |
|-------------|---------------|-----|
| `@nestjs/typeorm` | ^11.0.3 | `TypeOrmModule.forFeature()` |
| `typeorm` | ^0.3.31 | Entidades, repositorios, decoradores |
| `@nestjs/swagger` | ^11.4.7 | Documentación OpenAPI |
| `class-validator` | ^0.15.1 | Validación de DTOs |
| `class-transformer` | ^0.5.1 | Transformación de DTOs |
| `better-sqlite3` (dev) | ^12.11.1 | Testing in-memory |
| `jest` (dev) | ^30.0.0 | Test runner |
| `supertest` (dev) | ^7.0.0 | Tests e2e HTTP |

> **No se requiere `npm install` adicional.** Todas las dependencias del M1 son suficientes.

---

## 5. Fases de Implementación Paso a Paso

### Fase 1: Generación de Recursos Base (CLI)

Ejecutar desde la raíz `yawi_api/`:

```bash
npx nest g resource businesses --no-spec
npx nest g resource payment-preferences --no-spec
```

> **IMPORTANTE**: El flag `--no-spec` evita generar archivos de test por defecto. Los archivos `.spec.ts` se crearán manualmente con la estructura correcta.

Después de ejecutar los comandos, el CLI generará la estructura en `src/businesses/` y `src/payment-preferences/` y registrará automáticamente los módulos en `app.module.ts`. **Verificar** que `app.module.ts` contenga ambos módulos importados.

**Acción de limpieza**: Eliminar el contenido boilerplate generado por el CLI en los archivos de entidad, servicio, controlador, DTOs y módulo. Serán reemplazados en las fases siguientes con la implementación específica.

---

### Fase 2: Entidad Business (`src/businesses/entities/business.entity.ts`)

#### Archivo: `src/businesses/entities/business.entity.ts`

Definir la entidad con los siguientes campos y decoradores:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity('businesses')
export class Business {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Tienda El Buen Precio',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Descripción del negocio',
    example: 'Tienda de artículos para el hogar con envío a domicilio.',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Dirección física del negocio',
    example: 'Av. Independencia #456, Centro Histórico, San Salvador',
  })
  @Column()
  address: string;

  @ApiProperty({
    description: 'Balance actual del negocio en USD (precisión decimal 10,2)',
    example: 1500.50,
    default: 0.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @ApiProperty({
    description: 'ID del Vendor propietario (Foreign Key UUID)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @Column()
  owner_id: string;

  @ApiProperty({
    description: 'Entidad Vendor propietaria',
    type: () => Vendor,
  })
  @ManyToOne(() => Vendor, (vendor) => vendor.businesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Vendor;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-09-23T15:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-09-23T15:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación lógica (Soft Delete)',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
```

**Notas clave**:
- `balance` usa `decimal(10,2)` para precisión financiera exacta (ADR-013). El default es `0.0` (ADR-014).
- `owner_id` es una columna explícita para permitir filtros directos sin joins (consistente con ADR-005).
- `@ManyToOne` con `onDelete: 'CASCADE'` — si el vendor se elimina físicamente, los negocios asociados también se eliminan. (Solo aplica a eliminación física; el soft delete no activa CASCADE.)
- `@JoinColumn({ name: 'owner_id' })` vincula la relación con la columna explícita.

---

### Fase 3: Entidad PaymentPreference (`src/payment-preferences/entities/payment-preference.entity.ts`)

#### Archivo: `src/payment-preferences/entities/payment-preference.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity('payment_preferences')
export class PaymentPreference {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la preferencia de pago',
    example: 'Transferencia Banco Agrícola',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Información de la cuenta en formato JSON (puede ser null)',
    example: { bank: 'Banco Agrícola', account_number: '1234567890', type: 'Ahorro' },
    nullable: true,
    required: false,
  })
  @Column({ type: 'simple-json', nullable: true })
  account_information: Record<string, any> | null;

  @ApiProperty({
    description: 'ID del Vendor propietario (Foreign Key UUID)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @Column()
  owner_id: string;

  @ApiProperty({
    description: 'Entidad Vendor propietaria',
    type: () => Vendor,
  })
  @ManyToOne(() => Vendor, (vendor) => vendor.payment_preferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Vendor;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-09-23T15:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-09-23T15:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación lógica (Soft Delete)',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
```

**Notas clave**:
- `account_information` usa `simple-json` (ADR-015): almacena como `TEXT` en SQLite y como `JSON` en PostgreSQL, con serialización/deserialización automática.
- Es `nullable: true` según el requerimiento funcional.
- El tipo TypeScript es `Record<string, any> | null`.

---

### Fase 4: Actualizar Entidad Vendor con Relaciones Inversas

#### Archivo a modificar: `src/vendors/entities/vendor.entity.ts`

Agregar los siguientes imports y propiedades. **NO eliminar** ningún import ni propiedad existente.

**Agregar al bloque de imports existente:**
```typescript
import { Business } from '../../businesses/entities/business.entity';
import { PaymentPreference } from '../../payment-preferences/entities/payment-preference.entity';
```

**Agregar DESPUÉS de la propiedad `phone_numbers` (línea ~108) y ANTES de `createdAt`:**
```typescript
  @ApiProperty({
    description: 'Lista de negocios asociados al vendedor',
    type: () => [Business],
  })
  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];

  @ApiProperty({
    description: 'Lista de preferencias de pago del vendedor',
    type: () => [PaymentPreference],
  })
  @OneToMany(() => PaymentPreference, (pref) => pref.owner)
  payment_preferences: PaymentPreference[];
```

**Verificar** que los imports de `OneToMany` ya existen en la entidad (están en línea 8 del archivo actual).

---

### Fase 5: DTOs del Módulo Businesses

#### 5.1. `src/businesses/dto/create-business.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Tienda El Buen Precio',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  name: string;

  @ApiProperty({
    description: 'Descripción del negocio',
    example: 'Tienda de artículos para el hogar con envío a domicilio.',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción del negocio es requerida' })
  description: string;

  @ApiProperty({
    description: 'Dirección física del negocio',
    example: 'Av. Independencia #456, Centro Histórico, San Salvador',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección del negocio es requerida' })
  address: string;

  @ApiProperty({
    description: 'Balance inicial del negocio en USD (mínimo 0)',
    example: 0.0,
    default: 0.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El balance debe ser un número' })
  @Min(0, { message: 'El balance no puede ser negativo' })
  balance?: number;

  @ApiProperty({
    description: 'UUID del Vendor propietario',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsUUID('4', { message: 'El owner_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El owner_id es requerido' })
  owner_id: string;
}
```

**Notas**:
- `balance` es opcional en create (el default de la columna es `0.00`).
- `balance` incluye `@Min(0)` según ADR-014.
- `owner_id` se valida como UUID v4.

#### 5.2. `src/businesses/dto/update-business.dto.ts`

```typescript
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';

/**
 * DTO para actualización parcial de Business.
 * Omite `owner_id` ya que el propietario no es modificable después de la creación.
 */
export class UpdateBusinessDto extends PartialType(
  OmitType(CreateBusinessDto, ['owner_id'] as const),
) {}
```

**Nota**: `owner_id` se omite del update — un negocio no puede cambiar de propietario.

#### 5.3. `src/businesses/dto/filter-business.dto.ts`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBooleanString, IsUUID } from 'class-validator';

export class FilterBusinessDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre exacto del negocio',
    example: 'Tienda El Buen Precio',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por dirección exacta',
    example: 'Av. Independencia #456',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID del propietario (Vendor)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsOptional()
  @IsUUID('4')
  owner_id?: string;

  @ApiPropertyOptional({
    description: 'Incluir registros eliminados lógicamente (Soft Delete)',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsBooleanString()
  withDeleted?: string;
}
```

---

### Fase 6: DTOs del Módulo Payment Preferences

#### 6.1. `src/payment-preferences/dto/create-payment-preference.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreatePaymentPreferenceDto {
  @ApiProperty({
    description: 'Nombre descriptivo de la preferencia de pago',
    example: 'Transferencia Banco Agrícola',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la preferencia de pago es requerido' })
  name: string;

  @ApiProperty({
    description: 'Información de la cuenta en formato JSON (opcional, puede ser null)',
    example: { bank: 'Banco Agrícola', account_number: '1234567890', type: 'Ahorro' },
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'account_information debe ser un objeto JSON válido' })
  account_information?: Record<string, any> | null;

  @ApiProperty({
    description: 'UUID del Vendor propietario',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsUUID('4', { message: 'El owner_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El owner_id es requerido' })
  owner_id: string;
}
```

#### 6.2. `src/payment-preferences/dto/update-payment-preference.dto.ts`

```typescript
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePaymentPreferenceDto } from './create-payment-preference.dto';

/**
 * DTO para actualización parcial de PaymentPreference.
 * Omite `owner_id` ya que el propietario no es modificable después de la creación.
 */
export class UpdatePaymentPreferenceDto extends PartialType(
  OmitType(CreatePaymentPreferenceDto, ['owner_id'] as const),
) {}
```

#### 6.3. `src/payment-preferences/dto/filter-payment-preference.dto.ts`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBooleanString, IsUUID } from 'class-validator';

export class FilterPaymentPreferenceDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre exacto de la preferencia',
    example: 'Transferencia Banco Agrícola',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID del propietario (Vendor)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsOptional()
  @IsUUID('4')
  owner_id?: string;

  @ApiPropertyOptional({
    description: 'Incluir registros eliminados lógicamente (Soft Delete)',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsBooleanString()
  withDeleted?: string;
}
```

---

### Fase 7: Servicio Businesses (`src/businesses/businesses.service.ts`)

Seguir el **patrón exacto** de `src/phone-numbers/phone-numbers.service.ts` (archivo de referencia).

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  /**
   * Crea un nuevo Business verificando previamente la existencia del Vendor propietario.
   */
  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const { owner_id } = createBusinessDto;

    const vendor = await this.vendorRepository.findOne({
      where: { id: owner_id },
    });

    if (!vendor) {
      throw new NotFoundException(
        `No se puede crear el negocio: Vendor con ID '${owner_id}' no encontrado.`,
      );
    }

    const business = this.businessRepository.create(createBusinessDto);
    const savedBusiness = await this.businessRepository.save(business);

    return (await this.businessRepository.findOne({
      where: { id: savedBusiness.id },
      relations: { owner: true },
    }))!;
  }

  /**
   * Lista negocios con filtros opcionales y soporte para soft delete.
   */
  async findAll(filters?: FilterBusinessDto): Promise<Business[]> {
    const where: FindOptionsWhere<Business> = {};

    if (filters?.name) where.name = filters.name;
    if (filters?.address) where.address = filters.address;
    if (filters?.owner_id) where.owner_id = filters.owner_id;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.businessRepository.find({
      where,
      withDeleted,
      relations: {
        owner: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna un Business por ID con su Vendor propietario.
   */
  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business con ID '${id}' no encontrado.`);
    }

    return business;
  }

  /**
   * Actualiza los datos de un Business parcialmente.
   */
  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    const business = await this.findOne(id);

    await this.businessRepository.save({
      ...business,
      ...updateBusinessDto,
    });

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de un Business.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.businessRepository.softDelete(id);
  }

  /**
   * Recupera un Business previamente eliminado de forma lógica.
   */
  async recover(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        owner: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business con ID '${id}' no encontrado.`);
    }

    if (!business.deletedAt) {
      return business;
    }

    await this.businessRepository.restore(id);

    return await this.findOne(id);
  }
}
```

---

### Fase 8: Servicio Payment Preferences (`src/payment-preferences/payment-preferences.service.ts`)

Mismo patrón que `BusinessesService`. Diferencia clave: `account_information` es JSON nullable.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PaymentPreference } from './entities/payment-preference.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreatePaymentPreferenceDto } from './dto/create-payment-preference.dto';
import { UpdatePaymentPreferenceDto } from './dto/update-payment-preference.dto';
import { FilterPaymentPreferenceDto } from './dto/filter-payment-preference.dto';

@Injectable()
export class PaymentPreferencesService {
  constructor(
    @InjectRepository(PaymentPreference)
    private readonly paymentPreferenceRepository: Repository<PaymentPreference>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  /**
   * Crea una nueva PaymentPreference verificando previamente la existencia del Vendor propietario.
   */
  async create(
    createPaymentPreferenceDto: CreatePaymentPreferenceDto,
  ): Promise<PaymentPreference> {
    const { owner_id } = createPaymentPreferenceDto;

    const vendor = await this.vendorRepository.findOne({
      where: { id: owner_id },
    });

    if (!vendor) {
      throw new NotFoundException(
        `No se puede crear la preferencia de pago: Vendor con ID '${owner_id}' no encontrado.`,
      );
    }

    const preference = this.paymentPreferenceRepository.create(
      createPaymentPreferenceDto,
    );
    const saved = await this.paymentPreferenceRepository.save(preference);

    return (await this.paymentPreferenceRepository.findOne({
      where: { id: saved.id },
      relations: { owner: true },
    }))!;
  }

  /**
   * Lista preferencias de pago con filtros opcionales y soporte para soft delete.
   */
  async findAll(
    filters?: FilterPaymentPreferenceDto,
  ): Promise<PaymentPreference[]> {
    const where: FindOptionsWhere<PaymentPreference> = {};

    if (filters?.name) where.name = filters.name;
    if (filters?.owner_id) where.owner_id = filters.owner_id;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.paymentPreferenceRepository.find({
      where,
      withDeleted,
      relations: {
        owner: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna una PaymentPreference por ID con su Vendor propietario.
   */
  async findOne(id: string): Promise<PaymentPreference> {
    const preference = await this.paymentPreferenceRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `PaymentPreference con ID '${id}' no encontrada.`,
      );
    }

    return preference;
  }

  /**
   * Actualiza los datos de una PaymentPreference parcialmente.
   */
  async update(
    id: string,
    updatePaymentPreferenceDto: UpdatePaymentPreferenceDto,
  ): Promise<PaymentPreference> {
    const preference = await this.findOne(id);

    await this.paymentPreferenceRepository.save({
      ...preference,
      ...updatePaymentPreferenceDto,
    });

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de una PaymentPreference.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.paymentPreferenceRepository.softDelete(id);
  }

  /**
   * Recupera una PaymentPreference previamente eliminada de forma lógica.
   */
  async recover(id: string): Promise<PaymentPreference> {
    const preference = await this.paymentPreferenceRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        owner: true,
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `PaymentPreference con ID '${id}' no encontrada.`,
      );
    }

    if (!preference.deletedAt) {
      return preference;
    }

    await this.paymentPreferenceRepository.restore(id);

    return await this.findOne(id);
  }
}
```

---

### Fase 9: Controlador Businesses (`src/businesses/businesses.controller.ts`)

Seguir el **patrón exacto** de `src/phone-numbers/phone-numbers.controller.ts`.

Cada operación incluye decoradores Swagger completos (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiParam`):

| Método | Endpoint | Status Codes | Descripción Swagger |
|--------|----------|-------------|---------------------|
| `POST` | `/businesses` | 201, 400, 404 | Crear un nuevo negocio asociado a un Vendor |
| `GET` | `/businesses` | 200 | Listar negocios con filtros opcionales |
| `GET` | `/businesses/:id` | 200, 400, 404 | Obtener el detalle de un negocio por ID |
| `PATCH` | `/businesses/:id` | 200, 400, 404 | Actualizar parcialmente un negocio |
| `DELETE` | `/businesses/:id` | 204, 400, 404 | Eliminar un negocio lógicamente (Soft Delete) |
| `PATCH` | `/businesses/:id/recover` | 200, 400, 404 | Restaurar un negocio eliminado lógicamente |

**Implementación del controlador:**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';
import { Business } from './entities/business.entity';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo negocio asociado a un Vendor',
    description:
      'Registra un nuevo negocio en la base de datos vinculado al Vendor especificado por owner_id.',
  })
  @ApiResponse({
    status: 201,
    description: 'Negocio creado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o faltantes en el DTO.',
  })
  @ApiResponse({
    status: 404,
    description: 'El Vendor especificado en owner_id no existe.',
  })
  async create(@Body() createBusinessDto: CreateBusinessDto): Promise<Business> {
    return await this.businessesService.create(createBusinessDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar negocios con filtros opcionales',
    description:
      'Retorna la lista de negocios ordenados por fecha de creación. Permite filtrar por campos y opcionalmente incluir registros eliminados (soft delete).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de negocios obtenida exitosamente.',
    type: [Business],
  })
  async findAll(@Query() filters: FilterBusinessDto): Promise<Business[]> {
    return await this.businessesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un negocio por ID',
    description: 'Retorna un negocio específico junto con su propietario (Vendor).',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio encontrado con éxito.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Business> {
    return await this.businessesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un negocio',
    description: 'Actualiza uno o varios campos del negocio.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio actualizado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    return await this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un negocio lógicamente (Soft Delete)',
    description:
      'Marca el registro como eliminado estableciendo la marca de tiempo deletedAt sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio a eliminar',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 204,
    description: 'Negocio eliminado lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.businessesService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar un negocio eliminado lógicamente',
    description:
      'Restaura un negocio que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio a restaurar',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio restaurado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<Business> {
    return await this.businessesService.recover(id);
  }
}
```

---

### Fase 10: Controlador Payment Preferences (`src/payment-preferences/payment-preferences.controller.ts`)

Idéntica estructura al controlador de Businesses. Endpoints:

| Método | Endpoint | Status Codes | Descripción Swagger |
|--------|----------|-------------|---------------------|
| `POST` | `/payment-preferences` | 201, 400, 404 | Crear una nueva preferencia de pago |
| `GET` | `/payment-preferences` | 200 | Listar preferencias de pago con filtros |
| `GET` | `/payment-preferences/:id` | 200, 400, 404 | Detalle de una preferencia de pago |
| `PATCH` | `/payment-preferences/:id` | 200, 400, 404 | Actualización parcial |
| `DELETE` | `/payment-preferences/:id` | 204, 400, 404 | Soft Delete |
| `PATCH` | `/payment-preferences/:id/recover` | 200, 400, 404 | Restaurar eliminada |

Usar como referencia el código del controlador de Businesses (Fase 9), reemplazando:
- `@ApiTags('Payment Preferences')`
- `@Controller('payment-preferences')`
- Servicio: `PaymentPreferencesService`
- DTOs: `CreatePaymentPreferenceDto`, `UpdatePaymentPreferenceDto`, `FilterPaymentPreferenceDto`
- Entidad: `PaymentPreference`
- Mensajes: Adaptar a "preferencia de pago" en las descripciones Swagger

---

### Fase 11: Módulos NestJS

#### 11.1. `src/businesses/businesses.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Vendor])],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
```

#### 11.2. `src/payment-preferences/payment-preferences.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPreferencesService } from './payment-preferences.service';
import { PaymentPreferencesController } from './payment-preferences.controller';
import { PaymentPreference } from './entities/payment-preference.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentPreference, Vendor])],
  controllers: [PaymentPreferencesController],
  providers: [PaymentPreferencesService],
  exports: [PaymentPreferencesService],
})
export class PaymentPreferencesModule {}
```

---

### Fase 12: Integración en AppModule y Main

#### 12.1. `src/app.module.ts`

Verificar que después de ejecutar `nest g resource`, el archivo incluya `BusinessesModule` y `PaymentPreferencesModule` en el array `imports`. Si no, agregarlos manualmente:

```typescript
import { BusinessesModule } from './businesses/businesses.module';
import { PaymentPreferencesModule } from './payment-preferences/payment-preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    VendorsModule,
    PhoneNumbersModule,
    BusinessesModule,          // [NUEVO]
    PaymentPreferencesModule,  // [NUEVO]
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 12.2. `src/main.ts`

Agregar los nuevos tags de Swagger en la configuración del `DocumentBuilder`. Modificar la sección del `DocumentBuilder` existente:

```typescript
const config = new DocumentBuilder()
    .setTitle('YAWI API')
    .setDescription(
      'Documentación interactiva de la API de YAWI — Módulos Vendors, Phone Numbers, Businesses y Payment Preferences.',
    )
    .setVersion('1.0')
    .addTag('Vendors', 'Operaciones para la gestión de vendedores')
    .addTag(
      'Phone Numbers',
      'Operaciones para la gestión de números telefónicos',
    )
    .addTag('Businesses', 'Operaciones para la gestión de negocios')         // [NUEVO]
    .addTag(                                                                  // [NUEVO]
      'Payment Preferences',                                                  // [NUEVO]
      'Operaciones para la gestión de preferencias de pago',                 // [NUEVO]
    )                                                                         // [NUEVO]
    .build();
```

---

### Fase 13: Actualizar DatabaseService (Seed y Clear)

#### Archivo a modificar: `src/database/database.service.ts`

**13.1. Agregar imports (al inicio del archivo):**

```typescript
import { Business } from '../businesses/entities/business.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
```

**13.2. Ampliar método `seed()`:**

Después del bucle que crea vendors y phones (línea ~98), y **dentro** de la misma transacción, agregar:

```typescript
      const businessRepo = manager.getRepository(Business);
      const prefRepo = manager.getRepository(PaymentPreference);

      // Obtener los vendors recién creados para asociarles datos
      const allVendors = await vendorRepo.find();

      // Seed de Businesses (2 por los primeros 2 vendors)
      const businessesData = [
        {
          name: 'Tienda El Buen Precio',
          description: 'Tienda de artículos para el hogar con envío a domicilio.',
          address: 'Av. Independencia #456, Centro Histórico, San Salvador',
          balance: 2500.00,
          owner_id: allVendors[0].id,
        },
        {
          name: 'Café Don Carlos',
          description: 'Cafetería artesanal con granos de origen salvadoreño.',
          address: 'Colonia San Benito, Calle La Reforma #78, San Salvador',
          balance: 800.50,
          owner_id: allVendors[0].id,
        },
        {
          name: 'Florería María',
          description: 'Arreglos florales y decoración para eventos.',
          address: 'Centro Comercial Metrocentro, Local B-12, Santa Tecla',
          balance: 1200.00,
          owner_id: allVendors[1].id,
        },
      ];

      for (const bData of businessesData) {
        const business = businessRepo.create(bData);
        await businessRepo.save(business);
      }

      // Seed de Payment Preferences (1 por cada vendor)
      const preferencesData = [
        {
          name: 'Transferencia Banco Agrícola',
          account_information: { bank: 'Banco Agrícola', account_number: '1234567890', type: 'Ahorro' },
          owner_id: allVendors[0].id,
        },
        {
          name: 'Pago Móvil Tigo Money',
          account_information: { provider: 'Tigo Money', phone: '+503 7890-1234' },
          owner_id: allVendors[1].id,
        },
        {
          name: 'Depósito en efectivo',
          account_information: null,
          owner_id: allVendors[2].id,
        },
      ];

      for (const pData of preferencesData) {
        const pref = prefRepo.create(pData);
        await prefRepo.save(pref);
      }
```

**13.3. Actualizar mensaje final de `seed()`:**

```typescript
    this.logger.log(
      '✅ Database seeded successfully with 3 vendors, phone numbers, 3 businesses, and 3 payment preferences.',
    );
```

**13.4. Ampliar método `clear()`:**

Actualizar para incluir las nuevas tablas. Respetar el orden de integridad referencial (hijos primero):

**Caso PostgreSQL (dentro del bloque `if (dbType === 'postgres')`):**
```typescript
await queryRunner.query(
  'TRUNCATE TABLE "payment_preferences", "businesses", "phone_numbers", "vendors" RESTART IDENTITY CASCADE;',
);
```

**Caso SQLite / fallback (dentro del bloque `else`):**
```typescript
const prefRepo = this.dataSource.getRepository(PaymentPreference);
const businessRepo = this.dataSource.getRepository(Business);
const phoneRepo = this.dataSource.getRepository(PhoneNumber);
const vendorRepo = this.dataSource.getRepository(Vendor);
await prefRepo.createQueryBuilder().delete().execute();
await businessRepo.createQueryBuilder().delete().execute();
await phoneRepo.createQueryBuilder().delete().execute();
await vendorRepo.createQueryBuilder().delete().execute();
```

---

### Fase 14: Testing Unitario — Businesses

#### 14.1. `src/businesses/businesses.service.spec.ts`

Configuración del test module (misma estructura que `vendors.service.spec.ts`):

```typescript
TypeOrmModule.forRoot({
  type: 'better-sqlite3',
  database: ':memory:',
  entities: [Business, Vendor, PhoneNumber, PaymentPreference],
  synchronize: true,
}),
TypeOrmModule.forFeature([Business, Vendor]),
```

> **IMPORTANTE**: Incluir `PhoneNumber` y `PaymentPreference` en `entities` ya que `Vendor` tiene relaciones `@OneToMany` con ambas, y TypeORM necesita conocerlas para crear el schema correctamente en SQLite.

**Mock data de vendor** para usarse como propietario en las pruebas:
```typescript
// Dentro de beforeEach o beforeAll, crear un vendor auxiliar directamente con el repositorio:
const vendorRepo = dataSource.getRepository(Vendor);
const testVendor = vendorRepo.create({
  username: 'vendor_test',
  password: 'hashed_password',
  name: 'Test',
  surname: 'Vendor',
  birthdate: new Date('1990-01-01'),
  country: 'El Salvador',
  personal_address: 'Test Address #123',
  DUI: '99999999-0',
  NIT: '0000-000000-000-0',
});
const savedVendor = await vendorRepo.save(testVendor);
```

**Casos de prueba mínimos (≥ 3 por operación):**

| Operación | Test # | Tipo | Descripción |
|-----------|--------|------|-------------|
| `create()` | 1 | Happy Path | Crea un Business con datos válidos y verifica propiedades |
| `create()` | 2 | Excepción | Lanza `NotFoundException` si `owner_id` no existe |
| `create()` | 3 | Caso Límite | Crea con `balance` omitido y verifica que el default es `0` |
| `findAll()` | 1 | Happy Path | Retorna la lista de businesses con relación `owner` |
| `findAll()` | 2 | Caso Límite | Retorna array vacío si no hay registros |
| `findAll()` | 3 | Filtros | Filtra correctamente por `owner_id` y `name` |
| `findOne()` | 1 | Happy Path | Retorna el business con su owner |
| `findOne()` | 2 | Excepción | Lanza `NotFoundException` si UUID no existe |
| `findOne()` | 3 | Caso Límite | Incluye la relación `owner` correctamente |
| `update()` | 1 | Happy Path | Actualiza `name` y `description` correctamente |
| `update()` | 2 | Excepción | Lanza `NotFoundException` al actualizar business inexistente |
| `update()` | 3 | Caso Límite | Actualiza `balance` y verifica la nueva cantidad |
| `remove()` | 1 | Happy Path | Aplica soft delete; no aparece en findAll normal |
| `remove()` | 2 | Excepción | Lanza `NotFoundException` si el business no existe |
| `remove()` | 3 | Caso Límite | Aparece en findAll con `withDeleted: 'true'` y `deletedAt` no es null |
| `recover()` | 1 | Happy Path | Restaura un business soft-deleted; reaparece en findAll |
| `recover()` | 2 | Excepción | Lanza `NotFoundException` si el ID no existe |
| `recover()` | 3 | Caso Límite | Si el business no está eliminado, lo retorna sin cambios |

#### 14.2. `src/businesses/businesses.controller.spec.ts`

Usar **mocks del servicio** (misma estructura que `vendors.controller.spec.ts`):

```typescript
const mockBusinessesService = {
  create: jest.fn().mockResolvedValue(mockBusiness),
  findAll: jest.fn().mockResolvedValue([mockBusiness]),
  findOne: jest.fn().mockImplementation((id: string) => {
    if (id === mockBusiness.id) return Promise.resolve(mockBusiness);
    throw new NotFoundException('Business not found');
  }),
  update: jest.fn().mockImplementation((id: string, dto: UpdateBusinessDto) => {
    if (id === mockBusiness.id)
      return Promise.resolve({ ...mockBusiness, ...dto });
    throw new NotFoundException('Business not found');
  }),
  remove: jest.fn().mockImplementation((id: string) => {
    if (id === mockBusiness.id) return Promise.resolve();
    throw new NotFoundException('Business not found');
  }),
  recover: jest.fn().mockImplementation((id: string) => {
    if (id === mockBusiness.id) return Promise.resolve(mockBusiness);
    throw new NotFoundException('Business not found');
  }),
};
```

Pruebas del controlador: verificar que cada método invoca al servicio con los parámetros correctos y propaga excepciones.

---

### Fase 15: Testing Unitario — Payment Preferences

#### 15.1. `src/payment-preferences/payment-preferences.service.spec.ts`

**Misma estructura** que `businesses.service.spec.ts`. Entidades en el test module:

```typescript
entities: [PaymentPreference, Vendor, PhoneNumber, Business],
```

**Casos de prueba mínimos (≥ 3 por operación):**

| Operación | Test # | Tipo | Descripción |
|-----------|--------|------|-------------|
| `create()` | 1 | Happy Path | Crea con `account_information` JSON válido |
| `create()` | 2 | Excepción | Lanza `NotFoundException` si `owner_id` no existe |
| `create()` | 3 | Caso Límite | Crea con `account_information: null` (campo nullable) |
| `findAll()` | 1 | Happy Path | Retorna lista con relación `owner` |
| `findAll()` | 2 | Caso Límite | Retorna array vacío si no hay registros |
| `findAll()` | 3 | Filtros | Filtra correctamente por `owner_id` y `name` |
| `findOne()` | 1 | Happy Path | Retorna la preferencia con su owner |
| `findOne()` | 2 | Excepción | Lanza `NotFoundException` si UUID no existe |
| `findOne()` | 3 | Caso Límite | Verifica que `account_information` se deserializa correctamente como objeto |
| `update()` | 1 | Happy Path | Actualiza `name` correctamente |
| `update()` | 2 | Excepción | Lanza `NotFoundException` al actualizar inexistente |
| `update()` | 3 | Caso Límite | Actualiza `account_information` de JSON a `null` |
| `remove()` | 1 | Happy Path | Aplica soft delete |
| `remove()` | 2 | Excepción | Lanza `NotFoundException` si no existe |
| `remove()` | 3 | Caso Límite | Aparece con `withDeleted: 'true'` |
| `recover()` | 1 | Happy Path | Restaura eliminada |
| `recover()` | 2 | Excepción | Lanza `NotFoundException` si ID no existe |
| `recover()` | 3 | Caso Límite | Si no está eliminada, la retorna sin cambios |

#### 15.2. `src/payment-preferences/payment-preferences.controller.spec.ts`

Misma estructura que `businesses.controller.spec.ts` con mocks del servicio correspondiente.

---

### Fase 16: Tests de Integración (e2e)

Los tests de integración se ejecutan secuencialmente gracias a `maxWorkers: 1` en `test/jest-e2e.json` (ADR-010). Cada test usa su propia base de datos SQLite `:memory:` completamente aislada.

#### 16.1. `test/business-vendor.e2e-spec.ts`

**Configuración del test module:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VendorsModule } from '../src/vendors/vendors.module';
import { BusinessesModule } from '../src/businesses/businesses.module';
import { Vendor } from '../src/vendors/entities/vendor.entity';
import { PhoneNumber } from '../src/phone-numbers/entities/phone-number.entity';
import { Business } from '../src/businesses/entities/business.entity';
import { PaymentPreference } from '../src/payment-preferences/entities/payment-preference.entity';
```

> **NOTA**: Incluir TODAS las entidades (`Vendor`, `PhoneNumber`, `Business`, `PaymentPreference`) en el array `entities` del `TypeOrmModule.forRoot()` para que SQLite pueda crear el schema completo con todas las relaciones.

**Casos de prueba secuenciales:**

| # | Método | Endpoint | Verificación |
|---|--------|----------|--------------|
| 1 | `POST` | `/vendors` | Crear un vendor de prueba (prerequisito) → 201 |
| 2 | `POST` | `/businesses` | Crear un business asociado al vendor → 201, verificar `owner_id` y relación `owner` |
| 3 | `POST` | `/businesses` | Crear un segundo business para el mismo vendor → 201 |
| 4 | `GET` | `/businesses` | Listar businesses → 200, verificar que retorna 2 con relación `owner` |
| 5 | `GET` | `/businesses?owner_id=<vendor_id>` | Filtrar por owner_id → 200, verificar filtro |
| 6 | `GET` | `/businesses/:id` | Obtener business por ID → 200, verificar propiedades completas |
| 7 | `PATCH` | `/businesses/:id` | Actualizar name y balance → 200, verificar valores nuevos |
| 8 | `DELETE` | `/businesses/:id` | Soft delete → 204 |
| 9 | `GET` | `/businesses` | Verificar que el eliminado NO aparece en listado normal |
| 10 | `GET` | `/businesses?withDeleted=true` | Verificar que SÍ aparece con `withDeleted=true` y `deletedAt` no null |
| 11 | `PATCH` | `/businesses/:id/recover` | Restaurar business → 200, `deletedAt` es null |
| 12 | `POST` | `/businesses` | Intentar crear con `owner_id` inexistente → 404 |
| 13 | `POST` | `/businesses` | Intentar crear con body vacío / inválido → 400 |

#### 16.2. `test/payment_preference-vendor.e2e-spec.ts`

**Misma estructura** que `business-vendor.e2e-spec.ts`. Casos secuenciales:

| # | Método | Endpoint | Verificación |
|---|--------|----------|--------------|
| 1 | `POST` | `/vendors` | Crear vendor de prueba → 201 |
| 2 | `POST` | `/payment-preferences` | Crear preferencia con `account_information` JSON → 201 |
| 3 | `POST` | `/payment-preferences` | Crear preferencia con `account_information: null` → 201 |
| 4 | `GET` | `/payment-preferences` | Listar → 200, verificar 2 registros con relación `owner` |
| 5 | `GET` | `/payment-preferences?owner_id=<vendor_id>` | Filtrar por owner_id → 200 |
| 6 | `GET` | `/payment-preferences/:id` | Detalle → 200, verificar `account_information` deserializado |
| 7 | `PATCH` | `/payment-preferences/:id` | Actualizar `name` y `account_information` → 200 |
| 8 | `DELETE` | `/payment-preferences/:id` | Soft delete → 204 |
| 9 | `GET` | `/payment-preferences` | Verificar que eliminado no aparece |
| 10 | `GET` | `/payment-preferences?withDeleted=true` | Verificar con `withDeleted=true` |
| 11 | `PATCH` | `/payment-preferences/:id/recover` | Restaurar → 200 |
| 12 | `POST` | `/payment-preferences` | `owner_id` inexistente → 404 |
| 13 | `POST` | `/payment-preferences` | Body inválido → 400 |

---

### Fase 17: Documentación y READMEs

#### 17.1. `src/businesses/README.md`

Seguir el formato exacto de `src/vendors/README.md` como referencia. Incluir:

- Emoji de título + nombre del módulo
- Descripción breve
- Estructura del módulo (árbol de archivos con descripción)
- Tabla de operaciones y endpoints
- Comando de testing

#### 17.2. `src/payment-preferences/README.md`

Mismo formato. Destacar la particularidad del campo `account_information` (JSON nullable, `simple-json`).

#### 17.3. Actualizar `src/vendors/README.md`

Agregar nota sobre las nuevas relaciones `@OneToMany` (`businesses`, `payment_preferences`).

#### 17.4. Actualizar `src/database/README.md`

Documentar que el `seed()` ahora incluye datos de `Business` y `PaymentPreference`.

#### 17.5. Actualizar `docs/DECISIONS.md`

Agregar las decisiones ADR-013 a ADR-017 listadas en la sección 2 de este documento, usando el mismo formato de tabla que las decisiones existentes.

---

## 6. Guía de Verificación y Criterios de Aceptación

| # | Verificación | Comando / Acción |
|---|-------------|-----------------|
| 1 | **Compilación limpia** | `npm run build` sin errores de TypeScript |
| 2 | **Pruebas unitarias** | `npm run test:unit` pasa al 100% con 0 fallos |
| 3 | **Pruebas de integración** | `npm run test:e2e` pasa al 100% secuencialmente |
| 4 | **Todas las pruebas** | `npm run test:all` ejecuta unit + e2e sin conflictos |
| 5 | **Documentación OpenAPI** | `http://localhost:3000/api/docs` muestra tags Businesses y Payment Preferences con todos los endpoints documentados |
| 6 | **Seeding** | `npm run start:dev` con BD vacía ejecuta auto-seeding con businesses y payment preferences |
| 7 | **Reset** | `npm run migrate:fresh` limpia todas las tablas incluidas las nuevas |
| 8 | **Vendor entity** | La entidad Vendor tiene relaciones `businesses` y `payment_preferences` |

---

## 7. Orden de Ejecución Recomendado

```text
Fase 1  → Generación CLI (businesses, payment-preferences)
Fase 2  → Entidad Business
Fase 3  → Entidad PaymentPreference
Fase 4  → Actualizar Vendor entity (relaciones inversas)
Fase 5  → DTOs Businesses
Fase 6  → DTOs Payment Preferences
Fase 7  → Servicio Businesses
Fase 8  → Servicio Payment Preferences
Fase 9  → Controlador Businesses
Fase 10 → Controlador Payment Preferences
Fase 11 → Módulos NestJS (businesses, payment-preferences)
Fase 12 → Integración AppModule + main.ts (Swagger tags)
Fase 13 → Actualizar DatabaseService (seed + clear)
         → npm run build (verificación de compilación)
Fase 14 → Testing unitario Businesses
Fase 15 → Testing unitario Payment Preferences
         → npm run test:unit (verificación)
Fase 16 → Tests de integración e2e
         → npm run test:e2e (verificación)
Fase 17 → Documentación (READMEs, DECISIONS.md)
         → npm run test:all (verificación final)
```
