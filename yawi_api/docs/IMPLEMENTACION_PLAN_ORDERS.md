# Plan de Implementación — Módulos `orders` y `order-products`

## 1. Alcance y decisiones funcionales

Este plan define la implementación conjunta de Orders y Order-Products dentro
de `yawi_api`.

Una Order representa una compra global de un Customer. Puede contener Products
de varios Businesses. La relación entre una Order y sus Products será
normalizada mediante una entidad y tabla intermedia `OrderProduct`; no se
guardará una lista de productos como JSON dentro de `orders`.

### Decisiones confirmadas

- Una Order no tiene `business_id`; puede contener Products de varios
  Businesses.
- Un Customer puede tener muchas Orders.
- Un Business puede aparecer en muchas Orders mediante sus Order-Products.
- Una Order tiene uno o varios Order-Products.
- Un Product puede aparecer en muchas Orders.
- Los precios se consultan desde Product en el backend al crear la Order.
- `unit_price`, `product_name` y `subtotal` se guardan como snapshot histórico.
- `subtotal`, `shipping_fee` y `total` se calculan en backend.
- En el MVP `shipping_fee` es fijo de `$10.00`.
- Queda pendiente aplicar un patrón de diseño para calcular el envío según
  reglas futuras.
- `delivery_address` es texto requerido y se guarda en la Order.
- Estados permitidos: `pending`, `confirmed`, `preparing`, `delivered`,
  `cancelled`.
- La creación y sus detalles se ejecutan dentro de una transacción.

### Incluido

- Entidad TypeORM `Order`.
- Entidad TypeORM `OrderProduct`.
- Relaciones con `Customer`, `Business` y `Product`.
- DTOs de creación, actualización de estado y filtros.
- Creación transaccional de una Order con sus detalles.
- Cálculo de cantidades, subtotales, envío y total en backend.
- Snapshot histórico de los datos comerciales del Product.
- Consulta de Orders y detalle de sus Order-Products.
- Consulta de las líneas de una Order filtradas por Business.
- Soft delete y recuperación de Orders, siguiendo la convención existente.
- Validación de transición de estados.
- Swagger y README.
- Pruebas unitarias, integración y e2e.
- Seeders de Orders y Order-Products usando Customers, Businesses y Products.

### Excluido

- Carrito persistente.
- Pagos, cobros, reembolsos o integración con proveedores de pago.
- Inventario, stock, reservas o decremento automático de existencias.
- Impuestos o descuentos.
- Edición de productos dentro de una Order existente.
- Eliminación física de Products o Customers.
- Auth, JWT, roles y autorización; se integrarán posteriormente.
- Frontend y n8n.
- Notificaciones por email, WhatsApp o webhooks.
- Migraciones de producción; el proyecto usa actualmente
  `synchronize: true` durante el desarrollo del MVP.

---

## 2. Modelo de datos

### 2.1 Entidad `Order`

Tabla: `orders`

| Campo | Tipo lógico | Persistencia | Requerido | Restricciones |
|---|---|---|---:|---|
| `id` | UUID v4 | UUID | Generado | Clave primaria |
| `customer_id` | UUID v4 | UUID + FK | Sí | Customer existente |
| `delivery_address` | string | varchar | Sí | No vacío |
| `status` | enum/string | varchar o enum | Generado | Inicia en `pending` |
| `subtotal` | decimal | decimal | Generado | Suma de líneas |
| `shipping_fee` | decimal | decimal | Generado | Fijo `$10.00` en MVP |
| `total` | decimal | decimal | Generado | `subtotal + shipping_fee` |
| `createdAt` | timestamp | timestamp | Generado | Fecha de creación |
| `updatedAt` | timestamp | timestamp | Generado | Fecha de actualización |
| `deletedAt` | timestamp nullable | timestamp | Generado | Soft delete |

Relaciones:

- `Order.customer_id -> Customer.id`.
- `Order` tiene muchos `OrderProduct`.
- La relación hacia Customer debe usar `onDelete: 'RESTRICT'` o una política
  equivalente que evite eliminar Customers con Orders históricas.
- La relación `Order -> OrderProduct` puede usar `onDelete: 'CASCADE'` para
  limpieza controlada de detalles cuando una Order se elimina físicamente en
  pruebas; el flujo normal usará soft delete.

Los campos `subtotal`, `shipping_fee` y `total` no serán recibidos como
confiables desde el cliente. El servicio los calculará y persistirá
explícitamente.

### 2.2 Entidad `OrderProduct`

Tabla: `order_products`

| Campo | Tipo lógico | Persistencia | Requerido | Restricciones |
|---|---|---|---:|---|
| `id` | UUID v4 | UUID | Generado | Clave primaria |
| `order_id` | UUID v4 | UUID + FK | Sí | Order existente |
| `product_id` | UUID v4 | UUID + FK | Sí | Product existente |
| `business_id` | UUID v4 | UUID + FK | Sí | Snapshot del Business del Product |
| `product_name` | string | varchar | Sí | Snapshot |
| `unit_price` | decimal | decimal | Sí | Snapshot no negativo |
| `quantity` | entero | integer | Sí | Mayor que 0 |
| `subtotal` | decimal | decimal | Generado | `unit_price * quantity` |
| `createdAt` | timestamp | timestamp | Generado | Fecha de creación |
| `updatedAt` | timestamp | timestamp | Generado | Fecha de actualización |

La combinación `order_id + product_id` debe ser única para evitar que una misma
Order tenga dos líneas separadas del mismo Product. Si el cliente repite un
Product en el payload, el servicio debe rechazarlo o consolidarlo de manera
determinista; se recomienda rechazar duplicados con `BadRequestException`.

`business_id` debe tener una FK hacia `Business.id`, además de conservar el
valor copiado desde Product para permitir consultas eficientes por Business.

El snapshot es obligatorio porque el Product puede cambiar de nombre o precio
después de la compra. Las consultas históricas deben mostrar los datos del
Order-Product, no reconstruir el precio desde Product.

### 2.3 Regla de pertenencia al Business

Una Order puede mezclar Products de varios Businesses. El cliente no envía
`business_id` en cada línea: el servicio carga el Product y copia su
`business_id` a `OrderProduct.business_id` como snapshot controlado.

```text
OrderProduct.business_id
  == Product.business_id al momento de crear la línea
```

Si el cliente intenta enviar `business_id`, debe rechazarse por campo no
permitido. Si un Product no existe, está inactivo o fue eliminado
lógicamente, la creación debe fallar y no debe persistirse la Order.

---

## 3. Contratos de API

### 3.1 Crear una Order

Endpoint:

```http
POST /orders
Content-Type: application/json
```

Request:

```json
{
  "customer_id": "uuid-del-customer",
  "delivery_address": "Colonia Escalón, San Salvador",
  "items": [
    {
      "product_id": "uuid-del-producto-1",
      "quantity": 2
    },
    {
      "product_id": "uuid-del-producto-2",
      "quantity": 1
    }
  ]
}
```

El cliente no debe enviar:

- `total`.
- `unit_price`.
- `product_name`.
- `subtotal`.
- `shipping_fee`.
- `business_id` en los items.
- `status`.

Respuesta esperada:

```json
{
  "id": "uuid-de-la-order",
  "customer_id": "uuid-del-customer",
  "delivery_address": "Colonia Escalón, San Salvador",
  "status": "pending",
  "subtotal": 29,
  "shipping_fee": 10,
  "total": 39,
  "items": [
    {
      "id": "uuid-del-detalle",
      "order_id": "uuid-de-la-order",
      "product_id": "uuid-del-producto-1",
      "business_id": "uuid-del-business-1",
      "product_name": "Café Pacamara Especial",
      "unit_price": 12,
      "quantity": 2,
      "subtotal": 24
    }
  ]
}
```

### 3.2 Consultar Orders

Rutas:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/orders` | Crear una Order con sus detalles |
| `GET` | `/orders` | Listar Orders con filtros |
| `GET` | `/orders/:id` | Consultar una Order con sus líneas |
| `GET` | `/orders/business/:businessId` | Consultar solo las líneas de un Business |
| `PATCH` | `/orders/:id/status` | Cambiar el estado |
| `DELETE` | `/orders/:id` | Soft delete |
| `PATCH` | `/orders/:id/recover` | Recuperar una Order |

Filtros previstos:

- `customer_id`.
- `status`.
- `withDeleted`.

El listado debe ordenar por `createdAt DESC` y cargar los
`order_products`. Las respuestas deben incluir el snapshot de cada línea.

Endpoint para la vista de un Business/Vendor:

```http
GET /orders/business/:businessId
```

Debe devolver únicamente las líneas cuyo `OrderProduct.business_id` coincida
con `businessId`, agrupadas dentro de sus Orders. No debe exponer las líneas
pertenecientes a otros Businesses de la misma compra. La comprobación de que
el Vendor autenticado es dueño del Business queda para Auth/Authorization.

No se incluirá inicialmente un endpoint para editar items o cantidades de una
Order. Después de creada, la composición de la compra queda congelada.

---

## 4. Estados y transiciones

### Estados

```text
pending
confirmed
preparing
delivered
cancelled
```

### Transiciones permitidas

```text
pending   -> confirmed
pending   -> cancelled
confirmed -> preparing
confirmed -> cancelled
preparing -> delivered
preparing -> cancelled
```

No se permiten:

- Regresar de `delivered` a otro estado.
- Cambiar una Order `cancelled`.
- Saltar arbitrariamente de `pending` a `delivered`.
- Cambiar el estado enviando un valor fuera del conjunto permitido.

El servicio debe centralizar esta matriz de transiciones. Una actualización
inválida debe devolver `BadRequestException` y conservar el estado anterior.

La autorización de quién puede realizar cada transición queda fuera de este
plan. Por ahora el servicio validará únicamente la transición; Auth/Authorization
determinará después si la puede ejecutar un Customer, Vendor o administrador.

---

## 5. Validación y reglas de negocio

### `CreateOrderDto`

- `customer_id`: UUID v4 requerido.
- `delivery_address`: string requerido y no vacío.
- `items`: arreglo requerido con al menos un elemento.

### `CreateOrderItemDto`

- `product_id`: UUID v4 requerido.
- `quantity`: entero requerido, mínimo 1.
- No aceptar `business_id`; se obtiene desde Product en backend.
- No aceptar `unit_price`, `subtotal` ni `product_name`.

### `UpdateOrderStatusDto`

- `status`: enum de estados permitidos.
- No aceptar campos adicionales.

### Reglas de creación

1. Validar DTO antes de entrar al servicio.
2. Verificar Customer activo.
4. Verificar que `items` no esté vacío.
5. Rechazar Product IDs duplicados.
6. Cargar Products activos en una sola operación cuando sea posible.
7. Confirmar que se encontraron todos los Products solicitados.
8. Leer el Business asociado a cada Product y copiar su ID al snapshot.
9. Leer el precio vigente de cada Product.
10. Calcular cada subtotal con aritmética decimal segura.
11. Calcular `subtotal` como suma de subtotales.
12. Aplicar `shipping_fee = 10.00`.
13. Calcular `total = subtotal + shipping_fee`.
14. Crear Order y Order-Products en una transacción.
15. Devolver los snapshots persistidos.

La validación debe impedir comprar Products eliminados lógicamente.

### Dinero

La implementación debe seguir la precisión decimal utilizada en Product y
Business. No debe depender de sumas binarias ingenuas de JavaScript para
calcular totales. Se recomienda trabajar en centavos enteros o utilizar una
estrategia decimal consistente y convertir a decimal al persistir.

---

## 6. Estructura de archivos

```text
yawi_api/
├── src/
│   ├── orders/
│   │   ├── entities/
│   │   │   ├── order.entity.ts
│   │   └── order-product.entity.ts
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   ├── create-order-item.dto.ts
│   │   │   ├── update-order-status.dto.ts
│   │   │   └── filter-order.dto.ts
│   │   ├── interfaces/
│   │   │   └── order-status.interface.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.module.ts
│   │   ├── orders.controller.spec.ts
│   │   ├── orders.service.spec.ts
│   │   └── README.md
│   ├── database/
│   │   └── database.service.ts       # Seeder y limpieza
│   └── app.module.ts                 # Registrar OrdersModule
├── test/
│   └── order.e2e-spec.ts
└── docs/
    └── IMPLEMENTACION_PLAN_ORDERS.md
```

`OrderProduct` puede mantenerse como entidad de soporte dentro del área de
Orders si el proyecto prefiere un módulo único. Lo importante es que exista
como entidad TypeORM y tabla independiente; no debe serializarse como JSON en
Order.

---

## 7. Fases de implementación

### Fase 0 — Verificación previa

1. Revisar las entidades actuales de Customer, Business y Product.
2. Confirmar nombres reales de columnas (`business_id`, `customer_id`,
   `images_urls`, `price`).
3. Confirmar la política de soft delete existente.
4. Confirmar el comportamiento de decimal en PostgreSQL y SQLite de pruebas.
5. Preservar cambios ajenos del árbol de trabajo.
6. No agregar autenticación ni guards todavía.

### Fase 1 — Entidades y relaciones

Crear `Order` y `OrderProduct` con:

- UUIDs.
- Relaciones TypeORM.
- Columnas decimal para precios y totales.
- Estado inicial `pending`.
- `CreateDateColumn`, `UpdateDateColumn` y `DeleteDateColumn` en Order.
- Índices para `customer_id`, `status`, `order_id` y
  `order_products.business_id`.
- Restricción única compuesta `order_id + product_id`.

La entidad Product no debe guardar una relación que obligue a conocer lógica
de compra, salvo la relación inversa opcional `OneToMany` si seguir el patrón
del proyecto la hace útil.

### Fase 2 — DTOs

Crear DTOs estrictos con `class-validator` y `class-transformer`.

En particular:

- Convertir `quantity` a número con `@Type(() => Number)`.
- Validar enteros positivos.
- Validar `items` como arreglo anidado con `@ValidateNested`.
- Validar estados con `@IsEnum`.
- Usar `whitelist` y `forbidNonWhitelisted` del ValidationPipe global.

### Fase 3 — Servicio transaccional

Implementar `OrdersService.create()` con `DataSource.transaction()` o un
QueryRunner:

1. Consultar Customer y Products con el manager transaccional.
2. Obtener el Business de cada Product y copiarlo a su OrderProduct.
3. Crear la Order con estado `pending`.
4. Crear una línea por Product.
5. Copiar nombre y precio actuales al snapshot.
6. Calcular `subtotal`, `shipping_fee` y `total`.
7. Guardar todas las entidades.
8. Recargar la Order con sus relaciones.

Ante cualquier error debe ocurrir rollback completo. No debe existir una Order
sin detalles ni una Order parcial.

Implementar además:

- `findAll(filters)`.
- `findOne(id)`.
- `updateStatus(id, dto)`.
- `remove(id)`.
- `recover(id)`.

### Fase 4 — Controlador

Crear `OrdersController` con Swagger:

- Documentar el payload de creación.
- Documentar el arreglo `items`.
- Documentar estados y transiciones válidas.
- Usar `ParseUUIDPipe` en IDs.
- Usar códigos 201, 200, 204, 400 y 404.
- No exponer endpoints para modificar snapshots.

### Fase 5 — Módulo e integración

`OrdersModule` debe importar:

- `TypeOrmModule.forFeature([Order, OrderProduct, Customer, Business,
  Product])`.

Registrar el módulo en `AppModule` y el tag `Orders` en Swagger.

No importar Auth para evitar acoplamiento en esta fase. Los guards se
agregarán en la etapa de autorización.

### Fase 6 — Seeder y limpieza

Después de crear Customers, Businesses y Products, agregar Orders de prueba:

- Customer válido.
- Products de dos o más Businesses.
- Cantidades variadas.
- `shipping_fee` fijo de `$10.00`.
- Totales calculados por el servicio o por una función de seed equivalente.
- Estados variados solo si respetan la matriz de transiciones.

Los seeders deben demostrar que una Order puede contener Products de varios
Businesses y que cada línea conserva el `business_id` correcto.

Actualizar la limpieza respetando dependencias:

```text
order_products
orders
products
payment_preferences
businesses
phone_numbers
vendors
customers
```

Para PostgreSQL, `TRUNCATE ... CASCADE` puede resolver las FK, pero el orden
también debe ser correcto en el fallback de SQLite.

### Fase 7 — README

Crear `src/orders/README.md` con:

- Diferencia entre Order y OrderProduct.
- Flujo de creación.
- Ejemplo JSON.
- Explicación del snapshot histórico.
- Cálculo de subtotal, envío fijo y total.
- Estados y transiciones.
- Order global con Products de varios Businesses.
- Consulta filtrada por Business sin exponer líneas ajenas.
- Endpoints.
- Campos que el cliente no puede enviar.
- Envío fijo de `$10.00` en el MVP y estrategia futura pendiente.
- Exclusiones: pagos, inventario, descuentos y autorización.
- Ejemplos sin secretos ni credenciales reales.

---

## 8. Pruebas requeridas

### 8.1 Unitarias de `OrdersService`

Cubrir como mínimo:

- Crear Order válida.
- Crear Order con Products de varios Businesses.
- Calcular correctamente quantity, unit_price, subtotal, shipping_fee y total.
- Guardar product_name y unit_price como snapshot.
- Rechazar Customer inexistente.
- Rechazar items vacío.
- Rechazar Product inexistente.
- Rechazar Product eliminado.
- Copiar el `business_id` correcto a cada OrderProduct.
- Rechazar Product duplicado en la misma Order.
- Confirmar rollback cuando falla una línea.
- Listar por Customer.
- Consultar las líneas filtradas por Business sin exponer líneas ajenas.
- Filtrar por status.
- Obtener detalle con sus líneas.
- Actualizar estado válido.
- Rechazar transición inválida.
- No cambiar estados finales.
- Soft delete y recover.

### 8.2 Unitarias de controlador

Verificar:

- Delegación al servicio.
- Parseo de UUID.
- Recepción del DTO anidado.
- Rutas de creación, consulta, status, delete y recover.
- Respuestas documentadas.

### 8.3 Integración con TypeORM

Usar SQLite in-memory:

- Persistir Order y OrderProduct.
- Verificar las Foreign Keys.
- Verificar la restricción única `order_id + product_id`.
- Confirmar que los snapshots permanecen aunque cambie Product después.
- Confirmar rollback transaccional.

### 8.4 E2E

Escenarios mínimos:

1. Crear Customer, Vendor, Business y Products de prueba.
2. Crear Order válida.
3. Consultar la Order con sus líneas.
4. Listar por Customer.
5. Consultar `/orders/business/:businessId` y verificar que solo devuelve
   líneas del Business solicitado.
6. Cambiar `pending -> confirmed`.
7. Cambiar `confirmed -> preparing`.
8. Cambiar `preparing -> delivered`.
9. Rechazar transición inválida.
10. Confirmar que una Order puede incluir Products de varios Businesses.
11. Rechazar cantidad cero o negativa.
12. Rechazar payload que intenta enviar precios calculados o `business_id`.
13. Soft delete.
14. Recuperar.
15. Confirmar que el total no cambia si Product cambia de precio después.

### 8.5 Validación final

Ejecutar desde `yawi_api`:

```powershell
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
```

---

## 9. Criterios de aceptación

- Una Order pertenece a un Customer existente y puede mezclar Products de
  distintos Businesses.
- Una Order válida siempre tiene uno o más Order-Products.
- Order-Product es una tabla/entidad normalizada, no un campo JSON.
- El backend calcula precios, subtotales, envío fijo y total.
- El cliente no puede imponer snapshots ni total.
- Los snapshots históricos se conservan ante cambios posteriores en Product.
- `shipping_fee` es `$10.00` y `total = subtotal + shipping_fee`.
- Los estados solo cambian mediante transiciones permitidas.
- El flujo de creación es atómico y transaccional.
- Orders se consultan con sus detalles.
- Soft delete y recuperación funcionan.
- Seeder y limpieza respetan las dependencias.
- No se implementan pagos, stock, descuentos ni autorización; el envío se
  limita al valor fijo del MVP.
- README, Swagger y pruebas reflejan el contrato implementado.

---

## 10. Resultado esperado

Al finalizar esta fase, la API tendrá un flujo de compra consistente:

```text
Customer
  └── Order
        └── OrderProduct
              ├── Product
              └── Business
```

El módulo posterior de Auth/Authorization podrá proteger las operaciones sin
modificar el modelo: Customers podrán crear y consultar sus Orders, mientras
que Vendors podrán consultar las líneas de Orders de sus propios Businesses
según los permisos que se definan después. El estado se mantiene global para
toda la Order; no se crean suborders por Business en esta fase.
