# 🏪 Businesses Module

Módulo encargado de la gestión integral de los negocios (`Business`), vinculados a su propietario (`Vendor`).

---

## 📁 Estructura del Módulo

```text
src/businesses/
├── dto/
│   ├── create-business.dto.ts    # DTO con validaciones para crear negocio (name, description, address, balance, owner_id)
│   ├── update-business.dto.ts    # DTO para actualización parcial (omite owner_id)
│   └── filter-business.dto.ts    # DTO para filtrado en listados (?name, ?address, ?owner_id, ?withDeleted)
├── entities/
│   └── business.entity.ts        # Entidad TypeORM con Swagger, balance decimal(10,2) y relación ManyToOne a Vendor
├── businesses.controller.ts       # Controlador REST con documentación Swagger completa
├── businesses.service.ts          # Lógica de negocio y soft delete
├── businesses.module.ts           # Módulo NestJS con TypeOrmModule.forFeature([Business, Vendor])
├── businesses.controller.spec.ts  # Pruebas unitarias de controlador
└── businesses.service.spec.ts     # Pruebas unitarias de servicio con SQLite in-memory
```

---

## 🎯 Operaciones y Endpoints

| Método | Endpoint | Descripción | Notas |
|--------|----------|-------------|-------|
| `POST` | `/businesses` | Crear nuevo negocio | Valida existencia del `Vendor` propietario (`owner_id`). `balance` default 0.00 con `@Min(0)`. |
| `GET` | `/businesses` | Listar negocios | Soporta filtros (`name`, `address`, `owner_id`) y soft delete (`withDeleted=true`). Incluye relación `owner`. |
| `GET` | `/businesses/:id` | Detalle de negocio | Retorna el negocio con su entidad propietaria `owner`. |
| `PATCH` | `/businesses/:id` | Actualización parcial | Actualiza campos permitidos (nombre, descripción, dirección, balance). |
| `DELETE` | `/businesses/:id` | Soft Delete (204) | Eliminación lógica mediante `@DeleteDateColumn()`. No borra físicamente. |
| `PATCH` | `/businesses/:id/recover` | Restauración | Restaura un negocio soft-deleted removiendo el timestamp `deletedAt`. |

---

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias de este módulo
npm run test:unit -- src/businesses/
```
