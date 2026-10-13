# Storage Adapters

## Overview
Define el contrato estándar (`StorageAdapter`) y las implementaciones concretas que adaptan la interfaz unificada a los servicios de almacenamiento específicos.

## Archivos
| Archivo | Tipo | Descripción |
|---|---|---|
| `storage.adapter.ts` | Abstract Class | Contrato base con métodos `upload(file: UploadFileDTO)` y `delete(path: string)`. |
| `local-storage.adapter.ts` | Injectable Class | Implementa `StorageAdapter` delegando a `LocalStorageService`. |
| `supabase-storage.adapter.ts` | Injectable Class | Implementa `StorageAdapter` delegando a `SupabaseStorageService`. |
| `interfaces/upload-file.dto.ts` | Interface | DTO interno tipado para operaciones de upload. |
| `interfaces/upload-file-result.ts` | Interface | Resultado estandarizado de una subida exitosa (`url`, `path`, `size`, `mimetype`). |

## Contrato
```typescript
abstract class StorageAdapter {
  abstract upload(file: UploadFileDTO): Promise<UploadFileResult>;
  abstract delete(path: string): Promise<void>;
}
```
*Nota: `delete()` lanza `NotImplementedException` en esta versión.*
