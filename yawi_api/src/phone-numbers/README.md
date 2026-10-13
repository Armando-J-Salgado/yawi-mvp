# 📞 Phone Numbers Module

Módulo encargado de la administración de números telefónicos (`PhoneNumber`) vinculados a vendedores.

---

## 📁 Estructura del Módulo

```text
src/phone-numbers/
├── dto/
│   ├── create-phone-number.dto.ts    # DTO con number y owner_id
│   ├── update-phone-number.dto.ts    # DTO parcial (omite owner_id)
│   └── filter-phone-number.dto.ts    # DTO para filtrado por número, owner_id y withDeleted
├── entities/
│   └── phone-number.entity.ts        # Entidad TypeORM con relación ManyToOne a Vendor
├── phone-numbers.controller.ts       # Controlador REST con Swagger
├── phone-numbers.service.ts          # Lógica de persistencia y validación de propietario
├── phone-numbers.module.ts           # Módulo NestJS con TypeOrmModule.forFeature([PhoneNumber, Vendor])
├── phone-numbers.controller.spec.ts  # Pruebas unitarias de controlador
└── phone-numbers.service.spec.ts     # Pruebas unitarias de servicio con SQLite in-memory
```

---

## 🎯 Operaciones y Endpoints

| Método | Endpoint | Descripción | Notas |
|--------|----------|-------------|-------|
| `POST` | `/phone-numbers` | Crear y asociar teléfono | Valida que el `owner_id` pertenezca a un `Vendor` existente antes de guardar. |
| `GET` | `/phone-numbers` | Listar números | Permite filtrar por `number`, `owner_id` e incluir eliminados (`withDeleted=true`). |
| `GET` | `/phone-numbers/:id` | Detalle de número | Retorna el registro con los datos de su propietario (`owner`). |
| `PATCH` | `/phone-numbers/:id` | Actualización de número | Actualiza el campo `number`. |
| `DELETE` | `/phone-numbers/:id` | Soft Delete (204) | Eliminación lógica conservando el registro en la base de datos. |
| `PATCH` | `/phone-numbers/:id/recover` | Restauración | Restaura un número telefónico previamente eliminado. |

---

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias de este módulo
npm run test:unit -- src/phone-numbers/
```
