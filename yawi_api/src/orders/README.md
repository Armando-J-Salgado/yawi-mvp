# Módulo Orders

## Descripción

El módulo Orders gestiona las órdenes de compra de los Customers.
Una Order puede contener Products de varios Businesses.

## Diferencia entre Order y OrderProduct

- **Order**: Representa una compra global de un Customer. Contiene los totales,
  dirección de entrega y el estado de la compra.
- **OrderProduct**: Representa cada línea individual dentro de una Order.
  Almacena un snapshot histórico del nombre, precio y business del producto al
  momento de la compra.

## Flujo de creación

1. El cliente envía `customer_id`, `delivery_address` e `items` (arreglo de
   `product_id` + `quantity`).
2. El backend verifica la existencia del Customer y los Products.
3. Rechaza IDs duplicados, Products eliminados o inexistentes.
4. Copia el nombre, precio y `business_id` de cada Product como snapshot.
5. Calcula `subtotal` de cada línea (`unit_price * quantity`).
6. Calcula el `subtotal` global (suma de líneas).
7. Aplica `shipping_fee = $10.00` (fijo en el MVP).
8. Calcula `total = subtotal + shipping_fee`.
9. Persiste todo dentro de una transacción atómica.

## Ejemplo JSON de creación

**Request:**

```json
{
  "customer_id": "uuid-del-customer",
  "delivery_address": "Colonia Escalón, San Salvador",
  "items": [
    { "product_id": "uuid-producto-1", "quantity": 2 },
    { "product_id": "uuid-producto-2", "quantity": 1 }
  ]
}
```

**Response:**

```json
{
  "id": "uuid-de-la-order",
  "customer_id": "uuid-del-customer",
  "delivery_address": "Colonia Escalón, San Salvador",
  "status": "pending",
  "subtotal": 29.00,
  "shipping_fee": 10.00,
  "total": 39.00,
  "items": [
    {
      "id": "uuid-detalle",
      "order_id": "uuid-de-la-order",
      "product_id": "uuid-producto-1",
      "business_id": "uuid-business-1",
      "product_name": "Café Pacamara Especial",
      "unit_price": 12.00,
      "quantity": 2,
      "subtotal": 24.00
    }
  ]
}
```

## Snapshot histórico

Los campos `product_name`, `unit_price` y `business_id` se copian al momento
de la compra. Si el Product cambia de nombre o precio después, la Order conserva
los datos originales.

## Cálculo de totales

| Campo | Fórmula |
|---|---|
| `OrderProduct.subtotal` | `unit_price * quantity` |
| `Order.subtotal` | Suma de `OrderProduct.subtotal` |
| `Order.shipping_fee` | `$10.00` (fijo en MVP) |
| `Order.total` | `subtotal + shipping_fee` |

En el futuro se implementará una estrategia de cálculo de envío más compleja.

## Estados y transiciones

```
pending   → confirmed
pending   → cancelled
confirmed → preparing
confirmed → cancelled
preparing → delivered
preparing → cancelled
```

No se puede regresar de `delivered` ni salir de `cancelled`.

## Order global con Products de varios Businesses

Una Order puede mezclar Products de diferentes Businesses. Cada línea
(`OrderProduct`) conserva el `business_id` del Product al que pertenece.

## Consulta filtrada por Business

`GET /orders/business/:businessId` devuelve únicamente las líneas cuyo
`business_id` coincida, agrupadas por Order. No expone líneas de otros
Businesses.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/orders` | Crear una Order con sus líneas |
| `GET` | `/orders` | Listar Orders con filtros |
| `GET` | `/orders/:id` | Detalle de una Order |
| `GET` | `/orders/business/:businessId` | Líneas por Business |
| `PATCH` | `/orders/:id/status` | Cambiar estado |
| `DELETE` | `/orders/:id` | Soft delete |
| `PATCH` | `/orders/:id/recover` | Recuperar Order |

## Campos que el cliente NO puede enviar

- `total`
- `subtotal`
- `shipping_fee`
- `unit_price`
- `product_name`
- `business_id` (en items)
- `status` (en creación)

## Envío fijo en el MVP

El `shipping_fee` es un valor fijo de `$10.00`. La estrategia de cálculo de
envío según reglas dinámicas queda pendiente para una fase futura.

## Exclusiones

- Pagos, cobros, reembolsos o integración con proveedores de pago.
- Inventario, stock, reservas o decremento automático.
- Impuestos o descuentos.
- Edición de productos dentro de una Order existente.
- Autorización (Auth/JWT/roles).
- Notificaciones.
- Carrito persistente.
