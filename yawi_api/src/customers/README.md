# Módulo `customers`

El módulo **Customers** gestiona a los compradores finales en la plataforma YAWI.

## Entidad `Customer`

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID v4 | Primaria, Generada | Identificador único del cliente |
| `email` | string | Único, Requerido | Correo electrónico del cliente |
| `password` | string | Requerido, Oculto | Hash bcrypt de la contraseña |
| `name` | string | Requerido | Nombre del cliente |
| `lastname` | string | Requerido | Apellido del cliente |
| `country` | string | Requerido | País de residencia |
| `personal_address` | string | Requerido | Dirección personal o de entrega |
| `createdAt` | timestamp | Generado | Fecha de creación del registro |
| `updatedAt` | timestamp | Generado | Fecha de última modificación |
| `deletedAt` | timestamp | Nullable | Fecha de eliminación lógica (Soft Delete) |

> **Nota de Seguridad**: El campo `password` se almacena exclusivamente como hash `bcrypt` (10 rounds) y nunca es retornado en las respuestas del API ni documentado en Swagger.

---

## Endpoints REST

| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `POST` | `/customers` | Registrar un nuevo cliente | `201 Created` |
| `GET` | `/customers` | Listar clientes (admite filtros y `withDeleted`) | `200 OK` |
| `GET` | `/customers/:id` | Consultar detalle de un cliente por UUID | `200 OK` |
| `PATCH` | `/customers/:id` | Actualizar parcialmente los datos del cliente | `200 OK` |
| `DELETE` | `/customers/:id` | Eliminación lógica (Soft Delete) | `204 No Content` |
| `PATCH` | `/customers/:id/recover` | Restaurar un cliente eliminado lógicamente | `200 OK` |

---

## Ejemplos de Uso

### 1. Crear un Cliente

**Request:**
```http
POST /customers
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "CustomerPass123!",
  "name": "Ana",
  "lastname": "Pérez",
  "country": "El Salvador",
  "personal_address": "Colonia Escalón, San Salvador"
}
```

**Response (201 Created):**
```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "cliente@example.com",
  "name": "Ana",
  "lastname": "Pérez",
  "country": "El Salvador",
  "personal_address": "Colonia Escalón, San Salvador",
  "createdAt": "2026-09-23T15:30:00.000Z",
  "updatedAt": "2026-09-23T15:30:00.000Z",
  "deletedAt": null
}
```

### 2. Listar con Filtros

```http
GET /customers?email=cliente@example.com
GET /customers?country=El%20Salvador
GET /customers?withDeleted=true
```
