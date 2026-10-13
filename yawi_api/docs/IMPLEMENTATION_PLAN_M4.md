# Plan de Implementación M4 — Integración de Subida de Imágenes en Business

Este plan de trabajo está diseñado con el detalle técnico y la secuencia exacta de pasos para que un agente de IA con nivel junior (o desarrollador) implemente la integración del servicio `UploadFileService` en el módulo `Business`, permitiendo subir imágenes al crear un negocio y agregar imágenes a negocios existentes.

---

## 1. Resumen Ejecutivo y Alcance

- **Propiedad `imagesUrls`**: Nueva columna `simple-json`, nullable, en la entidad `Business`. Almacena un arreglo de URLs de imágenes (máximo 4).
- **Modificación de creación**: El endpoint `POST /businesses` acepta opcionalmente un archivo de imagen (`Express.Multer.File`) además del DTO de creación.
- **Nuevo endpoint**: `POST /businesses/:id/images` permite agregar imágenes (una por vez) a un Business existente, con un máximo de 4 imágenes acumuladas.
- **Integración de módulos**: `BusinessesModule` importa `UploaderModule` para inyectar `UploadFileService` en `BusinessesService`.
- **Validación de archivos**: Solo se aceptan imágenes (JPEG, PNG, WebP, GIF) con tamaño máximo de 10MB.
- **Folder de almacenamiento**: Las imágenes se guardan bajo la carpeta `businesses/` en el storage (local o Supabase).
- **Testing**: ≥3 tests unitarios por endpoint nuevo, actualización de tests afectados, ≥1 test de integración Business-FileUploaderService.
- **Documentación**: Swagger para endpoints/propiedades nuevos, READMEs en carpetas relevantes, actualización de `DECISIONS.md`.

### Fuera del Alcance

- Endpoint para **eliminar** imágenes subidas.
- Alteraciones a funciones de Business que no estén relacionadas con subida de imágenes.
- Cambios en `yawi_frontend` o `yawi_n8n`.
- Optimización o redimensionamiento de imágenes.
- Autenticación/autorización de endpoints.

---

## 2. Decisiones Arquitectónicas (a agregar en `docs/DECISIONS.md`)

| # | Decisión | Justificación |
|---|----------|---------------|
| **ADR-026** | Columna `imagesUrls` con tipo `simple-json` y nullable en `Business` | Consistente con ADR-015 (`account_information` en `PaymentPreference`). `simple-json` serializa como string en SQLite (testing) y funciona como JSON nativo en PostgreSQL (producción). Nullable porque un Business puede existir sin imágenes. |
| **ADR-027** | Imagen opcional en creación de Business (`@UseInterceptors(FileInterceptor)`) | El negocio puede crearse sin imagen inicial. El archivo se recibe via `@UploadedFile()` con decorador opcional. Si se envía un archivo, se sube y la URL se agrega a `imagesUrls`. |
| **ADR-028** | Endpoint `POST /businesses/:id/images` como sub-recurso RESTful | Sigue convenciones REST donde las imágenes son un sub-recurso del Business. Permite agregar imágenes de una en una (1 archivo por request). El límite de 4 imágenes se valida en el servicio. |
| **ADR-029** | Validación de MIME type con `ParseFilePipe` + `FileTypeValidator` a nivel de NestJS | NestJS provee pipes nativos para validación de archivos. Se valida MIME type (image/jpeg, image/png, image/webp, image/gif) y tamaño máximo (10MB) usando `ParseFilePipe` con `MaxFileSizeValidator` y `FileTypeValidator`. Centraliza la validación en la capa de transporte. |
| **ADR-030** | Inyección de `UploadFileService` en `BusinessesService` (no en el controlador) | Mantiene la lógica de negocio (subida + persistencia de URL) dentro del servicio, evitando que el controlador orqueste múltiples operaciones. El controlador solo pasa el archivo al servicio. |
| **ADR-031** | Tests de integración Business-UploadFileService con mocks de adapters | El test de integración verifica el flujo completo: `BusinessesService.create()` → `UploadFileService.execute()` → adapter mockeado. No se requiere I/O real a disco ni conexión a Supabase. Se usa SQLite in-memory para la base de datos. |

---

## 3. Estructura de Directorios Final (Post-Implementación)

```text
yawi_api/src/businesses/
├── dto/
│   ├── create-business.dto.ts         # [SIN CAMBIOS] La imagen no va en el body JSON
│   ├── update-business.dto.ts         # [SIN CAMBIOS]
│   └── filter-business.dto.ts         # [SIN CAMBIOS]
├── entities/
│   └── business.entity.ts             # [MODIFICAR] Agregar propiedad imagesUrls (simple-json, nullable)
├── businesses.controller.ts            # [MODIFICAR] Agregar FileInterceptor a create(), nuevo endpoint POST /:id/images
├── businesses.service.ts               # [MODIFICAR] Inyectar UploadFileService, lógica de subida en create() y addImage()
├── businesses.module.ts                # [MODIFICAR] Importar UploaderModule
├── businesses.controller.spec.ts       # [MODIFICAR] Actualizar tests existentes + 3 nuevos para POST /:id/images
├── businesses.service.spec.ts          # [MODIFICAR] Actualizar tests existentes + tests nuevos para create con imagen y addImage()
├── businesses-upload.integration.spec.ts # [CREAR] Test de integración Business + UploadFileService
└── README.md                           # [MODIFICAR] Actualizar con nuevo endpoint y propiedad
```

---

## 4. Diagrama de Dependencias de Módulos

```text
BusinessesModule
├── imports: TypeOrmModule.forFeature([Business, Vendor])
├── imports: UploaderModule            ← [NUEVO]
│   └── imports: StorageModule
│       ├── LocalStorageAdapter
│       └── SupabaseStorageAdapter
├── controllers: [BusinessesController]
├── providers: [BusinessesService]
└── exports: [BusinessesService]
```

---

## 5. Flujo de Datos

### 5.1. Creación de Business con Imagen (Opcional)

```text
Cliente HTTP
  │
  ▼  POST /businesses (multipart/form-data)
BusinessesController.create()
  │  @UploadedFile() file?: Express.Multer.File
  │  @Body() createBusinessDto: CreateBusinessDto
  │
  ▼
BusinessesService.create(dto, file?)
  │
  ├─ [1] Validar existencia de Vendor (owner_id)
  ├─ [2] Si file existe → UploadFileService.execute(file, 'businesses')
  │       └─ Retorna { url, path, size, mimetype }
  ├─ [3] Crear entidad Business con imagesUrls = [url] o null
  └─ [4] Guardar y retornar con relación owner
```

### 5.2. Agregar Imagen a Business Existente

```text
Cliente HTTP
  │
  ▼  POST /businesses/:id/images (multipart/form-data)
BusinessesController.addImage()
  │  @Param('id') id: string
  │  @UploadedFile() file: Express.Multer.File
  │
  ▼
BusinessesService.addImage(id, file)
  │
  ├─ [1] Obtener Business por ID (findOne)
  ├─ [2] Validar que imagesUrls.length < 4
  ├─ [3] UploadFileService.execute(file, 'businesses')
  │       └─ Retorna { url, path, size, mimetype }
  ├─ [4] Agregar url al arreglo imagesUrls
  └─ [5] Guardar y retornar Business actualizado
```

---

## 6. Secuencia de Implementación (Paso a Paso)

> **IMPORTANTE**: Seguir esta secuencia exacta. Cada paso tiene un checkpoint de validación. NO avanzar al siguiente paso hasta que el checkpoint actual pase.

---

### Paso 1: Modificar la Entidad `Business`

**Archivo**: `src/businesses/entities/business.entity.ts`

**Acción**: Agregar la propiedad `imagesUrls` entre la propiedad `balance` y `owner_id`.

**Código a insertar** (después de la línea 50 `balance: number;`, antes de la línea 52 que empieza con `@ApiProperty` de `owner_id`):

```typescript
  @ApiProperty({
    description: 'Lista de URLs de imágenes del negocio (máximo 4)',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    nullable: true,
    required: false,
    type: [String],
  })
  @Column({ type: 'simple-json', nullable: true })
  imagesUrls: string[] | null;
```

**Detalles técnicos**:
- El tipo TypeORM es `simple-json`, que serializa el arreglo como string en SQLite y como JSON en PostgreSQL (consistente con ADR-015).
- El tipo TypeScript es `string[] | null` para reflejar que puede no existir.
- `nullable: true` permite crear Business sin imágenes.
- El decorador `@ApiProperty` incluye `type: [String]` para que Swagger muestre el schema correcto.

**Checkpoint 1**: Ejecutar `npm run build` para verificar que la entidad compila correctamente. No debería haber errores de TypeScript.

---

### Paso 2: Modificar el `BusinessesModule`

**Archivo**: `src/businesses/businesses.module.ts`

**Acción**: Importar `UploaderModule` para que `UploadFileService` esté disponible en el módulo.

**Código final completo del archivo**:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { UploaderModule } from '../uploader/uploader.module';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Vendor]), UploaderModule],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
```

**Cambios realizados**:
1. Agregar import de `UploaderModule` desde `'../uploader/uploader.module'`.
2. Agregar `UploaderModule` al array de `imports`.

**Checkpoint 2**: Ejecutar `npm run build`. No debería haber errores.

---

### Paso 3: Modificar el `BusinessesService`

**Archivo**: `src/businesses/businesses.service.ts`

**Acción**: Inyectar `UploadFileService`, modificar `create()` para aceptar un archivo opcional, y agregar un nuevo método `addImage()`.

**Código final completo del archivo**:

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';
import { UploadFileService } from '../uploader/upload-file.service';

@Injectable()
export class BusinessesService {
  /** Número máximo de imágenes permitidas por Business */
  static readonly MAX_IMAGES = 4;

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly uploadFileService: UploadFileService,
  ) {}

  /**
   * Crea un nuevo Business verificando previamente la existencia del Vendor propietario.
   * Si se proporciona un archivo de imagen, lo sube y almacena la URL.
   */
  async create(
    createBusinessDto: CreateBusinessDto,
    file?: Express.Multer.File,
  ): Promise<Business> {
    const { owner_id } = createBusinessDto;

    const vendor = await this.vendorRepository.findOne({
      where: { id: owner_id },
    });

    if (!vendor) {
      throw new NotFoundException(
        `No se puede crear el negocio: Vendor con ID '${owner_id}' no encontrado.`,
      );
    }

    let imagesUrls: string[] | null = null;

    if (file) {
      const uploadResult = await this.uploadFileService.execute(
        file,
        'businesses',
      );
      imagesUrls = [uploadResult.url];
    }

    const business = this.businessRepository.create({
      ...createBusinessDto,
      imagesUrls,
    });
    const savedBusiness = await this.businessRepository.save(business);

    return (await this.businessRepository.findOne({
      where: { id: savedBusiness.id },
      relations: { owner: true },
    }))!;
  }

  /**
   * Agrega una imagen al listado de un Business existente.
   * Valida que no se supere el máximo de 4 imágenes.
   */
  async addImage(id: string, file: Express.Multer.File): Promise<Business> {
    const business = await this.findOne(id);

    const currentImages = business.imagesUrls || [];

    if (currentImages.length >= BusinessesService.MAX_IMAGES) {
      throw new BadRequestException(
        `El negocio ya tiene el máximo de ${BusinessesService.MAX_IMAGES} imágenes permitidas.`,
      );
    }

    const uploadResult = await this.uploadFileService.execute(
      file,
      'businesses',
    );

    business.imagesUrls = [...currentImages, uploadResult.url];

    await this.businessRepository.save(business);

    return await this.findOne(id);
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

**Cambios clave respecto al archivo original**:
1. Import de `BadRequestException` (para validación de máximo de imágenes).
2. Import de `UploadFileService`.
3. Constante estática `MAX_IMAGES = 4`.
4. Inyección de `UploadFileService` en el constructor.
5. Firma de `create()` cambia: ahora acepta un segundo parámetro opcional `file?: Express.Multer.File`.
6. Lógica de subida de imagen dentro de `create()` si se proporciona un archivo.
7. Nuevo método `addImage(id, file)` con validación de máximo.
8. Los métodos `findAll()`, `findOne()`, `update()`, `remove()` y `recover()` permanecen **sin cambios**.

**Checkpoint 3**: Ejecutar `npm run build`. No debería haber errores.

---

### Paso 4: Modificar el `BusinessesController`

**Archivo**: `src/businesses/businesses.controller.ts`

**Acción**: Agregar `FileInterceptor` al endpoint de creación y crear el nuevo endpoint `POST /:id/images`.

**Código final completo del archivo**:

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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Crear un nuevo negocio asociado a un Vendor',
    description:
      'Registra un nuevo negocio en la base de datos vinculado al Vendor especificado por owner_id. Opcionalmente acepta una imagen (multipart/form-data).',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description:
      'Datos del negocio con imagen opcional. Enviar como multipart/form-data si se incluye imagen.',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Tienda El Buen Precio',
          description: 'Nombre del negocio',
        },
        description: {
          type: 'string',
          example:
            'Tienda de artículos para el hogar con envío a domicilio.',
          description: 'Descripción del negocio',
        },
        address: {
          type: 'string',
          example: 'Av. Independencia #456, Centro Histórico, San Salvador',
          description: 'Dirección física del negocio',
        },
        balance: {
          type: 'number',
          example: 0.0,
          description: 'Balance inicial en USD (mínimo 0)',
        },
        owner_id: {
          type: 'string',
          format: 'uuid',
          example: 'd3b07384-d113-4089-a292-1262d088a2a8',
          description: 'UUID del Vendor propietario',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen del negocio (opcional). Formatos: JPEG, PNG, WebP, GIF. Máximo 10MB.',
        },
      },
      required: ['name', 'description', 'address', 'owner_id'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Negocio creado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos, archivo no es una imagen válida, o excede el tamaño máximo (10MB).',
  })
  @ApiResponse({
    status: 404,
    description: 'El Vendor especificado en owner_id no existe.',
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<Business> {
    return await this.businessesService.create(createBusinessDto, file);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Agregar una imagen a un negocio existente',
    description:
      'Sube una imagen y la agrega al listado de imágenes del negocio. Máximo 4 imágenes por negocio. Se envía una imagen por request.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiBody({
    description:
      'Imagen a agregar al negocio. Formatos permitidos: JPEG, PNG, WebP, GIF. Tamaño máximo: 10MB.',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen a subir',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Imagen agregada exitosamente. Retorna el Business con la lista actualizada de imágenes.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description:
      'UUID inválido, archivo no proporcionado, archivo no es una imagen válida, excede 10MB, o el negocio ya tiene 4 imágenes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<Business> {
    return await this.businessesService.addImage(id, file);
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
    description:
      'Retorna un negocio específico junto con su propietario (Vendor).',
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

**Cambios clave respecto al archivo original**:
1. Imports nuevos: `UseInterceptors`, `UploadedFile`, `ParseFilePipe`, `MaxFileSizeValidator`, `FileTypeValidator` de `@nestjs/common`.
2. Import de `FileInterceptor` de `@nestjs/platform-express`.
3. Imports Swagger nuevos: `ApiConsumes`, `ApiBody`.
4. `create()` ahora tiene `@UseInterceptors(FileInterceptor('image'))`, `@ApiConsumes`, `@ApiBody` con schema multipart, y recibe `file?` vía `@UploadedFile()`.
5. Nuevo método `addImage()` con toda su documentación Swagger.
6. **IMPORTANTE sobre el orden de rutas**: El endpoint `POST /:id/images` debe definirse **ANTES** de `GET /:id` en el controlador para evitar conflictos de rutas en NestJS (ya que NestJS evalúa rutas en orden de definición). En el código de arriba, se ubica justo después del `create()`.

**Nota sobre `@ApiConsumes`**: En el endpoint `create()`, se incluyen tanto `multipart/form-data` como `application/json` porque la imagen es opcional. Cuando se envía sin imagen, el cliente puede usar JSON normal. Cuando se incluye imagen, debe usar multipart.

**Checkpoint 4**: Ejecutar `npm run build`. No debería haber errores de compilación.

---

### Paso 5: Actualizar Tests Unitarios del Controlador

**Archivo**: `src/businesses/businesses.controller.spec.ts`

**Acción**: Actualizar el mock de `BusinessesService` para incluir `addImage()`, y actualizar el test de `create()` para pasar el archivo como segundo argumento. Agregar 3 tests nuevos para `addImage()`.

**Código final completo del archivo**:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';

describe('BusinessesController (Unit)', () => {
  let controller: BusinessesController;
  let service: BusinessesService;

  const mockBusiness = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Tienda El Buen Precio',
    description: 'Tienda de artículos para el hogar con envío a domicilio.',
    address: 'Av. Independencia #456, Centro Histórico, San Salvador',
    balance: 1500.5,
    owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
    imagesUrls: null,
    owner: {
      id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      username: 'carlos_salvador',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const mockBusinessWithImage = {
    ...mockBusiness,
    imagesUrls: ['https://example.com/businesses/uuid-test-image.jpg'],
  };

  const mockBusinessesService = {
    create: jest.fn().mockResolvedValue(mockBusiness),
    findAll: jest.fn().mockResolvedValue([mockBusiness]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockBusiness.id) return Promise.resolve(mockBusiness);
      throw new NotFoundException('Business not found');
    }),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdateBusinessDto) => {
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
    addImage: jest.fn().mockImplementation((id: string) => {
      if (id === mockBusiness.id)
        return Promise.resolve(mockBusinessWithImage);
      throw new NotFoundException('Business not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessesController],
      providers: [
        {
          provide: BusinessesService,
          useValue: mockBusinessesService,
        },
      ],
    }).compile();

    controller = module.get<BusinessesController>(BusinessesController);
    service = module.get<BusinessesService>(BusinessesService);

    jest.clearAllMocks();
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create con el DTO y sin archivo', async () => {
      const dto: CreateBusinessDto = {
        name: 'Tienda El Buen Precio',
        description: 'Tienda de artículos para el hogar con envío a domicilio.',
        address: 'Av. Independencia #456, Centro Histórico, San Salvador',
        balance: 1500.5,
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto, undefined);
      expect(result).toEqual(mockBusiness);
      expect(service.create).toHaveBeenCalledWith(dto, undefined);
    });

    it('debe invocar service.create con el DTO y un archivo de imagen', async () => {
      mockBusinessesService.create.mockResolvedValueOnce(mockBusinessWithImage);
      const dto: CreateBusinessDto = {
        name: 'Tienda El Buen Precio',
        description: 'Tienda de artículos para el hogar con envío a domicilio.',
        address: 'Av. Independencia #456, Centro Histórico, San Salvador',
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto, mockFile);
      expect(result).toEqual(mockBusinessWithImage);
      expect(service.create).toHaveBeenCalledWith(dto, mockFile);
    });
  });

  describe('addImage()', () => {
    it('1. Happy Path: debe invocar service.addImage y retornar el business con la imagen agregada', async () => {
      const result = await controller.addImage(mockBusiness.id, mockFile);

      expect(result).toEqual(mockBusinessWithImage);
      expect(result.imagesUrls).toContain(
        'https://example.com/businesses/uuid-test-image.jpg',
      );
      expect(service.addImage).toHaveBeenCalledWith(mockBusiness.id, mockFile);
    });

    it('2. Excepción: debe propagar NotFoundException si el business no existe', async () => {
      mockBusinessesService.addImage.mockRejectedValueOnce(
        new NotFoundException('Business not found'),
      );

      await expect(
        controller.addImage('00000000-0000-0000-0000-000000000000', mockFile),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Excepción: debe propagar BadRequestException si se excede el máximo de imágenes', async () => {
      mockBusinessesService.addImage.mockRejectedValueOnce(
        new BadRequestException(
          'El negocio ya tiene el máximo de 4 imágenes permitidas.',
        ),
      );

      await expect(
        controller.addImage(mockBusiness.id, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll()', () => {
    it('debe invocar service.findAll con los filtros', async () => {
      const filters: FilterBusinessDto = { name: 'Tienda El Buen Precio' };
      const result = await controller.findAll(filters);
      expect(result).toEqual([mockBusiness]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne()', () => {
    it('debe retornar el business si el ID existe', async () => {
      const result = await controller.findOne(mockBusiness.id);
      expect(result).toEqual(mockBusiness);
      expect(service.findOne).toHaveBeenCalledWith(mockBusiness.id);
    });

    it('debe propagar NotFoundException si el ID no existe', async () => {
      await expect(controller.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('debe invocar service.update con el id y el dto', async () => {
      const dto: UpdateBusinessDto = { name: 'Nuevo Nombre' };
      const result = await controller.update(mockBusiness.id, dto);
      expect(result.name).toBe('Nuevo Nombre');
      expect(service.update).toHaveBeenCalledWith(mockBusiness.id, dto);
    });
  });

  describe('remove()', () => {
    it('debe invocar service.remove con el id', async () => {
      await controller.remove(mockBusiness.id);
      expect(service.remove).toHaveBeenCalledWith(mockBusiness.id);
    });
  });

  describe('recover()', () => {
    it('debe invocar service.recover con el id', async () => {
      const result = await controller.recover(mockBusiness.id);
      expect(result).toEqual(mockBusiness);
      expect(service.recover).toHaveBeenCalledWith(mockBusiness.id);
    });
  });
});
```

**Cambios respecto al archivo original**:
1. Import de `BadRequestException`.
2. `mockBusiness` ahora incluye `imagesUrls: null`.
3. Se agregó `mockFile` como fixture de archivo de prueba.
4. Se agregó `mockBusinessWithImage` como fixture de negocio con imagen.
5. Se agregó `addImage` al mock de `BusinessesService`.
6. Se agregó `jest.clearAllMocks()` en `beforeEach`.
7. Test de `create()` actualizado: ahora pasa `undefined` como segundo argumento.
8. Se agregó un segundo test de `create()` que envía un archivo.
9. Se agregó un bloque `describe('addImage()')` con 3 tests: happy path, NotFoundException, BadRequestException.

**Checkpoint 5**: Ejecutar `npm run test:unit -- src/businesses/businesses.controller.spec.ts`. Todos los tests deben pasar.

---

### Paso 6: Actualizar Tests Unitarios del Servicio

**Archivo**: `src/businesses/businesses.service.spec.ts`

**Acción**: Actualizar el `TestingModule` para incluir un mock de `UploadFileService`, actualizar el test de `create()` para verificar la nueva firma, y agregar tests para `addImage()`.

**Cambios requeridos**:

**6.1. Agregar imports necesarios al inicio del archivo**:

Agregar los imports faltantes. El bloque de imports completo debe quedar:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { UploadFileService } from '../uploader/upload-file.service';
```

**6.2. Agregar mock de `UploadFileService` y variables del mock**:

Dentro del `describe()` principal, después de la declaración de `let sampleVendor: Vendor;`, agregar:

```typescript
  let mockUploadFileService: any;

  const mockUploadResult = {
    url: '/uploads/businesses/uuid-test-image.jpg',
    path: 'uploads/businesses/uuid-test-image.jpg',
    size: 1024,
    mimetype: 'image/jpeg',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };
```

**6.3. Modificar el `beforeAll()` para incluir el mock de `UploadFileService`**:

```typescript
  beforeAll(async () => {
    mockUploadFileService = {
      execute: jest.fn().mockResolvedValue(mockUploadResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Business, Vendor, PhoneNumber, PaymentPreference],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Business, Vendor]),
      ],
      providers: [
        BusinessesService,
        {
          provide: UploadFileService,
          useValue: mockUploadFileService,
        },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
    dataSource = module.get<DataSource>(DataSource);
  });
```

**6.4. Agregar `jest.clearAllMocks()` al `beforeEach()` existente**:

Al final del `beforeEach()` actual, después de crear `sampleVendor`, agregar:

```typescript
    jest.clearAllMocks();
```

**6.5. Agregar nuevos tests de `create()` con imagen al `describe('create()')` existente**:

Agregar estos tests al final del `describe('create()')`, después del test número 3:

```typescript
    it('4. Happy Path: crea un Business con imagen y almacena la URL', async () => {
      const business = await service.create(
        {
          name: 'Negocio con Imagen',
          description: 'Tiene imagen desde su creación',
          address: 'Calle con Imagen #100',
          owner_id: sampleVendor.id,
        },
        mockFile,
      );

      expect(mockUploadFileService.execute).toHaveBeenCalledWith(
        mockFile,
        'businesses',
      );

      // simple-json en SQLite almacena como string; parseamos si es necesario.
      const urls =
        typeof business.imagesUrls === 'string'
          ? JSON.parse(business.imagesUrls)
          : business.imagesUrls;
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe(mockUploadResult.url);
    });

    it('5. Caso Límite: crea un Business sin imagen y imagesUrls es null', async () => {
      const business = await service.create({
        name: 'Negocio sin Imagen',
        description: 'Sin imagen adjunta',
        address: 'Calle Sin Imagen #200',
        owner_id: sampleVendor.id,
      });

      expect(business.imagesUrls).toBeNull();
      expect(mockUploadFileService.execute).not.toHaveBeenCalled();
    });
```

**6.6. Agregar nuevo bloque `describe('addImage()')` con 4 tests al final, antes del cierre del `describe` principal**:

```typescript
  describe('addImage()', () => {
    it('1. Happy Path: debe agregar una imagen a un business sin imágenes previas', async () => {
      const business = await service.create({
        name: 'Negocio para Imagen',
        description: 'Descripción de prueba',
        address: 'Dirección #1',
        owner_id: sampleVendor.id,
      });

      // Verificar que el valor inicial es null.
      expect(business.imagesUrls).toBeNull();

      const updated = await service.addImage(business.id, mockFile);

      expect(mockUploadFileService.execute).toHaveBeenCalledWith(
        mockFile,
        'businesses',
      );

      // simple-json en SQLite almacena como string; parseamos si es necesario.
      const urls =
        typeof updated.imagesUrls === 'string'
          ? JSON.parse(updated.imagesUrls)
          : updated.imagesUrls;
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe(mockUploadResult.url);
    });

    it('2. Happy Path: debe agregar imágenes hasta el máximo de 4', async () => {
      const business = await service.create({
        name: 'Negocio Multi-Imagen',
        description: 'Descripción de prueba',
        address: 'Dirección #2',
        owner_id: sampleVendor.id,
      });

      // Agregar 4 imágenes secuencialmente
      let counter = 0;
      mockUploadFileService.execute.mockImplementation(() => {
        counter++;
        return Promise.resolve({
          ...mockUploadResult,
          url: `/uploads/businesses/img-${counter}.jpg`,
        });
      });

      await service.addImage(business.id, mockFile);
      await service.addImage(business.id, mockFile);
      await service.addImage(business.id, mockFile);
      const finalBusiness = await service.addImage(business.id, mockFile);

      const urls =
        typeof finalBusiness.imagesUrls === 'string'
          ? JSON.parse(finalBusiness.imagesUrls)
          : finalBusiness.imagesUrls;
      expect(urls).toHaveLength(4);
      expect(mockUploadFileService.execute).toHaveBeenCalledTimes(4);
    });

    it('3. Excepción: debe lanzar BadRequestException al intentar agregar una 5ta imagen', async () => {
      const business = await service.create({
        name: 'Negocio Lleno de Imágenes',
        description: 'Descripción de prueba',
        address: 'Dirección #3',
        owner_id: sampleVendor.id,
      });

      // Pre-cargar 4 imágenes directamente en la entidad
      const repo = dataSource.getRepository(Business);
      await repo.save({
        ...business,
        imagesUrls: [
          '/img1.jpg',
          '/img2.jpg',
          '/img3.jpg',
          '/img4.jpg',
        ],
      });

      await expect(service.addImage(business.id, mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addImage(business.id, mockFile)).rejects.toThrow(
        /máximo de 4 imágenes/,
      );
    });

    it('4. Excepción: debe lanzar NotFoundException si el business no existe', async () => {
      await expect(
        service.addImage(
          '00000000-0000-0000-0000-000000000000',
          mockFile,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
```

**Nota sobre `simple-json` en SQLite**: TypeORM con `simple-json` serializa los valores como strings cuando usa SQLite. Por eso en los tests se usa la técnica de verificar si `imagesUrls` es un string y parsearlo. Esto es consistente con la estrategia descrita en ADR-015 y en planes anteriores. **Este patrón de parsing condicional** debe usarse en TODOS los tests que verifiquen `imagesUrls`.

**Checkpoint 6**: Ejecutar `npm run test:unit -- src/businesses/businesses.service.spec.ts`. Todos los tests deben pasar (los existentes + los nuevos).

---

### Paso 7: Test de Integración Business-UploadFileService

**Archivo a crear**: `src/businesses/businesses-upload.integration.spec.ts`

**Objetivo**: Verificar el flujo completo de integración entre `BusinessesService` y `UploadFileService` usando un adapter mockeado, con la base de datos SQLite in-memory real.

**Código completo del archivo**:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { UploadFileService } from '../uploader/upload-file.service';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';

describe('BusinessesService + UploadFileService (Integration)', () => {
  let businessesService: BusinessesService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;
  let mockLocalStorageAdapter: any;

  const mockUploadResult = {
    url: '/uploads/businesses/integration-test-uuid.jpg',
    path: 'uploads/businesses/integration-test-uuid.jpg',
    size: 2048,
    mimetype: 'image/jpeg',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'integration-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 2048,
    buffer: Buffer.from('integration-test-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  beforeAll(async () => {
    mockLocalStorageAdapter = {
      upload: jest.fn().mockResolvedValue(mockUploadResult),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              STORAGE_METHOD: 'local',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Business, Vendor, PhoneNumber, PaymentPreference],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Business, Vendor]),
      ],
      providers: [
        BusinessesService,
        UploadFileService,
        { provide: LocalStorageAdapter, useValue: mockLocalStorageAdapter },
        {
          provide: SupabaseStorageAdapter,
          useValue: { upload: jest.fn(), delete: jest.fn() },
        },
      ],
    }).compile();

    businessesService = module.get<BusinessesService>(BusinessesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(Business).clear();
    await dataSource.getRepository(Vendor).clear();

    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_integration_upload',
        password: 'hashedpassword',
        name: 'Integration',
        surname: 'Test',
        birthdate: new Date('1995-06-15'),
        country: 'El Salvador',
        personal_address: 'Test Address #1',
        DUI: '87654321-0',
        NIT: '0614-150695-102-2',
      }),
    );

    jest.clearAllMocks();
  });

  it('INT-BUS-UPL-01: Flujo completo de creación con imagen sube el archivo y persiste la URL', async () => {
    const business = await businessesService.create(
      {
        name: 'Negocio Integración',
        description: 'Test de integración con imagen',
        address: 'Calle Integración #1',
        owner_id: sampleVendor.id,
      },
      mockFile,
    );

    // Verifica que el adapter fue invocado
    expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(1);

    // Verifica que la URL fue persistida en la base de datos
    const persisted = await businessesService.findOne(business.id);
    const urls =
      typeof persisted.imagesUrls === 'string'
        ? JSON.parse(persisted.imagesUrls)
        : persisted.imagesUrls;
    expect(urls).toHaveLength(1);
    expect(urls[0]).toBe(mockUploadResult.url);

    // Verifica que las demás propiedades no se vieron afectadas
    expect(persisted.name).toBe('Negocio Integración');
    expect(persisted.owner).toBeDefined();
    expect(persisted.owner.id).toBe(sampleVendor.id);
  });

  it('INT-BUS-UPL-02: addImage agrega imágenes incrementalmente y persiste correctamente', async () => {
    // Crear business sin imagen
    const business = await businessesService.create({
      name: 'Negocio Agregar Imágenes',
      description: 'Empezamos sin imagen',
      address: 'Calle Sin Imagen #10',
      owner_id: sampleVendor.id,
    });

    expect(business.imagesUrls).toBeNull();

    // Agregar primera imagen
    let counter = 0;
    mockLocalStorageAdapter.upload.mockImplementation(() => {
      counter++;
      return Promise.resolve({
        ...mockUploadResult,
        url: `/uploads/businesses/int-img-${counter}.jpg`,
      });
    });

    const after1 = await businessesService.addImage(business.id, mockFile);
    const urls1 =
      typeof after1.imagesUrls === 'string'
        ? JSON.parse(after1.imagesUrls)
        : after1.imagesUrls;
    expect(urls1).toHaveLength(1);

    // Agregar segunda imagen
    const after2 = await businessesService.addImage(business.id, mockFile);
    const urls2 =
      typeof after2.imagesUrls === 'string'
        ? JSON.parse(after2.imagesUrls)
        : after2.imagesUrls;
    expect(urls2).toHaveLength(2);

    // Verificar persistencia real en base de datos
    const dbBusiness = await businessesService.findOne(business.id);
    const dbUrls =
      typeof dbBusiness.imagesUrls === 'string'
        ? JSON.parse(dbBusiness.imagesUrls)
        : dbBusiness.imagesUrls;
    expect(dbUrls).toHaveLength(2);
    expect(dbUrls).toContain('/uploads/businesses/int-img-1.jpg');
    expect(dbUrls).toContain('/uploads/businesses/int-img-2.jpg');
  });

  it('INT-BUS-UPL-03: La creación sin imagen no invoca el adapter y persiste imagesUrls como null', async () => {
    const business = await businessesService.create({
      name: 'Negocio Sin Imagen Integración',
      description: 'No tiene imagen',
      address: 'Calle Vacía #5',
      owner_id: sampleVendor.id,
    });

    expect(mockLocalStorageAdapter.upload).not.toHaveBeenCalled();
    expect(business.imagesUrls).toBeNull();

    // Verificar en base de datos
    const persisted = await businessesService.findOne(business.id);
    expect(persisted.imagesUrls).toBeNull();
  });
});
```

**Notas clave del test de integración**:
- Se usa la instancia real de `UploadFileService` (no un mock del servicio completo), pero con los storage adapters mockeados (sin I/O real a disco).
- Se usa SQLite in-memory para la base de datos, consistente con la configuración de testing del proyecto.
- `ConfigModule.forRoot()` con `STORAGE_METHOD: 'local'` para que `UploadFileService` use el adapter local.
- Se verifica la persistencia real en la base de datos (no solo el valor de retorno).
- Se usa el patrón de parsing condicional para `simple-json`.

**Checkpoint 7**: Ejecutar `npm run test:unit -- src/businesses/businesses-upload.integration.spec.ts`. Todos los tests deben pasar.

---

### Paso 8: Actualizar el `README.md` del módulo Business

**Archivo**: `src/businesses/README.md`

**Acción**: Reemplazar con contenido actualizado que incluye la nueva propiedad, nuevo endpoint, y mención de la integración con `UploadFileService`.

**Código final completo del archivo**:

````markdown
# 🏪 Businesses Module

Módulo encargado de la gestión integral de los negocios (`Business`), vinculados a su propietario (`Vendor`). Incluye soporte para subida de imágenes del negocio mediante `UploadFileService`.

---

## 📁 Estructura del Módulo

```text
src/businesses/
├── dto/
│   ├── create-business.dto.ts    # DTO con validaciones para crear negocio (name, description, address, balance, owner_id)
│   ├── update-business.dto.ts    # DTO para actualización parcial (omite owner_id)
│   └── filter-business.dto.ts    # DTO para filtrado en listados (?name, ?address, ?owner_id, ?withDeleted)
├── entities/
│   └── business.entity.ts        # Entidad TypeORM con Swagger, balance decimal(10,2), imagesUrls simple-json y relación ManyToOne a Vendor
├── businesses.controller.ts       # Controlador REST con documentación Swagger completa y FileInterceptor
├── businesses.service.ts          # Lógica de negocio, soft delete e integración con UploadFileService
├── businesses.module.ts           # Módulo NestJS con TypeOrmModule.forFeature([Business, Vendor]) + UploaderModule
├── businesses.controller.spec.ts  # Pruebas unitarias de controlador
├── businesses.service.spec.ts     # Pruebas unitarias de servicio con SQLite in-memory
└── businesses-upload.integration.spec.ts  # Pruebas de integración Business + UploadFileService
```

---

## 🎯 Operaciones y Endpoints

| Método | Endpoint | Descripción | Notas |
|--------|----------|-------------|-------|
| `POST` | `/businesses` | Crear nuevo negocio | Valida existencia del `Vendor` propietario (`owner_id`). `balance` default 0.00 con `@Min(0)`. Acepta imagen opcional (multipart/form-data). |
| `POST` | `/businesses/:id/images` | Agregar imagen al negocio | Sube una imagen al storage (local/supabase) y agrega la URL al listado. Máximo 4 imágenes. Campo: `image`. |
| `GET` | `/businesses` | Listar negocios | Soporta filtros (`name`, `address`, `owner_id`) y soft delete (`withDeleted=true`). Incluye relación `owner`. |
| `GET` | `/businesses/:id` | Detalle de negocio | Retorna el negocio con su entidad propietaria `owner`. |
| `PATCH` | `/businesses/:id` | Actualización parcial | Actualiza campos permitidos (nombre, descripción, dirección, balance). |
| `DELETE` | `/businesses/:id` | Soft Delete (204) | Eliminación lógica mediante `@DeleteDateColumn()`. No borra físicamente. |
| `PATCH` | `/businesses/:id/recover` | Restauración | Restaura un negocio soft-deleted removiendo el timestamp `deletedAt`. |

---

## 🖼️ Subida de Imágenes

- **Formatos aceptados**: JPEG, PNG, WebP, GIF
- **Tamaño máximo**: 10MB por imagen
- **Máximo de imágenes por negocio**: 4
- **Nombre del campo en multipart/form-data**: `image`
- **Carpeta de almacenamiento en storage**: `businesses/`
- **Dependencia**: `UploaderModule` → `UploadFileService` → `StorageAdapter` (local o supabase según `STORAGE_METHOD`)

---

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias de este módulo
npm run test:unit -- src/businesses/

# Ejecutar solo el test de integración
npm run test:unit -- src/businesses/businesses-upload.integration.spec.ts
```
````

**Checkpoint 8**: Verificar que el README se ve correctamente formateado.

---

### Paso 9: Actualizar `docs/DECISIONS.md`

**Archivo**: `docs/DECISIONS.md`

**Acción**: Agregar las decisiones ADR-026 a ADR-031 al final del archivo.

**Líneas a agregar al final del archivo** (después de la línea de ADR-025):

```markdown
| **ADR-026** | Columna `imagesUrls` con tipo `simple-json` y nullable en `Business` | Aceptada | Consistente con ADR-015. `simple-json` serializa como string en SQLite (testing) y funciona como JSON nativo en PostgreSQL (producción). Nullable porque un Business puede existir sin imágenes. |
| **ADR-027** | Imagen opcional en creación de Business con `FileInterceptor` | Aceptada | El negocio puede crearse sin imagen. `ParseFilePipe` con `fileIsRequired: false` permite la opcionalidad. Si se envía archivo, se sube y la URL se agrega a `imagesUrls`. |
| **ADR-028** | Endpoint `POST /businesses/:id/images` como sub-recurso RESTful | Aceptada | Las imágenes son un sub-recurso del Business. Permite agregar de a una imagen por request. El límite de 4 imágenes se valida en `BusinessesService.addImage()`. |
| **ADR-029** | Validación de MIME type y tamaño con `ParseFilePipe` nativo de NestJS | Aceptada | `MaxFileSizeValidator` (10MB) y `FileTypeValidator` (`image/jpeg|png|webp|gif`) centralizan la validación en la capa de transporte sin lógica duplicada en el servicio. |
| **ADR-030** | Inyección de `UploadFileService` en `BusinessesService` (no en controlador) | Aceptada | Mantiene la lógica de negocio (subida + persistencia de URL) dentro del servicio. El controlador solo pasa el archivo al servicio, siguiendo el principio de responsabilidad única. |
| **ADR-031** | Tests de integración Business-UploadFileService con adapters mockeados y SQLite in-memory | Aceptada | Verifica el flujo completo `BusinessesService` → `UploadFileService` → adapter sin I/O real. Consistente con ADR-002 y ADR-025. |
```

**Checkpoint 9**: Verificar que el archivo `DECISIONS.md` tiene las nuevas entradas y mantiene el formato tabular consistente.

---

## 7. Checklist de Verificación Final

Ejecutar todos los tests del proyecto para asegurar que nada se rompió:

```bash
# Tests unitarios completos
npm run test:unit

# Tests e2e (si existen)
npm run test:e2e

# Build de producción
npm run build
```

### Matriz de Archivos Modificados/Creados

| Archivo | Acción | Paso |
|---------|--------|------|
| `src/businesses/entities/business.entity.ts` | MODIFICAR | 1 |
| `src/businesses/businesses.module.ts` | MODIFICAR | 2 |
| `src/businesses/businesses.service.ts` | MODIFICAR | 3 |
| `src/businesses/businesses.controller.ts` | MODIFICAR | 4 |
| `src/businesses/businesses.controller.spec.ts` | MODIFICAR | 5 |
| `src/businesses/businesses.service.spec.ts` | MODIFICAR | 6 |
| `src/businesses/businesses-upload.integration.spec.ts` | CREAR | 7 |
| `src/businesses/README.md` | MODIFICAR | 8 |
| `docs/DECISIONS.md` | MODIFICAR | 9 |

### Tests Mínimos Requeridos

| Test | Tipo | Ubicación |
|------|------|-----------|
| `create()` con DTO y sin archivo → imagesUrls null | Unitario (Service) | Paso 6 |
| `create()` con DTO y archivo → imagesUrls contiene URL | Unitario (Service) | Paso 6 |
| `addImage()` happy path → agrega URL al arreglo | Unitario (Service) | Paso 6 |
| `addImage()` 4 imágenes → acepta hasta 4 | Unitario (Service) | Paso 6 |
| `addImage()` 5ta imagen → BadRequestException | Unitario (Service) | Paso 6 |
| `addImage()` business inexistente → NotFoundException | Unitario (Service) | Paso 6 |
| `addImage()` controller happy path | Unitario (Controller) | Paso 5 |
| `addImage()` controller NotFoundException | Unitario (Controller) | Paso 5 |
| `addImage()` controller BadRequestException | Unitario (Controller) | Paso 5 |
| `create()` controller con archivo | Unitario (Controller) | Paso 5 |
| `create()` controller sin archivo | Unitario (Controller) | Paso 5 |
| Flujo creación + imagen → persiste en DB | Integración | Paso 7 |
| addImage incremental → persiste en DB | Integración | Paso 7 |
| Creación sin imagen → adapter no invocado | Integración | Paso 7 |

---

## 8. Errores Comunes y Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `imagesUrls` se almacena como `"null"` (string) en vez de `null` | Asignar string `"null"` en vez de `null` de JavaScript | Asegurarse de asignar el valor `null` literal, no la cadena `"null"` |
| Tests fallan con `expected null, received '["url"]'` | `simple-json` serializa como string en SQLite | Usar el patrón de parsing condicional: `typeof x === 'string' ? JSON.parse(x) : x` |
| Error `Cannot determine a type for "imagesUrls"` | Falta la opción `type: 'simple-json'` en `@Column()` | Verificar que la decoración sea `@Column({ type: 'simple-json', nullable: true })` |
| `Multer.File` no reconocido | Falta `@types/multer` en devDependencies | Ya está instalado en el proyecto (`"@types/multer": "^2.2.0"`) |
| `FileInterceptor` no encontrado | Import incorrecto | Importar de `@nestjs/platform-express`, NO de `@nestjs/common` |
| Conflicto de rutas `POST /:id/images` vs `GET /:id` | Orden de declaración en el controlador | Declarar `POST /:id/images` ANTES de `GET /:id` en el controlador |
| `UploadFileService` no disponible en `BusinessesService` | `UploaderModule` no importado en `BusinessesModule` | Verificar que `UploaderModule` esté en el array de `imports` de `BusinessesModule` |
| `ParseFilePipe` lanza error cuando no se envía archivo | `fileIsRequired` por defecto es `true` | Usar `fileIsRequired: false` en el endpoint de creación (donde la imagen es opcional) |

---

## 9. Notas para Implementaciones Futuras

- **Endpoint de eliminación de imágenes**: Fuera del alcance actual. Cuando se implemente, se deberá:
  1. Crear `DELETE /businesses/:id/images/:imageIndex` o `DELETE /businesses/:id/images` con body indicando la URL a eliminar.
  2. Invocar `StorageAdapter.delete()` (actualmente lanza `NotImplementedException`).
  3. Remover la URL del arreglo `imagesUrls`.
- **Optimización de imágenes**: Considerar agregar un step de resize/compress antes de la subida en futuras iteraciones.
- **CDN / URL pública**: Si se usa almacenamiento local, las URLs generadas son rutas del servidor. Para producción con Supabase, las URLs son públicas automáticamente.
