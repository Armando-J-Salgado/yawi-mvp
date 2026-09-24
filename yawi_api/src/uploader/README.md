# Uploader Module

## Overview
Módulo orquestador para la subida de archivos en la aplicación. Expone el servicio `UploadFileService`, el cual es el único punto de contacto que otros módulos de negocio (vendors, users, etc.) deben consumir para subir archivos.

## Exports
- `UploadFileService`: Servicio principal de subida.
- `UploaderModule`: Módulo a importar en `AppModule` u otros módulos de negocio.

## API del Servicio
```typescript
class UploadFileService {
  async execute(file: Express.Multer.File, folder: string): Promise<UploadFileResult>;
}
```

## Flujo Interno
1. Valida existencia del archivo (`Express.Multer.File`) y que `file.buffer` no esté vacío.
2. Lee `STORAGE_METHOD` de `ConfigService` (`'local'` o `'supabase'`).
3. Selecciona el adapter correspondiente (`LocalStorageAdapter` o `SupabaseStorageAdapter`).
4. Mapea `Express.Multer.File` + `folder` a `UploadFileDTO`.
5. Ejecuta `adapter.upload(dto)` y retorna `UploadFileResult`.

## Tests
- `upload-file.service.spec.ts`: Tests unitarios de orquestación, selección de adapter y validaciones (≥6 tests).
