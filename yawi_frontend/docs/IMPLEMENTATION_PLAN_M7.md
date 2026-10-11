# IMPLEMENTATION PLAN — Milestone 7: Integración real de Productos (Catálogo + Landing)

> **Redactado por**: Arquitecto Senior (rol de planificación)
> **Implementador objetivo**: Agente IA nivel junior
> **Fecha**: 2026-10-10
> **Rama sugerida**: `feature/m7-products-api-integration`
> **Estado**: Pendiente de revisión y aprobación

---

## 0. Prerequisitos — Leer antes de tocar cualquier archivo

1. Leer `src/ARCHITECTURE.md` completo. **Si algo del plan contradice ese archivo, la arquitectura manda y se pausa para consultar.**
2. Leer `docs/DESIGN.md` (colores, spacing, cards) y `docs/DECISIONS.md` (decisiones #1–#65). Este plan agrega la sección **Milestone 7** (#66–#75).
3. Leer `docs/IMPLEMENTATION_PLAN_M6.md` (contexto del catálogo/carrito y su contrato mock que ahora se reemplaza).
4. **Nunca** escribir hexadecimales en componentes. Solo tokens Tailwind del `@theme` o `var(--color-*)`.
5. **`yawi_api` es de SOLO LECTURA.** No modificar entidades, DTOs, controladores ni servicios. Sirve únicamente para copiar el contrato real.
6. **TDD**: para servicios, adaptador `api/` y utils se escribe **primero el test**, se ve fallar y luego la implementación.
7. **No** ejecutar `npm run lint` ni `oxlint`. Al terminar: `npx tsc --noEmit`, `npx vitest run`, `npm run format:check` (y `npm run format` si falla).
8. `@/` alias ya activo (vite + vitest). Usarlo en los imports nuevos.
9. No crear carpetas top-level nuevas en `src/`. No introducir `adapters/`, `contexts/` ni features nuevas.

---

## 1. Contexto y hallazgos

### 1.1 Situación actual

- El catálogo (`/products`, `/products/:id`) y la landing (sección "Productos Destacados") ya renderizan productos, pero con **datos mock**:
  - `src/api/products.api.ts` devuelve `MOCK_PRODUCTS` desde `src/data/mock-products.ts`.
  - `src/features/landing/hooks/useFeaturedProducts.ts` devuelve `FEATURED_PRODUCTS` desde `src/features/landing/data/featured-products.ts`.
- El objetivo de M7 es que **ambos consuman `yawi_api` de verdad** vía `fetch`, respetando la arquitectura por capas, y que se muestre una **notificación de error con el mensaje del backend** cuando la petición falle.

### 1.2 Contrato real de `yawi_api` (solo lectura)

Módulo `yawi_api/src/products/`:

- `products.controller.ts` expone:
  - `GET /products?business_id&name&price&withDeleted` → `Product[]` (orden `createdAt DESC`).
  - `GET /products/:id` → `Product` (404 si no existe / 400 si UUID inválido).
- `products.service.ts` **siempre** carga la relación `business` en `findAll` y `findOne` (`relations: { business: true }`), pero **NO** carga `business.owner`.
- `entities/product.entity.ts` (columnas reales):

```ts
{
  id: string;                                  // UUID
  business_id: string;                         // UUID FK → Business
  name: string;
  tags: string[];                              // simple-json, default '[]'
  images_urls: string[] | null;                // simple-json, nullable, máx 4  ⚠️ PLURAL
  properties: Record<string, unknown>;         // simple-json, default '{}'
  price: number;                               // decimal(10,2) ⚠️ Postgres lo devuelve como string
  business: Business;                          // relación cargada (sin owner)
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

- `entities/business.entity.ts` (relación anidada sin `owner`): `{ id, name, description, address, balance, imagesUrls, owner_id, createdAt, updatedAt, deletedAt }`.
- `database.module.ts` usa **PostgreSQL** (`type: 'postgres'`). TypeORM/pg devuelve las columnas `decimal` como **string** (`"12.50"`), por eso el DTO debe aceptar `number | string` y el servicio **coerciona a number**.

### 1.3 Diferencias con el mock actual (a corregir)

| Aspecto        | Mock actual (`types/product.ts`) | API real                                     |
| -------------- | -------------------------------- | -------------------------------------------- |
| Imágenes       | `image_urls: string[] \| null`   | `images_urls: string[] \| null` (**plural**) |
| Nombre negocio | `business_name?: string` (plano) | `business: { name, ... }` (**anidado**)      |
| Propiedades    | —                                | `properties: Record<string, unknown>`        |
| Precio         | `number`                         | `decimal` → **string** en runtime            |

---

## 2. Alcance

### Dentro del alcance

- Reemplazar el adaptador mock `getProducts`/`getProductById` por `fetch` HTTP real con manejo de errores tipado (`ApiError`).
- Alinear `ProductDto` al contrato real y mapear a dominio `Product` (incluida la coerción de `price`).
- Landing: sección "Productos Destacados" servida por `GET /products`, con join a `GET /businesses` para conservar el país (`business.owner.country`) y el nombre del negocio.
- Mostrar **notificación de error (toast) con el mensaje del backend** en catálogo, detalle y landing, manteniendo el estado inline con "Reintentar".
- Mantener el filtrado/búsqueda en cliente (la API solo soporta `name`/`price` exactos).
- Eliminar los datasets mock obsoletos.
- i18n sin nuevas claves (se reutilizan las existentes); READMEs de carpetas y `docs/DECISIONS.md`.

### Fuera del alcance (explícitamente NO hacer)

- Órdenes (`Order`), `OrderItem`, checkout, pasarelas de pago o persistencia remota del carrito.
- CRUD de productos, pantallas de gestión, subida de imágenes.
- Modificar `yawi_api` (contratos, entidades, endpoints).
- Crear store/context para productos: los productos son **server state** → se gestionan con TanStack Query (Decisión #26 y `ARCHITECTURE.md` §State management). No se toca `cartStore`.
- Renderizar `properties` en la UI (se ignora; fuera de alcance).
- Cambiar infraestructura, aliases, `index.css` o el design system.

---

## 3. Decisiones arquitectónicas de este Milestone

Se documentarán en `docs/DECISIONS.md` (sección **Milestone 7 — Integración real de Productos**), continuando desde #65.

| #      | Decisión                              | Opciones consideradas                                            | Elección                                                               | Justificación                                                                                                       |
| ------ | ------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **66** | **Fuente de datos de productos**      | Mantener mock, mock con fallback, `fetch` real                   | **`fetch` real a `GET /products` y `GET /products/:id`**               | El endpoint ya existe; la app debe pedir datos reales y mostrar error si falla. Se elimina el mock.                 |
| **67** | **Forma del `ProductDto`**            | Mantener `image_urls`/`business_name`, alinear al contrato real  | **Alinear al contrato real** (`images_urls`, `properties`, `business`) | "Sin asumir estructuras alternativas". El nombre del negocio se deriva de `business.name`.                          |
| **68** | **Tipo de `price`**                   | Asumir `number`, tipar `number \| string` y coerción en servicio | **`number \| string` + coerción `Number()` en el servicio**            | Postgres/pg devuelve `decimal` como string; coercionar evita romper `formatCurrency`/subtotales.                    |
| **69** | **Capa de errores HTTP**              | Nuevo `api/http.ts`, duplicar inline, reutilizar `auth.api`      | **Exportar `ApiError` + `extractErrorMessage` desde `@/api/auth.api`** | Importación lateral dentro de la capa `api/` (sin invertir capas). Cero carpetas nuevas. Continúa Decisión #38.     |
| **70** | **Notificación de error del backend** | Solo inline, solo toast, toast + inline                          | **`useErrorToast` + `showToast` + estado inline con reintentar**       | Cumple el RF "notificación de error enviado desde el backend" y conserva el estado de error con recuperación.       |
| **71** | **Landing "Productos Destacados"**    | API sin enriquecer, API + join negocios, dejar estático          | **API + join `GET /businesses`**                                       | Conserva el país (`owner.country`) y el nombre de negocio del diseño actual.                                        |
| **72** | **Join de negocios en el catálogo**   | Mantener `useBusinesses`, eliminar                               | **Eliminar el join redundante en `CatalogPage`**                       | `product.business.name` ya viene denormalizado en la respuesta; se ahorra una petición.                             |
| **73** | **Mocks obsoletos**                   | Conservar, conservar como fallback, eliminar                     | **Eliminar `mock-products.ts` y `featured-products.ts`**               | Ya no reflejan el contrato real; mantenerlos induce a error.                                                        |
| **74** | **Filtrado/búsqueda**                 | Filtrar en API, filtrar en cliente                               | **Filtrar en cliente (sin cambios)**                                   | La API solo filtra por `name`/`price` **exactos** y no por tags; el dataset cabe en memoria. Continúa Decisión #57. |
| **75** | **Tests del adaptador `api/`**        | MSW, mockear módulo, `vi.stubGlobal('fetch')`                    | **`vi.stubGlobal('fetch', ...)`**                                      | Valida el contrato HTTP real sin dependencias nuevas. Continúa Decisión #36.                                        |

> **Decisión diferida (no implementar):** extraer `ApiError`/`extractErrorMessage` a un `api/http.ts` compartido y migrar `artisans.api.ts`. Se pospone para no ampliar el alcance de M7 (Decisión #69 lo deja inline/reutilizado).

---

## 4. Estructura de archivos

### 4.1 Archivos nuevos

```text
src/
├── utils/
│   ├── apiErrorMessage.ts          ← extrae el mensaje de un error desconocido (puro)
│   └── apiErrorMessage.test.ts
├── hooks/
│   ├── README.md                   ← NUEVO (carpeta sin README hasta ahora)
│   └── useErrorToast.ts            ← dispara showToast.error con el mensaje del backend
```

### 4.2 Archivos a modificar (edición puntual, nunca reemplazo masivo)

| Archivo                                                                               | Cambio                                                                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/types/product.ts`                                                                | Alinear `ProductDto` al contrato real; agregar `ProductBusinessDto`; `price: number \| string`.       |
| `src/api/auth.api.ts`                                                                 | Añadir `export` a `extractErrorMessage` (reutilización en `products.api.ts`).                         |
| `src/api/products.api.ts`                                                             | Reemplazar el mock por `fetch` con `ApiError`; agregar `API_BASE`.                                    |
| `src/api/products.api.test.ts`                                                        | Reescribir con `vi.stubGlobal('fetch')` (éxito, error con mensaje del backend, 404).                  |
| `src/services/products.service.ts`                                                    | Mapear `business.name` → `businessName`, `images_urls` → `imageUrls`, coercionar `price`.             |
| `src/services/products.service.test.ts`                                               | Actualizar builders/mocks al nuevo DTO; agregar casos de coerción.                                    |
| `src/pages/CatalogPage/CatalogPage.tsx`                                               | Quitar `useBusinesses`/`businessNameById`; añadir `useErrorToast`.                                    |
| `src/pages/ProductDetailPage/ProductDetailPage.tsx`                                   | Añadir `useErrorToast`.                                                                               |
| `src/features/landing/hooks/useFeaturedProducts.ts`                                   | Consumir `fetchProducts` + `useBusinesses` (TanStack Query) y devolver dominio + mapas.               |
| `src/features/landing/components/FeaturedProductsSection/FeaturedProductsSection.tsx` | Usar el nuevo shape del hook; pasar mapas al carrusel.                                                |
| `src/features/landing/components/FeaturedProductsSection/ProductCarousel.tsx`         | Tipar con `@/types/product` `Product`; render de `ProductCard` con `businessName`, `country`, `tags`. |
| `src/features/landing/types.ts`                                                       | Eliminar la interfaz local `Product` (queda `LatamCountry`).                                          |
| `src/features/landing/index.ts`                                                       | Dejar de exportar `Product` (solo `LatamCountry`).                                                    |
| `src/features/catalog/README.md`                                                      | Actualizar contrato real e integración (ya no mock, sin join).                                        |
| `src/api/README.md`                                                                   | `products.api.ts` ya es HTTP real; nota de `ApiError` reutilizado de `auth.api`.                      |
| `src/services/README.md`                                                              | Documentar coerción de `price` y mapeo de `business.name`.                                            |
| `src/types/README.md`                                                                 | Actualizar descripción de `product.ts`.                                                               |
| `src/features/landing/README.md`                                                      | Sección destacada ahora API-driven; se elimina `data/`.                                               |
| `src/features/landing/hooks/README.md`                                                | Documentar el nuevo `useFeaturedProducts` (Query + join).                                             |
| `src/data/README.md`                                                                  | Actualizar: la carpeta deja de tener datasets (se eliminó el mock).                                   |
| `docs/DECISIONS.md`                                                                   | Agregar sección Milestone 7 (#66–#75).                                                                |

### 4.3 Archivos a eliminar

| Archivo                                          | Motivo                                         |
| ------------------------------------------------ | ---------------------------------------------- |
| `src/data/mock-products.ts`                      | Ya no refleja el contrato real (Decisión #73). |
| `src/features/landing/data/featured-products.ts` | Idem; la landing consume la API.               |
| `src/features/landing/data/README.md`            | La carpeta `data/` queda vacía y se elimina.   |

> `src/data/` conserva solo `.gitkeep`/`README.md` (carpeta reservada por arquitectura), sin datasets.

---

## 5. Contratos y tipos

### 5.1 `src/types/product.ts`

```ts
/**
 * Relación `business` tal como la devuelve `GET /products` (cargada con
 * `relations: { business: true }`). NO incluye `owner`.
 */
export interface ProductBusinessDto {
  id: string;
  name: string;
  description: string;
  address: string;
  balance: number | string;
  imagesUrls: string[] | null;
  owner_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * DTO crudo del contrato real de `yawi_api` (`GET /products`, `GET /products/:id`).
 * - `images_urls` es JSON (lista de strings) y puede llegar `null`. ⚠️ Plural.
 * - `tags` puede llegar `null` de forma defensiva (la columna tiene default `[]`).
 * - `price` es `decimal(10,2)`: Postgres lo entrega como string (`"12.50"`).
 * - `properties` existe en el contrato pero NO se usa en la UI (fuera de alcance).
 * - `business` siempre viene en la respuesta; se tipa opcional por robustez del mapper.
 */
export interface ProductDto {
  id: string;
  business_id: string;
  name: string;
  tags: string[] | null;
  images_urls: string[] | null;
  properties?: Record<string, unknown> | null;
  price: number | string;
  business?: ProductBusinessDto | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** Modelo de dominio de un producto artesanal para la UI. */
export interface Product {
  id: string;
  businessId: string; // FK → Business.id
  businessName?: string; // derivado de `business.name`
  name: string;
  tags: string[]; // nunca null (array vacío si no tiene)
  imageUrls: string[]; // nunca null (array vacío si no tiene)
  price: number; // moneda fija USD (Decisión #51)
}

/** Estado de filtros del catálogo (sin cambios; extensible). */
export interface ProductFilters {
  search: string;
  tags: string[];
}
```

### 5.2 `src/api/products.api.ts`

```ts
import { ApiError, extractErrorMessage } from '@/api/auth.api';
import type { ProductDto } from '@/types/product';

export type { ProductDto } from '@/types/product';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** `GET /products` → lista de productos (con su `business`). */
export async function getProducts(): Promise<ProductDto[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as ProductDto[];
}

/** `GET /products/:id` → producto (404 → ApiError con mensaje del backend). */
export async function getProductById(id: string): Promise<ProductDto> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new ApiError(await extractErrorMessage(res), res.status);
  return (await res.json()) as ProductDto;
}
```

> `extractErrorMessage` en `auth.api.ts` pasa de `async function` a `export async function`. No se modifica su lógica.

### 5.3 `src/services/products.service.ts` (mapeo)

```ts
import { getProducts, getProductById } from '@/api/products.api';
import type { Product, ProductDto, ProductFilters } from '@/types/product';

/** Coerciona el `decimal` (string|number) del backend a número seguro. */
export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

/** DTO → dominio. Normaliza `null` a arrays vacíos y deriva el nombre del negocio. */
export function mapProductDtoToDomain(dto: ProductDto): Product {
  return {
    id: dto.id,
    businessId: dto.business_id,
    businessName: dto.business?.name,
    name: dto.name,
    tags: dto.tags ?? [],
    imageUrls: dto.images_urls ?? [],
    price: toNumber(dto.price),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  return (await getProducts()).map(mapProductDtoToDomain);
}

export async function fetchProductById(id: string): Promise<Product> {
  return mapProductDtoToDomain(await getProductById(id));
}
```

> `filterProducts`, `extractAvailableTags` y `selectFeaturedProducts` **no cambian**.

### 5.4 `src/utils/apiErrorMessage.ts`

```ts
/**
 * Devuelve un mensaje mostrable a partir de un error desconocido.
 * Prioriza el mensaje del backend (ApiError/Error); si no hay, usa el fallback i18n.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return fallback;
}
```

### 5.5 `src/hooks/useErrorToast.ts`

```ts
import { useEffect } from 'react';
import { showToast } from '@/components/ui';
import { apiErrorMessage } from '@/utils/apiErrorMessage';

/**
 * Muestra un toast de error (con el mensaje del backend si existe) cuando `isError`
 * cambia a `true`. `error` típicamente es el `error` de una query de TanStack Query.
 */
export function useErrorToast(isError: boolean, error: unknown, fallback: string): void {
  useEffect(() => {
    if (isError) showToast.error(apiErrorMessage(error, fallback));
  }, [isError, error, fallback]);
}
```

> `src/hooks/` es para hooks genéricos sin dominio (`ARCHITECTURE.md` §3). Este hook solo conecta un estado de error con el `showToast` existente; no conoce productos. No se puede testear con Vitest node (usa React); la lógica pura extraíble vive en `apiErrorMessage` (sí testeada).

---

## 6. Pasos de implementación (orden estricto, TDD)

> Completar y verificar `npx tsc --noEmit` antes de avanzar. En pasos con test, escribir el test primero y verlo fallar.

### Paso 1 — Util puro de mensajes de error (TDD)

1. `src/utils/apiErrorMessage.test.ts` (primero): `Error('boom')` → `'boom'`; `new ApiError('Producto no encontrado', 404)` → `'Producto no encontrado'`; `new Error('')` → fallback; `undefined`/`'str'`/`{}` → fallback.
2. `src/utils/apiErrorMessage.ts` (5.4).

Ejecutar: `npx vitest run src/utils/apiErrorMessage.test.ts`.

### Paso 2 — Tipo `ProductDto` real

Reescribir `src/types/product.ts` según 5.1. **Eliminar** `business_name` y `image_urls`.

> Tras este paso, `products.service.ts`, `mock-products.ts` y los tests quedarán temporalmente inconsistentes; se corrigen en los pasos siguientes. No compilará hasta el Paso 5; es esperado en TDD.

### Paso 3 — Exportar el parser de errores de `auth.api.ts`

En `src/api/auth.api.ts` cambiar `async function extractErrorMessage` → `export async function extractErrorMessage`. Verificar que no rompe tests existentes: `npx vitest run src/services/auth.service.test.ts`.

### Paso 4 — Adaptador API real (TDD)

1. Reescribir `src/api/products.api.test.ts` con `vi.stubGlobal('fetch', vi.fn())`:
   - `getProducts` hace `GET ${API_BASE}/products`, resuelve ok y devuelve el array de DTOs.
   - `getProducts` con `res.ok === false` y body `{ message: 'Error del backend' }` → rechaza con `ApiError` cuyo `message` es `'Error del backend'` y `status` correcto; `message` también soporta array.
   - `getProductById('abc')` llama a `/products/abc` y devuelve el DTO.
   - `getProductById` con 404 → rechaza con `ApiError`.
   - Restaurar `fetch` original con `vi.unstubAllGlobals()` en `afterEach`.
2. Reescribir `src/api/products.api.ts` (5.2).

Ejecutar: `npx vitest run src/api/products.api.test.ts`.

### Paso 5 — Servicio de productos (TDD)

1. Actualizar `src/services/products.service.test.ts`:
   - `buildProductDto` con la nueva forma: `images_urls`, `business: { id, name, ... }`, `price` (probar `"12.50"` string y `120` number), sin `business_name`/`image_urls`.
   - `mapProductDtoToDomain`: coerciona `price` (`'120.00'` → `120`; `'abc'`/`null` → `0`); `tags: null` → `[]`; `images_urls: null` → `[]`; `business.name` → `businessName`; sin `business` → `businessName` `undefined`.
   - Mantener los casos de `fetchProducts`, `fetchProductById`, `filterProducts`, `extractAvailableTags`, `selectFeaturedProducts`.
   - Añadir test de `toNumber`.
2. Actualizar `src/services/products.service.ts` (5.3).

Ejecutar: `npx vitest run src/services/products.service.test.ts`.

### Paso 6 — Hook `useErrorToast` y README

1. Crear `src/hooks/useErrorToast.ts` (5.5).
2. Crear `src/hooks/README.md`: propósito de la carpeta, inventario (`useErrorToast`), dependencias (`@/components/ui` toast, `@/utils/apiErrorMessage`), y nota de que no tiene test automático (requiere RTL).

### Paso 7 — Catálogo

`src/pages/CatalogPage/CatalogPage.tsx`:

- Eliminar `useBusinesses` y la construcción de `businessNameById` (Decisión #72). `ProductGrid` y `FeaturedProductsSection` ya usan `product.businessName` como fallback, por lo que **no** hay que cambiar sus props (siguen siendo opcionales).
- Añadir `const { error } = useProducts()` y `useErrorToast(isError, error, t('grid.error'))`.
- Mantener hero, búsqueda, filtros, destacados, cultura y `onRetry`.
- `useProducts`/`useProductDetail` **no cambian** (ya usan el servicio).

### Paso 8 — Detalle de producto

`src/pages/ProductDetailPage/ProductDetailPage.tsx`:

- Añadir `const { error } = useProductDetail(id)` y `useErrorToast(isError, error, t('detail.error'))`.
- Mantener el resto (usa `useBusinessDetail` para el bloque de artesano con país; el negocio anidado del producto no trae `owner`).

### Paso 9 — Landing API-driven

1. Reescribir `src/features/landing/hooks/useFeaturedProducts.ts`:

```ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBusinesses } from '@/features/artisans';
import { fetchProducts, selectFeaturedProducts } from '@/services/products.service';
import type { Product } from '@/types/product';

export interface UseFeaturedProductsResult {
  products: Product[];
  businessNameById: Map<string, string>;
  countryByBusinessId: Map<string, string>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

export function useFeaturedProducts(): UseFeaturedProductsResult {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const businessesQuery = useBusinesses();

  const businessNameById = useMemo(
    () => new Map((businessesQuery.data ?? []).map((b) => [b.id, b.name])),
    [businessesQuery.data],
  );
  const countryByBusinessId = useMemo(
    () => new Map((businessesQuery.data ?? []).map((b) => [b.id, b.owner.country])),
    [businessesQuery.data],
  );

  return {
    products: selectFeaturedProducts(productsQuery.data ?? [], 6),
    businessNameById,
    countryByBusinessId,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
  };
}
```

> La importación `@/features/artisans` es válida (API pública vía `index.ts`). Se comparte `queryKey: ['products']` con el catálogo (cache compartida).

2. Reescribir `src/features/landing/components/FeaturedProductsSection/ProductCarousel.tsx`:
   - Props: `{ products: Product[]; businessNameById?: Map<string,string>; countryByBusinessId?: Map<string,string>; isLoading?: boolean; isError?: boolean }` usando el `Product` de `@/types/product`.
   - Renderizar el `ProductCard` compartido: `imageSrc={product.imageUrls[0]}`, `name`, `country={countryByBusinessId?.get(product.businessId)}`, `businessName={businessNameById?.get(product.businessId) ?? product.businessName}`, `tags={product.tags}`, `price`, `priceLabel`, `ctaLabel` (mantener el comportamiento actual: sin `onCtaClick`).
   - Conservar skeletons, estado error y estado vacío actuales.

3. Reescribir `FeaturedProductsSection.tsx` (landing): usar el nuevo hook y pasar `products`, `businessNameById`, `countryByBusinessId`, `isLoading`, `isError`; además `useErrorToast(isError, error, t('featured_products.error_message'))`.

4. `src/features/landing/types.ts`: eliminar la interfaz `Product` (dejar `LatamCountry`).
   `src/features/landing/index.ts`: `export type { LatamCountry } from './types'`.

### Paso 10 — Eliminar mocks

- Borrar `src/data/mock-products.ts`.
- Borrar `src/features/landing/data/featured-products.ts` y `src/features/landing/data/README.md` (carpeta `data/` de la landing queda vacía → eliminar la carpeta).

### Paso 11 — READMEs y DECISIONS (NFR)

- Actualizar los READMEs de la tabla 4.2.
- Añadir la sección **Milestone 7** a `docs/DECISIONS.md` con la tabla de la sección 3.
- Confirmar que cada carpeta creada (`src/hooks/`) tiene README.

### Paso 12 — Verificación final

```bash
npx tsc --noEmit
npx vitest run
npm run format:check   # si falla → npm run format
npm run dev
```

Checklist manual (sección 11).

---

## 7. Estrategia de pruebas (TDD)

| Capa               | Herramienta                 | Archivo                             | Qué cubre                                                             |
| ------------------ | --------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Util               | Vitest (node)               | `utils/apiErrorMessage.test.ts`     | Prioriza mensaje del backend; fallback para entradas no-Error/vacías. |
| Adaptador (`api/`) | Vitest + `stubGlobal fetch` | `api/products.api.test.ts`          | URL/método, parseo, `ApiError` (string y array), 404.                 |
| Servicio           | Vitest + `vi.mock`          | `services/products.service.test.ts` | Mapeo, coerción de `price`, normalización de nulls, filtros.          |
| Store/otros        | Vitest                      | (sin cambios)                       | `cartStore`, `cart.service` siguen verdes.                            |

**Reglas**:

- Test primero, implementación después.
- Sin RTL/jsdom: el hook `useErrorToast` no se testea (se cubre la lógica pura en `apiErrorMessage`).
- Consultar por rol/texto, nunca por clase CSS.
- `products.service.test.ts` mockea `@/api/products.api` (no hace red real).

---

## 8. Reglas de diseño (resumen de `DESIGN.md`)

| Elemento    | Regla                                                                |
| ----------- | -------------------------------------------------------------------- |
| Colores     | Solo tokens Tailwind / `var(--color-*)`. Cero hex en componentes.    |
| Cards       | `rounded-card`, `bg-surface`, `border-border`, `shadow-card`, hover. |
| Secciones   | `py-16 md:py-24`; `SectionContainer` cuando aplique.                 |
| Responsive  | Mobile First: 1 col (móvil) → 2 (tablet) → 3/4 (desktop).            |
| Animaciones | `transition-all duration-200/300`, suaves.                           |

> M7 **no introduce estilos nuevos**: solo reutiliza `ProductCard`, `Skeleton`, `Badge`, `Button`, `SectionContainer` y el `ToastContainer` existentes. El estado de error inline ya cumple el diseño (Decisión #70 agrega el toast encima).

---

## 9. Documentación (NFR)

| Documento                              | Acción                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| `src/hooks/README.md`                  | Crear (carpeta nueva con contenido).                         |
| `src/api/README.md`                    | Actualizar: `products.api.ts` real + `ApiError` reutilizado. |
| `src/services/README.md`               | Actualizar: coerción de `price` y `business.name`.           |
| `src/types/README.md`                  | Actualizar: nuevo `ProductDto`/`ProductBusinessDto`.         |
| `src/features/catalog/README.md`       | Actualizar: contrato real, sin mock, sin join de negocios.   |
| `src/features/landing/README.md`       | Actualizar: destacados API-driven; `data/` eliminado.        |
| `src/features/landing/hooks/README.md` | Actualizar: nuevo `useFeaturedProducts`.                     |
| `src/data/README.md`                   | Actualizar: sin datasets (mock eliminado).                   |
| `docs/DECISIONS.md`                    | Agregar Milestone 7 (#66–#75).                               |

---

## 10. Riesgos y notas para el agente

1. **`images_urls` es PLURAL.** Es el error más probable: el mock usaba `image_urls`. Revisar `types/product.ts`, `products.service.ts` y los tests.
2. **`price` llega como string.** No asumir `number`. Coercionar siempre con `toNumber` antes de formatear/subtotalizar.
3. **`business.owner` NO viene en `/products`.** No intentar leer `product.business.owner.country`. El país del catálogo no se muestra (el `ProductCard` lo omite si no llega). En el detalle se obtiene con `useBusinessDetail`, y en la landing con `useBusinesses`.
4. **Errores del backend:** NestJS devuelve `{ message: string | string[], statusCode }`. `extractErrorMessage` ya une arrays. No concatenar manualmente.
5. **Import lateral en `api/`:** `products.api.ts` importa de `auth.api.ts`. Es dentro de la misma capa (permitido). No mover esa lógica a `components/` ni `features/`.
6. **No tocar** `cartStore`, `cart.service`, `Checkout` ni `Order`.
7. **No tocar** `yawi_api` (solo lectura).
8. **Query cache compartida:** catálogo y landing usan `queryKey: ['products']`. No agregar keys divergentes.
9. Si algo contradice `ARCHITECTURE.md`, pausar y consultar.

---

## 11. Checklist de verificación manual

- [ ] `/products` lista productos **reales** del backend (no mock).
- [ ] Con el backend caído o devolviendo error: aparece un **toast con el mensaje del backend** y el estado inline "Reintentar".
- [ ] "Reintentar" vuelve a pedir a la API.
- [ ] Buscar por nombre y por tag filtra en cliente (sin nuevas peticiones).
- [ ] Filtro por tags (OR) y "Limpiar filtros".
- [ ] Click en "Ver producto" → `/products/:id` con detalle real; galería/tags/precio correctos; `price` numérico correcto.
- [ ] Detalle: bloque de artesano con país (vía `GET /businesses/:id`); si el negocio no existe, no rompe.
- [ ] "Agregar al carrito" sigue funcionando; badge y drawer intactos.
- [ ] Landing: "Productos Destacados" muestra productos reales con país y nombre de negocio.
- [ ] Landing con error de API: toast + estado de error del carrusel.
- [ ] Ningún hex en componentes; todo con tokens.
- [ ] `npx tsc --noEmit`, `npx vitest run` y `npm run format:check` en verde.
- [ ] No queda ninguna referencia a `MOCK_PRODUCTS`, `FEATURED_PRODUCTS`, `mock-products`, `featured-products` ni `image_urls` (singular).

---

_Plan listo para revisión y aprobación antes de implementar._
