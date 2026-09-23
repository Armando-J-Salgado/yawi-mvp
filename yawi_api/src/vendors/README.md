# 🏢 Vendors Module

Módulo encargado de la gestión integral de los vendedores (entidad central `Vendor`).

---

## 📁 Estructura del Módulo

```text
src/vendors/
├── dto/
│   ├── create-vendor.dto.ts    # DTO con validaciones y campo phone_number
│   ├── update-vendor.dto.ts    # DTO para actualización parcial
│   └── filter-vendor.dto.ts    # DTO para filtrado en listados (?country, ?withDeleted, etc.)
├── entities/
│   └── vendor.entity.ts        # Entidad TypeORM con Swagger y relación OneToMany
├── vendors.controller.ts       # Controlador REST con documentación Swagger completa
├── vendors.service.ts          # Lógica de negocio, hashing bcrypt y transacciones
├── vendors.module.ts           # Módulo NestJS con TypeOrmModule.forFeature([Vendor, PhoneNumber])
├── vendors.controller.spec.ts  # Pruebas unitarias de controlador
└── vendors.service.spec.ts     # Pruebas unitarias de servicio con SQLite in-memory
```

---

## 🎯 Operaciones y Endpoints

| Método | Endpoint | Descripción | Transaccionalidad / Notas |
|--------|----------|-------------|---------------------------|
| `POST` | `/vendors` | Crear nuevo vendedor | **Transacción atómica**: Crea el `Vendor` y su `PhoneNumber` inicial en una sola operación con rollback automático en caso de fallo. Hashea password con `bcrypt`. |
| `GET` | `/vendors` | Listar vendedores | Soporta filtros dinámicos por query params (`name`, `surname`, `country`, `DUI`, `NIT`, `username`) y soft delete (`withDeleted=true`). |
| `GET` | `/vendors/:id` | Detalle de vendedor | Retorna el vendedor con su arreglo de `phone_numbers`. |
| `PATCH` | `/vendors/:id` | Actualización parcial | Actualiza campos modificables. Si incluye `password`, lo hashea antes de persistir. |
| `DELETE` | `/vendors/:id` | Soft Delete (204) | Eliminación lógica mediante `@DeleteDateColumn()`. No borra físicamente. |
| `PATCH` | `/vendors/:id/recover` | Restauración | Restaura un vendedor soft-deleted removiendo el timestamp `deletedAt`. |

---

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias de este módulo
npm run test:unit -- src/vendors/
```
