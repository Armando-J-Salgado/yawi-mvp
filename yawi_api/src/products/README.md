# Módulo Products — YAWI API

## 1. Propósito y Alcance

El módulo `products` gestiona el catálogo de artículos y productos que un negocio (`Business`) ofrece para la venta dentro de la plataforma YAWI.

Cada `Product` pertenece a un único `Business` y contiene información de precios, etiquetas (`tags`), propiedades flexibles clave-valor (`properties`) y una galería de hasta 4 imágenes (`images_urls`).

> **Nota de alcance**: Las órdenes (`Order`) y los detalles de orden (`ProductOrder`) forman parte de una fase posterior en el módulo `orders`. En esta fase, el modelo de productos es completamente independiente de cualquier concepto de inventario complejo o carritos de compra.

---

## 2. Modelo de Datos y Campos

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | UUID v4 | Generado | Identificador único del producto. |
| `business_id` | UUID v4 | Sí | Identificador del negocio propietario. |
| `name` | String | Sí | Nombre comercial del producto. |
| `tags` | String[] | No | Etiquetas de categorización (JSON, default `[]`). |
| `images_urls` | String[] | No | URLs de imágenes subidas (JSON, max 4, nullable). |
| `properties` | Object | No | Atributos clave-valor libres (JSON, default `{}`). |
| `price` | Decimal (10,2) | Sí | Precio unitario no negativo en USD. |
| `createdAt` | Timestamp | Generado | Fecha y hora de creación. |
| `updatedAt` | Timestamp | Generado | Fecha y hora de última modificación. |
| `deletedAt` | Timestamp | Generado | Fecha de eliminación lógica (*Soft Delete*). |

---

## 3. Manejo de Estructuras JSON

- **`tags`**: Arreglo de cadenas de texto para búsqueda y clasificación (ej. `["café", "artesanal", "orgánico"]`).
- **`properties`**: Diccionario JSON flexible para metadatos variables de cada producto sin alterar el esquema relacional (ej. `{ "peso": "500g", "origen": "El Salvador", "tueste": "medio" }`).
- **`images_urls`**: Arreglo de strings gestionado internamente por el servicio de almacenamiento. No se edita directamente a través de payloads JSON arbitrarios.

---

## 4. Gestión de Imágenes y Almacenamiento

- **Límite máximo**: 4 imágenes por producto.
- **Formatos permitidos**: `JPEG`, `PNG`, `WebP`, `GIF`.
- **Tamaño máximo**: 10 MB por archivo.
- **Carpeta lógica**: `products` (los archivos se almacenan bajo la ruta de almacenamiento configurada para productos).
- **Adaptadores de almacenamiento**:
  - *Local*: Almacenamiento en el sistema de archivos del servidor bajo `/uploads/products/`.
  - *Supabase Storage*: Almacenamiento en la nube en el bucket configurado vía variables de entorno.

---

## 5. Endpoints de la API

### 5.1 Crear Producto (Sin Imagen)
```http
POST /products
Content-Type: application/json

{
  "business_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Café Pacamara Especial 500g",
  "tags": ["café", "artesanal", "especialidad"],
  "properties": {
    "origen": "Apaneca, El Salvador",
    "tueste": "medio"
  },
  "price": 12.50
}
```

### 5.2 Crear Producto (Con Imagen Opcional en Multipart)
```http
POST /products
Content-Type: multipart/form-data

business_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
name: Café Pacamara Especial 500g
tags: ["café", "artesanal"]
properties: {"origen": "Apaneca"}
price: 12.50
image: [archivo binario]
```

### 5.3 Agregar Imagen a Producto Existente
```http
POST /products/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/images
Content-Type: multipart/form-data

image: [archivo binario]
```

### 5.4 Listar Productos con Filtros
```http
GET /products?business_id=f47ac10b-58cc-4372-a567-0e02b2c3d479&name=Café&withDeleted=false
```

### 5.5 Obtener Producto por ID
```http
GET /products/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

### 5.6 Actualizar Producto
```http
PATCH /products/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
Content-Type: application/json

{
  "name": "Café Pacamara Especial Tueste Oscuro",
  "price": 13.00
}
```

### 5.7 Eliminación Lógica (*Soft Delete*)
```http
DELETE /products/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

### 5.8 Restaurar Producto
```http
PATCH /products/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/recover
```

---

## 6. Seguridad y Buenas Prácticas

>  **Advertencia**: Nunca incluyas tokens JWT reales, contraseñas, secretos de API o URLs con tokens temporales en ejemplos ni en repositorios.
