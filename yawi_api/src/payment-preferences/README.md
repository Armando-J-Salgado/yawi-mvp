# 💳 Payment Preferences Module

Módulo encargado de la gestión integral de las preferencias de pago (`PaymentPreference`), vinculadas a su propietario (`Vendor`).

---

## 📁 Estructura del Módulo

```text
src/payment-preferences/
├── dto/
│   ├── create-payment-preference.dto.ts    # DTO con validaciones para crear preferencia (name, account_information, owner_id)
│   ├── update-payment-preference.dto.ts    # DTO para actualización parcial (omite owner_id)
│   └── filter-payment-preference.dto.ts    # DTO para filtrado en listados (?name, ?owner_id, ?withDeleted)
├── entities/
│   └── payment-preference.entity.ts        # Entidad TypeORM con Swagger, account_information simple-json nullable y ManyToOne a Vendor
├── payment-preferences.controller.ts       # Controlador REST con documentación Swagger completa
├── payment-preferences.service.ts          # Lógica de negocio y soft delete
├── payment-preferences.module.ts           # Módulo NestJS con TypeOrmModule.forFeature([PaymentPreference, Vendor])
├── payment-preferences.controller.spec.ts  # Pruebas unitarias de controlador
└── payment-preferences.service.spec.ts     # Pruebas unitarias de servicio con SQLite in-memory
```

---

## 🎯 Operaciones y Endpoints

| Método | Endpoint | Descripción | Notas |
|--------|----------|-------------|-------|
| `POST` | `/payment-preferences` | Crear nueva preferencia de pago | Valida existencia del `Vendor` propietario (`owner_id`). `account_information` es JSON nullable (`simple-json`). |
| `GET` | `/payment-preferences` | Listar preferencias de pago | Soporta filtros (`name`, `owner_id`) y soft delete (`withDeleted=true`). Incluye relación `owner`. |
| `GET` | `/payment-preferences/:id` | Detalle de preferencia de pago | Retorna la preferencia con su entidad propietaria `owner` y `account_information` deserializado. |
| `PATCH` | `/payment-preferences/:id` | Actualización parcial | Actualiza campos permitidos (nombre, información de la cuenta). |
| `DELETE` | `/payment-preferences/:id` | Soft Delete (204) | Eliminación lógica mediante `@DeleteDateColumn()`. No borra físicamente. |
| `PATCH` | `/payment-preferences/:id/recover` | Restauración | Restaura una preferencia soft-deleted removiendo el timestamp `deletedAt`. |

---

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias de este módulo
npm run test:unit -- src/payment-preferences/
```
