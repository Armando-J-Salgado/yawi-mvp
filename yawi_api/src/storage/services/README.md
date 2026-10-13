# Storage Services

## Overview
Contiene los servicios de bajo nivel con la implementación concreta de operaciones de I/O para cada mecanismo de almacenamiento.

## Archivos
| Archivo | Mecanismo | Comportamiento |
|---|---|---|
| `local-storage.service.ts` | Sistema de archivos local (`fs`) | Guarda en `<project_root>/uploads/<folder>/<uuid>.<ext>`. Crea directorios recursivamente. Retorna URL relativa (`/uploads/...`). |
| `supabase-storage.service.ts` | Supabase Storage SDK | Sube al bucket configurado en `<folder>/<uuid>.<ext>`. Obtiene URL pública vía `getPublicUrl()`. Maneja errores de Supabase. |

## Tests
- `local-storage.service.spec.ts`: Tests unitarios con mock de `fs` (≥4 tests).
- `supabase-storage.service.spec.ts`: Tests unitarios con mock de `SupabaseClient` (≥4 tests).
