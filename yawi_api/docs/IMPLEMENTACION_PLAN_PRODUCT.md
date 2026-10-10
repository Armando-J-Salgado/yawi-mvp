# Plan de Implementación — Módulo `products`

## 1. Alcance y restricciones

Este plan define la implementación del módulo `products` exclusivamente dentro
de `yawi_api`. Product representa un artículo que un Business ofrece para la
venta.

El diseño parte del diagrama actual, pero evita crear entidades separadas para
los atributos que pueden manejarse como estructuras JSON. La única relación
normalizada de Product en esta fase será su relación obligatoria con Business.
La relación entre Product y Order se implementará posteriormente en el módulo
`orders`, mediante la entidad intermedia correspondiente.

### Incluido

- Entidad TypeORM `Product`.
- Módulo NestJS `ProductsModule`.
- Relación `Product -> Business` mediante `business_id`.
- DTOs de creación, actualización y filtros.
- CRUD completo.
- Eliminación lógica y recuperación.
- `tags` como arreglo JSON de strings.
- `images_urls` como arreglo JSON de URLs.
- `properties` como objeto JSON clave-valor.
- Precio decimal no negativo.
- Subida opcional de una imagen al crear el Product.
- Endpoint para agregar imágenes posteriormente.
- Reutilización de `UploadFileService` y los adaptadores de Storage existentes.
- Carpeta de almacenamiento `products`.
- Máximo de 4 imágenes por Product.
- Swagger para JSON y `multipart/form-data`.
- README del módulo.
- Pruebas unitarias, e2e y de integración del upload.
- Seeder de Products asociado a Businesses existentes.
- Cambios mínimos en `AppModule` y en el servicio de base de datos.

### Excluido

- Módulo `orders`.
- Entidad `ProductOrder` o cualquier tabla de detalle de orden.
- Campos `order_id`, `quantity`, `unit_price` o `subtotal` en Product.
- Inventario, stock, reservas o control de disponibilidad.
- Variantes normalizadas de producto.
- Entidades separadas para tags, imágenes o propiedades.
- Eliminación física de imágenes desde Storage.
- Frontend.
- n8n.
- Cambios en Vendors, Customers, Businesses o Auth salvo integración mínima.
- Migraciones de producción; el proyecto usa actualmente
  `synchronize: true` durante el desarrollo del MVP.

---

## 2. Modelo funcional

Un Product pertenece a un único Business. Un Business puede tener muchos
Products. El `business_id` debe referenciar un Business existente.

### 2.1 Atributos

| Campo | Tipo lógico | Persistencia | Requerido | Restricciones |
|---|---|---|---:|---|
| `id` | UUID v4 | UUID | Generado | Clave primaria |
| `business_id` | UUID v4 | UUID + FK | Sí | Business existente |
| `name` | string | varchar | Sí | No vacío |
| `tags` | string[] | `simple-json` | No | Arreglo de strings; default `[]` |
| `images_urls` | string[] | `simple-json` | No | URLs; nullable o `[]`; máximo 4 |
| `properties` | objeto JSON | `simple-json` | No | Clave-valor libre; default `{}` |
| `price` | número decimal | decimal | Sí | Mayor o igual a 0 |
| `createdAt` | timestamp | timestamp | Generado | Fecha de creación |
| `updatedAt` | timestamp | timestamp | Generado | Fecha de actualización |
| `deletedAt` | timestamp nullable | timestamp | Generado | Soft delete |

La entidad debe usar una relación `ManyToOne` con `Business`, `JoinColumn` con
nombre `business_id` y `onDelete: 'CASCADE'`, siguiendo el patrón existente.
La respuesta debe incluir el Business relacionado cuando el servicio ya lo
haga para los demás módulos, sin incluir datos innecesarios del Vendor.

### 2.2 Estructuras JSON

Ejemplo de request:

```json
{
  "business_id": "uuid-del-business",
  "name": "Café molido artesanal",
  "tags": ["café", "artesanal", "orgánico"],
  "properties": {
    "weight": "500g",
    "origin": "El Salvador",
    "roast": "medium"
  },
  "price": 8.5
}
```

Reglas:

- `tags` se valida como arreglo y cada elemento debe ser string.
- `images_urls` no se recibe directamente para falsificar URLs de Storage; las
  URLs deben generarse mediante el flujo de subida.
- `properties` acepta valores JSON simples útiles para atributos variables,
  pero no debe convertirse en una nueva tabla o relación.
- `price` debe validarse como número y no aceptar valores negativos.
- El servicio debe evitar guardar `undefined`; usar `[]` y `{}` como defaults
  consistentes.

---

## 3. Flujo de imágenes

### 3.1 Crear Product con imagen opcional

Endpoint:

```http
POST /products
Content-Type: multipart/form-data
```

El campo binario será `image`. El resto de datos se enviará como campos del
formulario:

- `business_id`
- `name`
- `tags`
- `properties`
- `price`

El controlador debe reutilizar el patrón de Businesses:

1. Usar `FileInterceptor('image')`.
2. Permitir que la imagen sea opcional durante la creación.
3. Validar JPEG, PNG, WebP o GIF.
4. Rechazar archivos mayores de 10 MB.
5. Verificar `business_id` antes de guardar.
6. Llamar a `UploadFileService`.
7. Usar la carpeta `products`.
8. Guardar la URL retornada en `images_urls`.
9. Crear el Product dentro del flujo normal.

Si no se envía imagen, Product se crea con `images_urls` vacío o `null`,
siguiendo una sola convención definida por la implementación y documentada en
Swagger.

### 3.2 Agregar imágenes a un Product existente

Endpoint:

```http
POST /products/:id/images
Content-Type: multipart/form-data
```

El endpoint recibe un archivo obligatorio en el campo `image` y debe:

1. Validar el UUID y localizar el Product activo.
2. Contar las URLs actuales.
3. Rechazar la operación si ya existen 4 imágenes.
4. Subir el archivo mediante `UploadFileService`.
5. Usar siempre la carpeta `products`.
6. Agregar la URL sin sobrescribir las existentes.
7. Guardar y devolver el Product actualizado.

No se implementará borrado de objetos en Storage porque el adaptador Supabase
actual no soporta `delete`. El plan debe evitar dejar endpoints que aparenten
eliminar una imagen si no pueden garantizar la eliminación física.

---

## 4. Estructura de archivos

Crear únicamente el área funcional de Product y los cambios de integración
necesarios:

```text
yawi_api/
├── src/
│   ├── products/
│   │   ├── entities/
│   │   │   └── product.entity.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── filter-product.dto.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   ├── products.controller.spec.ts
│   │   ├── products.service.spec.ts
│   │   ├── products-upload.integration.spec.ts
│   │   └── README.md
│   ├── database/
│   │   └── database.service.ts       # Seeder y limpieza mínima
│   ├── app.module.ts                 # Registrar ProductsModule
│   └── main.ts                       # Tag Swagger, si aplica
├── test/
│   └── product.e2e-spec.ts
└── docs/
    └── IMPLEMENTACION_PLAN_PRODUCT.md
```

No modificar `UploadFileService` ni los adaptadores de Storage salvo que una
limitación concreta del flujo existente lo haga necesario. La carpeta
`products` debe enviarse como argumento desde `ProductsService`; no duplicar
la lógica de selección entre almacenamiento local y Supabase.

---

## 5. Fases de implementación

### Fase 0 — Verificación previa

1. Confirmar que no exista ya `src/products`.
2. Revisar el estado del árbol de trabajo y preservar cambios ajenos.
3. Revisar `Business` y su relación con `Vendor`.
4. Reutilizar `UploadFileService`, `UploaderModule` y sus pruebas.
5. Confirmar que no se agreguen dependencias nuevas para JSON o uploads.
6. Confirmar el comportamiento de `simple-json` en PostgreSQL y SQLite
   in-memory usado por las pruebas.

### Fase 1 — Entidad `Product`

Crear `src/products/entities/product.entity.ts` con:

- `@Entity('products')`.
- UUID como clave primaria.
- Columnas para `business_id`, `name`, `tags`, `images_urls`,
  `properties` y `price`.
- `tags`, `images_urls` y `properties` como `simple-json`.
- `price` como decimal con precisión y escala compatibles con el proyecto.
- `ManyToOne` hacia `Business`.
- Columnas de creación, actualización y eliminación lógica.
- Decoradores Swagger para describir correctamente los tipos JSON.

No declarar ninguna relación hacia Order en esta fase.

### Fase 2 — DTOs y validación

#### `CreateProductDto`

Campos requeridos:

- `business_id`: `@IsUUID('4')`.
- `name`: `@IsString()` y `@IsNotEmpty()`.
- `tags`: opcional, arreglo de strings.
- `properties`: opcional, objeto JSON.
- `price`: número no negativo.

`images_urls` no debe ser un campo libre del DTO de creación cuando el upload
lo genera internamente.

#### `UpdateProductDto`

- Todos los campos editables deben ser opcionales.
- Reutilizar el patrón parcial de `UpdateBusinessDto`.
- Si cambia `business_id`, verificar que el nuevo Business exista.
- No permitir modificar `images_urls` arbitrariamente mediante JSON.
- La actualización de imágenes debe pasar exclusivamente por
  `POST /products/:id/images`.

#### `FilterProductDto`

Incluir:

- `business_id` como UUID.
- `name` como texto.
- `price` solo si las convenciones actuales permiten filtros numéricos
  claros; no agregar rangos ambiguos sin DTO explícito.
- `withDeleted` como `IsBooleanString`.

El listado debe permitir consultar los Products de un Business sin introducir
una relación con Orders.

### Fase 3 — `ProductsService`

Implementar:

#### `create(createProductDto, file?)`

1. Verificar que exista el Business.
2. Normalizar defaults de `tags` y `properties`.
3. Subir la imagen si fue enviada usando la carpeta `products`.
4. Guardar la URL resultante en `images_urls`.
5. Guardar el Product.
6. Retornar el Product con su Business relacionado.

Si falla el upload, no guardar un Product que aparente tener una imagen que no
se pudo almacenar. Los errores deben propagarse de forma explícita según las
excepciones del uploader.

#### `addImage(id, file)`

Aplicar el límite de cuatro imágenes y persistir la nueva URL sin perder las
anteriores.

#### `findAll(filters?)`

- Filtrar por Business y nombre.
- Excluir soft-deleted por defecto.
- Permitir `withDeleted=true`.
- Ordenar por `createdAt DESC`.
- Incluir la relación `business`.

#### `findOne(id)`

- Recibir un UUID validado por el controlador.
- Buscar solo Products activos.
- Lanzar `NotFoundException` si no existe.
- Incluir el Business relacionado.

#### `update(id, updateProductDto)`

- Buscar el Product activo.
- Verificar el Business si cambia `business_id`.
- Actualizar únicamente campos permitidos.
- No modificar imágenes por esta ruta.

#### `remove(id)` y `recover(id)`

- Usar soft delete y restore.
- No borrar físicamente el Product.
- Recuperar con `withDeleted: true` y devolverlo activo.

El servicio no debe contener lógica de Orders, pagos, inventario ni autenticación.

### Fase 4 — `ProductsController`

Rutas:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/products` | Crear Product, con imagen opcional |
| `POST` | `/products/:id/images` | Agregar una imagen |
| `GET` | `/products` | Listar con filtros |
| `GET` | `/products/:id` | Obtener por UUID |
| `PATCH` | `/products/:id` | Actualizar campos no relacionados con imágenes |
| `DELETE` | `/products/:id` | Soft delete |
| `PATCH` | `/products/:id/recover` | Recuperar |

El controlador debe:

- Usar `@ApiTags('Products')`.
- Usar `ParseUUIDPipe` en `:id`.
- Documentar JSON y `multipart/form-data`.
- Reutilizar `MaxFileSizeValidator` de 10 MB.
- Reutilizar `FileTypeValidator` para imágenes permitidas.
- Marcar `image` como opcional en creación y requerido en `:id/images`.
- Documentar respuestas 201, 200, 400, 404 y 500 cuando correspondan.

No aplicar guards JWT nuevos automáticamente; la protección de endpoints es
un trabajo de autorización separado, igual que en los módulos existentes.

### Fase 5 — Integración del módulo

- Registrar `ProductsModule` en `AppModule`.
- Importar `TypeOrmModule.forFeature([Product, Business])`.
- Importar `UploaderModule`.
- Agregar el tag `Products` a Swagger si el bootstrap mantiene tags
  explícitos.
- No tocar `UploadFileService` si ya permite seleccionar la carpeta.

### Fase 6 — Seeder y limpieza

Agregar Products de prueba al seeder existente únicamente después de que
existan Businesses. Cada Product debe tener:

- Un `business_id` válido.
- Nombre diferente.
- Precio variado.
- Tags variados.
- Properties variadas.
- Sin depender de Orders.

Los seeders no deben guardar passwords, URLs sensibles ni archivos binarios.
El seeder puede dejar `images_urls` vacío, porque subir archivos durante el
arranque no es responsabilidad del seeder.

Actualizar la limpieza de base de datos para incluir `products` antes de
`businesses`, respetando las claves foráneas. La operación debe continuar
siendo explícita y segura para `migrate:fresh`.

### Fase 7 — README

Crear `src/products/README.md` con:

- Propósito y alcance.
- Campos de Product.
- Explicación de `tags`, `properties` e `images_urls`.
- Ejemplos ficticios de JSON.
- Ejemplos de `POST /products` con y sin imagen.
- Ejemplo de `POST /products/:id/images`.
- Límite de 4 imágenes.
- Formatos y tamaño máximo.
- Carpeta lógica `products`.
- Diferencia entre Storage local y Supabase.
- Nota de que `ProductOrder` y Orders pertenecen a una fase posterior.
- Advertencia de no incluir secretos, JWT reales ni credenciales en ejemplos.

---

## 6. Pruebas requeridas

### 6.1 Unitarias de `ProductsService`

Cubrir como mínimo:

- Creación con Business existente.
- Rechazo cuando `business_id` no existe.
- Creación sin imagen.
- Creación con imagen y persistencia de la URL.
- Uso de la carpeta `products`.
- Defaults de `tags` y `properties`.
- Rechazo de una quinta imagen.
- Agregado incremental de hasta cuatro imágenes.
- Actualización de campos permitidos.
- Rechazo de Business inexistente en actualización.
- Listado filtrado por `business_id`.
- Exclusión de soft-deleted.
- Recuperación de Product eliminado.
- No exposición de errores silenciosos del upload.

### 6.2 Unitarias de controlador

Verificar:

- Delegación correcta al servicio.
- Parseo de UUID.
- Recepción del archivo opcional en creación.
- Recepción obligatoria del archivo en `:id/images`.
- Rutas y respuestas documentadas.

### 6.3 Integración del upload

Reutilizar el patrón de
`businesses-upload.integration.spec.ts`:

- Mockear el adapter de almacenamiento.
- Confirmar que `UploadFileService` se invoca con la carpeta `products`.
- Confirmar que la URL se persiste en `images_urls`.
- Confirmar que agregar imágenes conserva las URLs anteriores.
- Confirmar que el quinto upload no invoca el adapter.

### 6.4 E2E

Usar SQLite in-memory, como en las pruebas existentes, y verificar:

1. Crear Product con JSON válido.
2. Crear Product con multipart e imagen.
3. Consultar listado general.
4. Filtrar por `business_id`.
5. Consultar por UUID.
6. Actualizar Product.
7. Agregar imágenes hasta cuatro.
8. Rechazar la quinta.
9. Soft delete.
10. Recuperar.
11. Rechazar Business inexistente.
12. Rechazar payload inválido e imagen inválida.

### 6.5 Validación final

Ejecutar desde `yawi_api`:

```powershell
npm run format:check
npm run build
npm run test:unit
npm run test:e2e
```

Si se agrega una prueba de integración que no queda incluida en los patrones
existentes, ejecutarla explícitamente y documentar el comando.

---

## 7. Criterios de aceptación

- Product puede crearse únicamente con un Business válido.
- El CRUD funciona con UUID, validaciones y soft delete.
- `tags`, `properties` e `images_urls` se almacenan como JSON y no como
  entidades independientes.
- Cada Product acepta como máximo 4 imágenes.
- Las imágenes se almacenan mediante el uploader existente en la carpeta
  lógica `products`.
- La URL retornada por Storage se persiste correctamente.
- El flujo funciona con Storage local y conserva compatibilidad con Supabase.
- No se crea ninguna tabla o entidad para Product-Order en esta fase.
- El seeder crea Products válidos después de Businesses.
- README, Swagger y pruebas reflejan el contrato implementado.
- No se exponen secretos, hashes ni datos sensibles.
- Formato, build, pruebas unitarias y e2e pasan.

---

## 8. Resultado esperado

Al finalizar esta fase, la API tendrá un módulo Product independiente y listo
para que el módulo posterior de Orders lo consuma. Orders podrá crear después
su relación normalizada con Product sin que Product tenga que conocer la
estructura de una orden ni duplicar datos de detalle de compra.
