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
