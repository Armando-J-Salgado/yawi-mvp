# Plan de Implementación M3 — Servicio de Subida de Archivos (Storage Adapter Pattern)

Este plan de trabajo está diseñado con el detalle técnico y la secuencia exacta de pasos para que un agente de IA con nivel junior (o desarrollador) implemente un servicio reutilizable de subida de archivos usando el patrón Adapter, con soporte dual (local y Supabase Storage), bajo lineamientos de TDD y arquitectura modular de NestJS.

---

## 1. Resumen Ejecutivo y Alcance

- **Patrón Adapter de Storage**: Clase abstracta `StorageAdapter` con dos implementaciones concretas (`LocalStorageAdapter`, `SupabaseStorageAdapter`), permitiendo intercambiar el backend de almacenamiento mediante variable de entorno.
- **Servicio Principal `UploadFileService`**: Orquestador que recibe archivos (Multer), selecciona el adapter correcto según `STORAGE_METHOD` y delega la operación de subida.
- **Almacenamiento Local**: Servicio `LocalStorageService` que persiste archivos en `yawi_api/uploads/` usando `fs/promises`.
- **Almacenamiento Supabase**: Servicio `SupabaseStorageService` que utiliza el SDK oficial `@supabase/supabase-js` para subir archivos a Supabase Storage.
- **Cliente Supabase**: Archivo de configuración del cliente Supabase aislado en `src/clients/supabase/`.
- **Testing**: Pruebas unitarias (≥ 3 tests por función) y pruebas de integración para cada tipo de almacenamiento.
- **Documentación & NFRs**: README.md en cada carpeta creada, actualización de `DECISIONS.md`.

### Fuera del Alcance

- Implementación concreta del método `delete` en los adapters (se declara abstracto pero lanza `NotImplementedException`).
- Supabase para persistencia de base de datos (la configuración de TypeORM permanece completamente aislada).
- Optimización de imágenes o archivos.
- Modificación de entidades existentes (Vendor, Business, PhoneNumber, PaymentPreference).
- Cualquier cambio en `yawi_frontend` o `n8n`.

---

## 2. Decisiones Arquitectónicas (a agregar en `docs/DECISIONS.md`)

| # | Decisión | Justificación |
|---|----------|---------------|
| **ADR-018** | Patrón Adapter con clase abstracta `StorageAdapter` para intercambiar backends de almacenamiento | Permite cambiar entre almacenamiento local y Supabase (u otro futuro) sin modificar la lógica del servicio consumidor. Respeta el principio Open/Closed (SOLID). |
| **ADR-019** | Selección de adapter en runtime mediante `ConfigService.get('STORAGE_METHOD')` | Centraliza la decisión de backend de almacenamiento en una variable de entorno. Evita condicionales dispersos y facilita configuración por ambiente (dev = local, prod = supabase). |
| **ADR-020** | `UploadFileDTO` como interfaz (no class-validator DTO) | Es un contrato interno entre servicio y adapter, no atraviesa la capa HTTP. No requiere validación con decoradores. Se usa `interface` por simplicidad. |
| **ADR-021** | `@supabase/supabase-js` como SDK para Supabase Storage | SDK oficial y mantenido. Evita implementar manualmente autenticación, manejo de errores y retry contra la API REST de Supabase. |
| **ADR-022** | Cliente Supabase aislado en `src/clients/supabase/` | Desacopla la configuración del cliente Supabase de los servicios consumidores. Permite reutilizar el cliente si en el futuro se usan otros servicios de Supabase (e.g., Auth, Realtime). |
| **ADR-023** | Carpeta `uploads/` en raíz del proyecto con `.gitkeep` | Separar archivos de usuario del código fuente. `.gitkeep` asegura que la carpeta exista en el repositorio sin subir archivos reales. Se agrega `uploads/*` a `.gitignore`. |
| **ADR-024** | `delete` abstracto en `StorageAdapter` sin implementación concreta | Reserva la firma para futura implementación. Los adapters lanzan `NotImplementedException` para cumplir el contrato sin funcionalidad aún. |
| **ADR-025** | `UploadFileService.execute()` recibe `Express.Multer.File` y transforma internamente a `UploadFileDTO` | Mantiene una API ergonómica para los controllers consumidores (que trabajan con Multer) y aísla el contrato interno del adapter. |

---

## 3. Estructura de Directorios Final (Post-Implementación)

```text
yawi_api/
├── uploads/                                 # [NUEVO] Archivos locales de usuario
│   └── .gitkeep
│
├── src/
│   ├── clients/                             # [NUEVO] Clientes de servicios externos
│   │   └── supabase/
│   │       ├── supabase.client.ts           # [NUEVO] Factory/provider del cliente Supabase
│   │       ├── supabase.module.ts           # [NUEVO] Módulo que exporta el provider
│   │       └── README.md                    # [NUEVO]
│   │
│   ├── storage/                             # [NUEVO] Capa de abstracción de almacenamiento
│   │   ├── adapters/
│   │   │   ├── interfaces/
│   │   │   │   ├── upload-file.dto.ts       # [NUEVO] Interfaz UploadFileDTO
│   │   │   │   └── upload-file-result.ts    # [NUEVO] Interfaz UploadFileResult
│   │   │   ├── storage.adapter.ts           # [NUEVO] Clase abstracta StorageAdapter
│   │   │   ├── local-storage.adapter.ts     # [NUEVO] Adapter concreto → LocalStorageService
│   │   │   ├── supabase-storage.adapter.ts  # [NUEVO] Adapter concreto → SupabaseStorageService
│   │   │   └── README.md                    # [NUEVO]
│   │   ├── services/
│   │   │   ├── local-storage.service.ts     # [NUEVO] Lógica de escritura en disco
│   │   │   ├── local-storage.service.spec.ts  # [NUEVO] Tests unitarios
│   │   │   ├── supabase-storage.service.ts  # [NUEVO] Lógica de subida a Supabase
│   │   │   ├── supabase-storage.service.spec.ts # [NUEVO] Tests unitarios
│   │   │   └── README.md                    # [NUEVO]
│   │   ├── storage.module.ts               # [NUEVO] Módulo que registra adapters y servicios
│   │   └── README.md                        # [NUEVO]
│   │
│   ├── uploader/                            # [NUEVO] Servicio principal de subida
│   │   ├── upload-file.service.ts           # [NUEVO] Generado con `nest g service`
│   │   ├── upload-file.service.spec.ts      # [NUEVO] Tests unitarios
│   │   ├── uploader.module.ts              # [NUEVO] Módulo que importa StorageModule
│   │   └── README.md                        # [NUEVO]
│   │
│   ├── app.module.ts                        # [MODIFICAR] Importar UploaderModule
│   ├── main.ts                              # (SIN CAMBIOS)
│   └── ... (módulos existentes sin cambios)
│
├── test/
│   ├── upload-local.e2e-spec.ts             # [NUEVO] Test de integración local storage
│   ├── upload-supabase.e2e-spec.ts          # [NUEVO] Test de integración supabase storage
│   └── ... (tests existentes sin cambios)
│
├── docs/
│   ├── DECISIONS.md                         # [MODIFICAR] Agregar ADR-018 a ADR-025
│   └── IMPLEMENTATION_PLAN_M3.md            # [NUEVO] Este archivo
│
├── .env.example                             # [MODIFICAR] Agregar variables de Supabase y STORAGE_METHOD
├── .gitignore                               # [MODIFICAR] Agregar uploads/*
└── package.json                             # [MODIFICAR] Agregar @supabase/supabase-js
```

---

## 4. Dependencias Nuevas

### Producción
```bash
npm install @supabase/supabase-js
```

### Desarrollo
No se requieren nuevas dependencias de desarrollo.

> **Nota**: `multer` y `@types/multer` ya están incluidos en `@nestjs/platform-express`. No es necesario instalar paquetes adicionales para manejar archivos con Multer.

---

## 5. Variables de Entorno Nuevas

Agregar las siguientes variables al archivo `.env.example` y `.env.local`:

```env
# Storage
STORAGE_METHOD=local  # Valores posibles: 'local' | 'supabase'

# Supabase (solo si STORAGE_METHOD=supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=your-bucket-name
```

---

## 6. Secuencia de Implementación

La implementación sigue un orden de dependencias (se construye de abajo hacia arriba):

### Fase 1 → Interfaces y Clase Abstracta
### Fase 2 → Cliente Supabase
### Fase 3 → Servicios de Almacenamiento Específicos
### Fase 4 → Adapters Concretos
### Fase 5 → Servicio Principal (UploadFileService)
### Fase 6 → Módulos y Registro en AppModule
### Fase 7 → Testing
### Fase 8 → Documentación y NFRs

---

## 7. Fase 1 — Interfaces y Clase Abstracta

### 7.1 Crear `src/storage/adapters/interfaces/upload-file.dto.ts`

```typescript
/**
 * Contrato de propiedades que debe incluir cualquier archivo a subir.
 * Es una interfaz interna (no atraviesa la capa HTTP).
 */
export interface UploadFileDTO {
  /** Nombre del archivo incluyendo extensión (e.g. "profile.jpg") */
  fileName: string;

  /** MIME type del archivo (e.g. "image/jpeg", "application/pdf") */
  contentType: string;

  /** Contenido binario del archivo */
  buffer: Buffer;

  /** Carpeta destino dentro del storage (e.g. "avatars", "documents") */
  folder: string;
}
```

### 7.2 Crear `src/storage/adapters/interfaces/upload-file-result.ts`

```typescript
/**
 * Contrato de propiedades que retorna cualquier método de subida de archivos.
 */
export interface UploadFileResult {
  /** Ruta interna del archivo en el storage (e.g. "avatars/abc123.jpg") */
  path: string;

  /** URL pública accesible del archivo */
  publicUrl: string;
}
```

### 7.3 Crear `src/storage/adapters/storage.adapter.ts`

```typescript
import { UploadFileDTO } from './interfaces/upload-file.dto';
import { UploadFileResult } from './interfaces/upload-file-result';

/**
 * Clase abstracta que define el contrato para cualquier backend de almacenamiento.
 * Las clases concretas deben implementar upload() y delete().
 */
export abstract class StorageAdapter {
  /**
   * Sube un archivo al backend de almacenamiento.
   * @param dto Datos del archivo a subir
   * @returns Ruta y URL pública del archivo subido
   */
  abstract upload(dto: UploadFileDTO): Promise<UploadFileResult>;

  /**
   * Elimina un archivo del backend de almacenamiento.
   * @param path Ruta del archivo a eliminar
   */
  abstract delete(path: string): Promise<void>;
}
```

---

## 8. Fase 2 — Cliente Supabase

### 8.1 Crear `src/clients/supabase/supabase.client.ts`

Este archivo exporta un **provider de NestJS** que crea e inyecta el cliente de Supabase. Usa un token de inyección personalizado. Retorna `null` si las variables de entorno no están configuradas (versión segura para modo local).

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

/**
 * Token de inyección para el cliente Supabase.
 * Usar este token con @Inject(SUPABASE_CLIENT) en los servicios consumidores.
 */
export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

/**
 * Provider factory que crea el cliente Supabase usando variables de entorno.
 * Retorna null si las variables no están definidas (modo local seguro).
 */
export const supabaseClientProvider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): SupabaseClient | null => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return null; // No se inicializa si no hay credenciales
    }

    return createClient(supabaseUrl, supabaseKey);
  },
};
```

### 8.2 Crear `src/clients/supabase/supabase.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { supabaseClientProvider } from './supabase.client';

@Global()
@Module({
  providers: [supabaseClientProvider],
  exports: [supabaseClientProvider],
})
export class SupabaseModule {}
```

> **Nota de diseño**: Se marca como `@Global()` para que cualquier módulo pueda inyectar `SUPABASE_CLIENT` sin importar explícitamente `SupabaseModule`. La validación de que el cliente no sea `null` se realiza en `SupabaseStorageService` al momento de usarse.

---

## 9. Fase 3 — Servicios de Almacenamiento Específicos

### 9.1 Crear `src/storage/services/local-storage.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UploadFileDTO } from '../adapters/interfaces/upload-file.dto';
import { UploadFileResult } from '../adapters/interfaces/upload-file-result';

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;

  constructor() {
    // La carpeta uploads/ está en la raíz del proyecto
    this.basePath = path.join(process.cwd(), 'uploads');
  }

  /**
   * Guarda un archivo en el sistema de archivos local.
   * Crea el subdirectorio (folder) si no existe.
   *
   * @param dto Datos del archivo a guardar
   * @returns path relativo y URL pública del archivo guardado
   */
  async save(dto: UploadFileDTO): Promise<UploadFileResult> {
    const folderPath = path.join(this.basePath, dto.folder);

    // Crear directorio si no existe
    await fs.mkdir(folderPath, { recursive: true });

    // Generar nombre único para evitar colisiones
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${dto.fileName}`;
    const filePath = path.join(folderPath, uniqueFileName);

    // Escribir archivo en disco
    await fs.writeFile(filePath, dto.buffer);

    const relativePath = `${dto.folder}/${uniqueFileName}`;
    this.logger.log(`File saved locally: ${relativePath}`);

    return {
      path: relativePath,
      publicUrl: `/uploads/${relativePath}`,
    };
  }
}
```

> **Nota sobre `publicUrl`**: Para que la URL funcione, se necesitaría servir archivos estáticos con `ServeStaticModule` o similar. Esa configuración está fuera del alcance de este plan, pero la URL retornada sigue un formato predecible que puede configurarse después.

### 9.2 Crear `src/storage/services/supabase-storage.service.ts`

```typescript
import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../clients/supabase/supabase.client';
import { UploadFileDTO } from '../adapters/interfaces/upload-file.dto';
import { UploadFileResult } from '../adapters/interfaces/upload-file-result';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient | null,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>(
      'SUPABASE_STORAGE_BUCKET',
      'uploads',
    );
  }

  /**
   * Sube un archivo a Supabase Storage.
   *
   * @param dto Datos del archivo a subir
   * @returns path en el bucket y URL pública del archivo
   */
  async save(dto: UploadFileDTO): Promise<UploadFileResult> {
    if (!this.supabaseClient) {
      throw new InternalServerErrorException(
        'Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      );
    }

    // Generar nombre único para evitar colisiones
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${dto.fileName}`;
    const filePath = `${dto.folder}/${uniqueFileName}`;

    // Subir archivo al bucket
    const { data, error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .upload(filePath, dto.buffer, {
        contentType: dto.contentType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to upload file to Supabase: ${error.message}`,
      );
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = this.supabaseClient.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    this.logger.log(`File uploaded to Supabase: ${data.path}`);

    return {
      path: data.path,
      publicUrl,
    };
  }
}
```

---

## 10. Fase 4 — Adapters Concretos

### 10.1 Crear `src/storage/adapters/local-storage.adapter.ts`

```typescript
import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageAdapter } from './storage.adapter';
import { UploadFileDTO } from './interfaces/upload-file.dto';
import { UploadFileResult } from './interfaces/upload-file-result';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class LocalStorageAdapter extends StorageAdapter {
  constructor(private readonly localStorageService: LocalStorageService) {
    super();
  }

  async upload(dto: UploadFileDTO): Promise<UploadFileResult> {
    return this.localStorageService.save(dto);
  }

  async delete(_path: string): Promise<void> {
    throw new NotImplementedException(
      'LocalStorageAdapter.delete() is not yet implemented.',
    );
  }
}
```

### 10.2 Crear `src/storage/adapters/supabase-storage.adapter.ts`

```typescript
import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageAdapter } from './storage.adapter';
import { UploadFileDTO } from './interfaces/upload-file.dto';
import { UploadFileResult } from './interfaces/upload-file-result';
import { SupabaseStorageService } from '../services/supabase-storage.service';

@Injectable()
export class SupabaseStorageAdapter extends StorageAdapter {
  constructor(
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {
    super();
  }

  async upload(dto: UploadFileDTO): Promise<UploadFileResult> {
    return this.supabaseStorageService.save(dto);
  }

  async delete(_path: string): Promise<void> {
    throw new NotImplementedException(
      'SupabaseStorageAdapter.delete() is not yet implemented.',
    );
  }
}
```

---

## 11. Fase 5 — Servicio Principal (UploadFileService)

### 11.1 Generar el servicio con CLI de NestJS

```bash
cd yawi_api
npx nest g service uploader/upload-file --flat --no-spec
```

> **Nota sobre `--flat`**: Evita crear un subdirectorio adicional. El flag `--no-spec` evita generar el spec automático ya que lo escribiremos manualmente con más detalle.

> **Importante**: Después de generar el servicio, verificar que NestJS no haya modificado `AppModule`. Si agregó `UploadFileService` a los providers de `AppModule`, removerlo; lo registraremos en `UploaderModule`.

### 11.2 Implementar `src/uploader/upload-file.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter } from '../storage/adapters/storage.adapter';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';
import { UploadFileDTO } from '../storage/adapters/interfaces/upload-file.dto';
import { UploadFileResult } from '../storage/adapters/interfaces/upload-file-result';

@Injectable()
export class UploadFileService {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageAdapter: LocalStorageAdapter,
    private readonly supabaseStorageAdapter: SupabaseStorageAdapter,
  ) {}

  /**
   * Sube un archivo al backend de almacenamiento configurado.
   * Transforma el archivo Multer a UploadFileDTO internamente.
   *
   * @param file Archivo recibido desde Multer (Express.Multer.File)
   * @param folder Carpeta destino en el storage (e.g. "avatars")
   * @returns Resultado de la subida (path + publicUrl)
   */
  async execute(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadFileResult> {
    // Transformar Express.Multer.File → UploadFileDTO
    const dto: UploadFileDTO = {
      fileName: file.originalname,
      contentType: file.mimetype,
      buffer: file.buffer,
      folder,
    };

    // Seleccionar adapter según variable de entorno
    const adapter = this.resolveAdapter();

    return adapter.upload(dto);
  }

  /**
   * Resuelve el adapter de almacenamiento basado en STORAGE_METHOD.
   * Valores válidos: 'local' | 'supabase'
   * Default: 'local'
   */
  private resolveAdapter(): StorageAdapter {
    const method = this.configService.get<string>('STORAGE_METHOD', 'local');

    switch (method) {
      case 'local':
        return this.localStorageAdapter;
      case 'supabase':
        return this.supabaseStorageAdapter;
      default:
        throw new BadRequestException(
          `Invalid STORAGE_METHOD: "${method}". Expected "local" or "supabase".`,
        );
    }
  }
}
```

---

## 12. Fase 6 — Módulos y Registro

### 12.1 Crear `src/storage/storage.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../clients/supabase/supabase.module';
import { LocalStorageService } from './services/local-storage.service';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from './adapters/supabase-storage.adapter';

@Module({
  imports: [SupabaseModule],
  providers: [
    LocalStorageService,
    SupabaseStorageService,
    LocalStorageAdapter,
    SupabaseStorageAdapter,
  ],
  exports: [LocalStorageAdapter, SupabaseStorageAdapter],
})
export class StorageModule {}
```

### 12.2 Crear `src/uploader/uploader.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { UploadFileService } from './upload-file.service';

@Module({
  imports: [StorageModule],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploaderModule {}
```

### 12.3 Modificar `src/app.module.ts`

Agregar la importación del `UploaderModule`:

```diff
 import { PaymentPreferencesModule } from './payment-preferences/payment-preferences.module';
+import { UploaderModule } from './uploader/uploader.module';
 import { AppController } from './app.controller';
 import { AppService } from './app.service';

 @Module({
   imports: [
     ConfigModule.forRoot({
       isGlobal: true,
       envFilePath: ['.env.local', '.env'],
     }),
     DatabaseModule,
     VendorsModule,
     PhoneNumbersModule,
     BusinessesModule,
     PaymentPreferencesModule,
+    UploaderModule,
   ],
   controllers: [AppController],
   providers: [AppService],
 })
 export class AppModule {}
```

---

## 13. Fase 7 — Testing

### 13.1 Configuración de Testing

Todos los tests unitarios usan la misma configuración de Jest existente (`package.json > jest`). Los tests e2e usan `test/jest-e2e.json` con `maxWorkers: 1`.

**Convención de nombrado de tests (consistente con proyecto)**:
- Unitarios: `*.spec.ts` dentro de cada carpeta de módulo
- E2E: `*.e2e-spec.ts` dentro de `test/`

### 13.2 Tests Unitarios: `src/storage/services/local-storage.service.spec.ts`

**Funciones a testear**: `save()`

| # | Test | Categoría |
|---|------|-----------|
| 1 | Happy Path: debe guardar el archivo y retornar path y publicUrl correctos | Funcional |
| 2 | Debe crear el directorio si no existe (fs.mkdir con recursive) | Caso Límite |
| 3 | Debe generar un nombre de archivo único con timestamp | Consistencia |

**Patrón de testing**:
- Mockear `fs/promises` (`jest.mock('fs/promises')`)
- Mockear `Date.now()` para obtener timestamps predecibles
- Verificar que `fs.mkdir` es llamado con `{ recursive: true }`
- Verificar que `fs.writeFile` es llamado con el buffer correcto
- No escribir archivos reales en disco

```typescript
import { LocalStorageService } from './local-storage.service';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    service = new LocalStorageService();
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockDto = {
    fileName: 'test-image.jpg',
    contentType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    folder: 'avatars',
  };

  describe('save()', () => {
    it('1. Happy Path: debe guardar el archivo y retornar path y publicUrl', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      const result = await service.save(mockDto);

      expect(result.path).toBe('avatars/1234567890-test-image.jpg');
      expect(result.publicUrl).toBe('/uploads/avatars/1234567890-test-image.jpg');
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('2. Debe crear el directorio con recursive: true', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      await service.save(mockDto);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('avatars'),
        { recursive: true },
      );
    });

    it('3. Debe generar un nombre de archivo único con timestamp', async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      const result = await service.save(mockDto);

      expect(result.path).toContain('1234567890');
      expect(result.path).toContain('test-image.jpg');
    });
  });
});
```

### 13.3 Tests Unitarios: `src/storage/services/supabase-storage.service.spec.ts`

**Funciones a testear**: `save()`

| # | Test | Categoría |
|---|------|-----------|
| 1 | Happy Path: debe subir el archivo y retornar path y publicUrl de Supabase | Funcional |
| 2 | Debe lanzar InternalServerErrorException si el cliente Supabase es null | Error Handling |
| 3 | Debe lanzar InternalServerErrorException si Supabase retorna error en upload | Error Handling |

**Patrón de testing**:
- Crear mock del `SupabaseClient` con métodos `storage.from().upload()` y `storage.from().getPublicUrl()`
- Mockear `ConfigService.get()` para retornar nombre de bucket
- No realizar llamadas reales a Supabase

```typescript
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseStorageService } from './supabase-storage.service';

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let mockSupabaseClient: any;
  let mockConfigService: Partial<ConfigService>;

  const mockDto = {
    fileName: 'test-image.jpg',
    contentType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    folder: 'avatars',
  };

  beforeEach(() => {
    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
        }),
      },
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-bucket'),
    };
  });

  describe('save()', () => {
    it('1. Happy Path: debe subir y retornar path y publicUrl', async () => {
      const mockUpload = mockSupabaseClient.storage.from().upload;
      mockUpload.mockResolvedValue({
        data: { path: 'avatars/1234-test-image.jpg' },
        error: null,
      });

      const mockGetPublicUrl = mockSupabaseClient.storage.from().getPublicUrl;
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/avatars/1234-test-image.jpg' },
      });

      service = new SupabaseStorageService(
        mockSupabaseClient,
        mockConfigService as ConfigService,
      );

      const result = await service.save(mockDto);

      expect(result.path).toBe('avatars/1234-test-image.jpg');
      expect(result.publicUrl).toContain('https://supabase.co');
    });

    it('2. Debe lanzar error si el cliente Supabase es null', async () => {
      service = new SupabaseStorageService(
        null,
        mockConfigService as ConfigService,
      );

      await expect(service.save(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('3. Debe lanzar error si Supabase retorna error en upload', async () => {
      const mockUpload = mockSupabaseClient.storage.from().upload;
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      service = new SupabaseStorageService(
        mockSupabaseClient,
        mockConfigService as ConfigService,
      );

      await expect(service.save(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
```

### 13.4 Tests Unitarios: `src/uploader/upload-file.service.spec.ts`

**Funciones a testear**: `execute()`

| # | Test | Categoría |
|---|------|-----------|
| 1 | Happy Path: debe usar LocalStorageAdapter cuando STORAGE_METHOD=local | Funcional |
| 2 | Happy Path: debe usar SupabaseStorageAdapter cuando STORAGE_METHOD=supabase | Funcional |
| 3 | Debe lanzar BadRequestException si STORAGE_METHOD tiene un valor inválido | Error Handling |

**Patrón de testing**:
- Mockear `ConfigService`, `LocalStorageAdapter`, `SupabaseStorageAdapter`
- Crear un mock de `Express.Multer.File` con las propiedades necesarias
- Verificar que el adapter correcto es invocado y que la transformación de Multer → DTO es correcta

```typescript
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFileService } from './upload-file.service';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';

describe('UploadFileService', () => {
  let service: UploadFileService;
  let mockConfigService: Partial<ConfigService>;
  let mockLocalAdapter: Partial<LocalStorageAdapter>;
  let mockSupabaseAdapter: Partial<SupabaseStorageAdapter>;

  const mockFile: Partial<Express.Multer.File> = {
    originalname: 'photo.png',
    mimetype: 'image/png',
    buffer: Buffer.from('fake'),
  };

  const mockResult = {
    path: 'avatars/123-photo.png',
    publicUrl: '/uploads/avatars/123-photo.png',
  };

  beforeEach(() => {
    mockLocalAdapter = {
      upload: jest.fn().mockResolvedValue(mockResult),
    };

    mockSupabaseAdapter = {
      upload: jest.fn().mockResolvedValue(mockResult),
    };
  });

  describe('execute()', () => {
    it('1. Debe usar LocalStorageAdapter cuando STORAGE_METHOD=local', async () => {
      mockConfigService = { get: jest.fn().mockReturnValue('local') };

      service = new UploadFileService(
        mockConfigService as ConfigService,
        mockLocalAdapter as LocalStorageAdapter,
        mockSupabaseAdapter as SupabaseStorageAdapter,
      );

      const result = await service.execute(mockFile as Express.Multer.File, 'avatars');

      expect(result).toEqual(mockResult);
      expect(mockLocalAdapter.upload).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAdapter.upload).not.toHaveBeenCalled();
    });

    it('2. Debe usar SupabaseStorageAdapter cuando STORAGE_METHOD=supabase', async () => {
      mockConfigService = { get: jest.fn().mockReturnValue('supabase') };

      service = new UploadFileService(
        mockConfigService as ConfigService,
        mockLocalAdapter as LocalStorageAdapter,
        mockSupabaseAdapter as SupabaseStorageAdapter,
      );

      const result = await service.execute(mockFile as Express.Multer.File, 'avatars');

      expect(result).toEqual(mockResult);
      expect(mockSupabaseAdapter.upload).toHaveBeenCalledTimes(1);
      expect(mockLocalAdapter.upload).not.toHaveBeenCalled();
    });

    it('3. Debe lanzar BadRequestException si STORAGE_METHOD es inválido', async () => {
      mockConfigService = { get: jest.fn().mockReturnValue('invalid_method') };

      service = new UploadFileService(
        mockConfigService as ConfigService,
        mockLocalAdapter as LocalStorageAdapter,
        mockSupabaseAdapter as SupabaseStorageAdapter,
      );

      await expect(
        service.execute(mockFile as Express.Multer.File, 'avatars'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

### 13.5 Test de Integración: `test/upload-local.e2e-spec.ts`

**Objetivo**: Verificar el flujo completo desde `UploadFileService` → `LocalStorageAdapter` → `LocalStorageService` usando mocks de filesystem.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UploadFileService } from '../src/uploader/upload-file.service';
import { StorageModule } from '../src/storage/storage.module';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('Upload Local Storage Integration (e2e)', () => {
  let service: UploadFileService;
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              STORAGE_METHOD: 'local',
            }),
          ],
        }),
        StorageModule,
      ],
      providers: [UploadFileService],
    }).compile();

    service = moduleFixture.get<UploadFileService>(UploadFileService);
  });

  beforeEach(() => {
    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Debe subir un archivo usando almacenamiento local y retornar resultado válido', async () => {
    const mockFile: Partial<Express.Multer.File> = {
      originalname: 'integration-test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('integration-test-data'),
    };

    const result = await service.execute(
      mockFile as Express.Multer.File,
      'test-folder',
    );

    expect(result).toBeDefined();
    expect(result.path).toContain('test-folder');
    expect(result.path).toContain('integration-test.jpg');
    expect(result.publicUrl).toContain('/uploads/');
    expect(mockedFs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('2. El archivo debe contener los datos del buffer original', async () => {
    const testBuffer = Buffer.from('specific-content-check');
    const mockFile: Partial<Express.Multer.File> = {
      originalname: 'data-check.txt',
      mimetype: 'text/plain',
      buffer: testBuffer,
    };

    await service.execute(mockFile as Express.Multer.File, 'documents');

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      testBuffer,
    );
  });

  it('3. Debe crear el directorio de destino si no existe', async () => {
    const mockFile: Partial<Express.Multer.File> = {
      originalname: 'new-folder-test.png',
      mimetype: 'image/png',
      buffer: Buffer.from('folder-creation-test'),
    };

    await service.execute(mockFile as Express.Multer.File, 'new-folder');

    expect(mockedFs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('new-folder'),
      { recursive: true },
    );
  });
});
```

### 13.6 Test de Integración: `test/upload-supabase.e2e-spec.ts`

**Objetivo**: Verificar el flujo completo `UploadFileService` → `SupabaseStorageAdapter` → `SupabaseStorageService` con el cliente Supabase completamente mockeado.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UploadFileService } from '../src/uploader/upload-file.service';
import { LocalStorageService } from '../src/storage/services/local-storage.service';
import { SupabaseStorageService } from '../src/storage/services/supabase-storage.service';
import { LocalStorageAdapter } from '../src/storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../src/storage/adapters/supabase-storage.adapter';
import { SUPABASE_CLIENT } from '../src/clients/supabase/supabase.client';

describe('Upload Supabase Storage Integration (e2e)', () => {
  let service: UploadFileService;
  let mockSupabaseClient: any;

  beforeAll(async () => {
    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'avatars/123-supabase-test.jpg' },
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: {
              publicUrl:
                'https://project.supabase.co/storage/v1/object/public/uploads/avatars/123-supabase-test.jpg',
            },
          }),
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              STORAGE_METHOD: 'supabase',
              SUPABASE_STORAGE_BUCKET: 'test-bucket',
            }),
          ],
        }),
      ],
      providers: [
        UploadFileService,
        LocalStorageService,
        SupabaseStorageService,
        LocalStorageAdapter,
        SupabaseStorageAdapter,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
      ],
    }).compile();

    service = moduleFixture.get<UploadFileService>(UploadFileService);
  });

  it('1. Debe subir un archivo usando Supabase Storage y retornar resultado válido', async () => {
    const mockFile: Partial<Express.Multer.File> = {
      originalname: 'supabase-test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('supabase-test-data'),
    };

    const result = await service.execute(
      mockFile as Express.Multer.File,
      'avatars',
    );

    expect(result).toBeDefined();
    expect(result.path).toContain('avatars');
    expect(result.publicUrl).toContain('supabase.co');
  });

  it('2. Debe invocar el método upload del cliente Supabase con contentType correcto', async () => {
    const mockFile: Partial<Express.Multer.File> = {
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('pdf-content'),
    };

    await service.execute(mockFile as Express.Multer.File, 'documents');

    const uploadCall = mockSupabaseClient.storage.from().upload;
    expect(uploadCall).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Buffer),
      expect.objectContaining({ contentType: 'application/pdf' }),
    );
  });

  it('3. Debe usar el bucket name configurado en variables de entorno', async () => {
    const mockFile: Partial<Express.Multer.File> = {
      originalname: 'bucket-test.png',
      mimetype: 'image/png',
      buffer: Buffer.from('bucket-test'),
    };

    await service.execute(mockFile as Express.Multer.File, 'images');

    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('test-bucket');
  });
});
```

---

## 14. Fase 8 — Documentación y NFRs

### 14.1 Archivos `.gitignore` y `.env.example`

#### Modificar `.gitignore`
Agregar al final:
```gitignore
# Uploaded files (local storage)
/uploads/*
!/uploads/.gitkeep
```

#### Modificar `.env.example`
Agregar las nuevas variables:
```env
# Storage
STORAGE_METHOD=local

# Supabase (solo si STORAGE_METHOD=supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=your-bucket-name
```

### 14.2 Crear `uploads/.gitkeep`

Archivo vacío para que Git trackee la carpeta.

### 14.3 README: `src/clients/supabase/README.md`

Contenido:
- Responsabilidades del provider y módulo
- Variables de entorno requeridas (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- Ejemplo de uso con `@Inject(SUPABASE_CLIENT)`
- Nota: Este cliente se usa exclusivamente para Supabase Storage; la persistencia en BD permanece aislada con TypeORM

### 14.4 README: `src/storage/README.md`

Contenido:
- Descripción de la capa de abstracción (patrón Adapter)
- Diagrama de arquitectura (UploadFileService → Adapters → Services)
- Descripción de interfaces, clase abstracta, adapters y servicios
- Instrucciones para agregar nuevos backends de almacenamiento

### 14.5 README: `src/storage/adapters/README.md`

Contenido:
- Tabla de archivos con descripciones
- Nota sobre `delete()` no implementado
- Guía para agregar nuevos adapters

### 14.6 README: `src/storage/services/README.md`

Contenido:
- Descripción de `LocalStorageService` (rutas, comportamiento de mkdir)
- Descripción de `SupabaseStorageService` (bucket, validación de cliente)

### 14.7 README: `src/uploader/README.md`

Contenido:
- Descripción del servicio orquestador
- Configuración via `STORAGE_METHOD`
- Ejemplo de uso desde un controller con `@FileInterceptor`
- Referencia a tests unitarios y e2e

### 14.8 Actualizar `docs/DECISIONS.md`

Agregar al final del archivo las decisiones ADR-018 a ADR-025 detalladas en la Sección 2 de este plan, manteniendo el formato de tabla existente.

---

## 15. Checklist de Verificación

### Pre-implementación
- [ ] Instalar `@supabase/supabase-js` con `npm install @supabase/supabase-js`
- [ ] Crear carpeta `uploads/` con `.gitkeep` en la raíz del proyecto
- [ ] Actualizar `.gitignore` con exclusión de `uploads/*`
- [ ] Actualizar `.env.example` y `.env.local` con nuevas variables

### Implementación (en orden)
- [ ] Crear interfaces `UploadFileDTO` y `UploadFileResult`
- [ ] Crear clase abstracta `StorageAdapter`
- [ ] Crear `supabase.client.ts` y `supabase.module.ts`
- [ ] Crear `LocalStorageService`
- [ ] Crear `SupabaseStorageService`
- [ ] Crear `LocalStorageAdapter`
- [ ] Crear `SupabaseStorageAdapter`
- [ ] Generar `UploadFileService` con `npx nest g service uploader/upload-file --flat --no-spec`
- [ ] Implementar `UploadFileService` con lógica de `resolveAdapter()`
- [ ] Crear `StorageModule`
- [ ] Crear `UploaderModule`
- [ ] Importar `UploaderModule` en `AppModule`

### Testing
- [ ] `local-storage.service.spec.ts` — ≥ 3 tests (mockear fs)
- [ ] `supabase-storage.service.spec.ts` — ≥ 3 tests (mockear Supabase client)
- [ ] `upload-file.service.spec.ts` — ≥ 3 tests (mockear adapters)
- [ ] `upload-local.e2e-spec.ts` — ≥ 3 tests (integración local)
- [ ] `upload-supabase.e2e-spec.ts` — ≥ 3 tests (integración Supabase)
- [ ] Ejecutar `npm run test:unit` — todos los tests deben pasar
- [ ] Ejecutar `npm run test:e2e` — todos los tests deben pasar
- [ ] Ejecutar `npm run build` — compilación sin errores

### Documentación
- [ ] README en `src/clients/supabase/`
- [ ] README en `src/storage/`
- [ ] README en `src/storage/adapters/`
- [ ] README en `src/storage/services/`
- [ ] README en `src/uploader/`
- [ ] Actualizar `docs/DECISIONS.md` con ADR-018 a ADR-025

### Verificación final
- [ ] `npm run build` compila sin errores
- [ ] `npm run test:unit` pasa todos los tests (incluyendo los existentes)
- [ ] `npm run test:e2e` pasa todos los tests (incluyendo los existentes)
- [ ] `npm run lint` sin errores
- [ ] Las variables de entorno están documentadas en `.env.example`

---

## 16. Diagrama de Flujo de Subida de Archivos

```
Controller (futuro)
    │
    │  file: Express.Multer.File
    │  folder: string
    ▼
UploadFileService.execute()
    │
    │  1. Transforma file → UploadFileDTO
    │  2. Lee STORAGE_METHOD de ConfigService
    │  3. resolveAdapter() → match
    │
    ├── STORAGE_METHOD = 'local'
    │       │
    │       ▼
    │   LocalStorageAdapter.upload(dto)
    │       │
    │       ▼
    │   LocalStorageService.save(dto)
    │       │
    │       ▼
    │   fs.writeFile() → uploads/<folder>/<timestamp>-<fileName>
    │       │
    │       ▼
    │   { path, publicUrl }
    │
    └── STORAGE_METHOD = 'supabase'
            │
            ▼
        SupabaseStorageAdapter.upload(dto)
            │
            ▼
        SupabaseStorageService.save(dto)
            │
            ▼
        supabaseClient.storage.from(bucket).upload()
            │
            ▼
        { path, publicUrl }
```
