# IMPLEMENTATION PLAN — Milestone 6: Catálogo de Productos, Detalle y Carrito

> **Redactado por**: Arquitecto Senior (rol de planificación)
> **Implementador objetivo**: Agente IA nivel junior
> **Fecha**: 2026-10-10
> **Rama sugerida**: `feature/m6-catalog-cart`
> **Estado**: Pendiente de revisión y aprobación

---

## 0. Prerequisitos — Leer antes de tocar cualquier archivo

1. Leer `src/ARCHITECTURE.md` completo. Si algún paso del plan contradice ese archivo, **el archivo de arquitectura manda y debes pausar para consultar**.
2. Leer `docs/DESIGN.md` completo (colores, spacing, cards, hero, CTA, responsive).
3. Leer `docs/DECISIONS.md` completo (decisiones #1 a #50). Este plan agrega la sección **Milestone 6**.
4. Leer `docs/IMPLEMENTATION_PLAN5.md` — es el patrón de referencia del nivel de detalle y de estructura del feature `artisans`.
5. **Nunca** escribir hexadecimales de color en componentes. Solo tokens de Tailwind (`text-primary-navy`, `bg-soft-lavender`, etc.) o variables CSS (`var(--color-primary-navy)`).
6. Al terminar ejecutar `npm run format:check` y, si falla, `npm run format`. **No ejecutar** `npm run lint` ni `oxlint`.
7. `@/` alias ya está activo (vite + vitest). Usarlo en todos los imports nuevos.
8. **TDD**: para servicios, store, hooks utilitarios y utils se escribe **primero el test**, se ejecuta (debe fallar) y luego la implementación hasta ponerlo en verde.
9. **No** modificar `yawi_api`. Todo el trabajo es en `yawi_frontend`.

---

## 1. Contexto y objetivos

### Qué se construye

Tres experiencias públicas nuevas dentro del `AppLayout` existente:

1. **Catálogo de productos** (`/products`): hero, búsqueda (nombre + tags), filtros por tags (preparados para crecer), grilla responsiva de tarjetas de producto, sección de destacados y sección cultural.
2. **Detalle de producto** (`/products/:id`): hero con imagen destacada, galería, tags, precio, información del negocio/artesano asociado (`business_id`) y sección de impacto cultural.
3. **Carrito de compra**: drawer panel (móvil/escritorio) accesible desde el Navbar + página dedicada (`/cart`). Permite agregar, incrementar, reducir, eliminar, vaciar y ver subtotal/resumen.

### Flujo cubierto

Explorar → buscar → filtrar → ver detalle → agregar al carrito → modificar cantidades → eliminar → ver resumen. El carrito persiste entre navegaciones y recargas.

### Alcance de datos

**No existe entidad `Product` en `yawi_api`.** Por eso se implementan **mocks temporales** detrás de la capa `api/` + `services/`, con un contrato tipado equivalente al futuro `GET /products` y `GET /products/:id`. La integración futura solo debe reemplazar el cuerpo de las funciones de `api/products.api.ts` por `fetch(...)`, **sin tocar componentes ni pantallas**.

### Hallazgos sobre imágenes (compatibilidad con `image_urls`)

Investigación del `image uploader` actual de `yawi_api`:

- Las imágenes se suben vía `UploadFileService` → `StorageAdapter` (`LocalStorageAdapter` o `SupabaseStorageAdapter` según `STORAGE_METHOD`).
- En `Business`, la columna `imagesUrls` es `simple-json` (`string[] | null`) y guarda **URLs**: en local son rutas **relativas** del tipo `/uploads/businesses/<uuid>.<ext>` (servidas por `app.use('/uploads', express.static(...))`); con Supabase son **URLs absolutas** (`https://...`).
- El frontend actual renderiza esas URLs tal cual en `<img src>`.

**Implicación para productos:** el futuro `ProductDto` tendrá `image_urls: string[] | null` con la misma semántica (relativas o absolutas). Para evitar imágenes rotas en local, se crea el util `resolveImageUrl` que:

- devuelve intacta cualquier URL absoluta (`http://`, `https://`, `data:`, `blob:`);
- antepone `VITE_API_URL` a rutas que empiezan con `/uploads` (recursos servidos por el backend);
- devuelve intacta cualquier otra ruta relativa (p. ej. `/images/...`, assets públicos del frontend usados por los mocks).

---

## 2. Alcance

### Dentro del alcance (Requerimientos)

- Catálogo con hero, descubrimiento (búsqueda por nombre y tags), filtros por tags, grilla responsiva, destacados y sección cultural.
- Detalle de producto con hero, galería, tags, info pública, info de negocio/artesano y CTA "Agregar al carrito".
- Carrito funcional frontend (agregar, incrementar, reducir, eliminar, vaciar, subtotal).
- Drawer + página `/cart`; estado visual de carrito vacío.
- Store de carrito + capa de hooks/servicios que desacopla la UI.
- Mocks y contratos temporales para productos y carrito.
- i18n ES/EN para todo el texto de UI.
- Mobile First + tokens de diseño de `DESIGN.md`.
- TDD en stores, hooks-utilitarios, adaptadores (capa api) y servicios, lógica de carrito y casos de uso de productos.
- READMEs por carpeta relevante y actualización de `docs/DECISIONS.md`.

### Fuera del alcance

- Checkout, pagos, órdenes, entidad Orders, seguimiento de pedidos.
- Persistencia **remota** del carrito.
- Valoraciones, comentarios o reseñas.
- CRUD de productos o pantallas de gestión/subida de imágenes.
- Modificar `yawi_api` (contratos o entidades existentes).
- Alterar la infraestructura o crear carpetas nuevas fuera de las definidas por `ARCHITECTURE.md`.
- Tests E2E con Playwright, tests de hooks/componentes con React Testing Library (no instalado — ver Decisión M6).

---

## 3. Decisiones arquitectónicas de este Milestone

Se documentarán en `docs/DECISIONS.md` (sección **Milestone 6 — Catálogo, Detalle y Carrito**). Continúan la numeración desde #50.

| #      | Decisión                              | Opciones consideradas                                              | Elección                                                               | Justificación                                                                                                                                                                   |
| ------ | ------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **51** | **Modelo de precio**                  | Sin precio, `price` + `currency` variable, `price` con moneda fija | **`price: number`; moneda fija `USD`**                                 | El producto mínimo no define moneda. El carrito requiere subtotal. Se fija USD como moneda única del MVP para simplificar formato y totales.                                    |
| **52** | **Fuente de datos de productos**      | Mocks en componentes, mocks tras `api/`+`services/`, diferir       | **Mocks tras `api/products.api.ts` + `services/products.service.ts`**  | Respeta la arquitectura de capas. La integración real solo reemplaza el cuerpo de `api/`, sin tocar componentes/páginas.                                                        |
| **53** | **Ubicación del store del carrito**   | `features/cart/store/`, `src/store/cartStore.ts`                   | **`src/store/cartStore.ts`**                                           | Consistente con `authStore.ts` y con `src/store/README.md` (menciona `cartStore.ts`). Permite que el Navbar lea el contador sin invertir capas (precedente `authStore`).        |
| **54** | **Rutas**                             | `/catalog`+`/catalog/:id`, `/products`+`/products/:id`             | **`/products`, `/products/:id`, `/cart`**                              | Convención de URLs en inglés del proyecto; catálogo y detalle con prefijo de recurso.                                                                                           |
| **55** | **UI del carrito**                    | Página, drawer, ambos                                              | **Drawer global + página `/cart`**                                     | El drawer da acceso rápido desde cualquier pantalla; la página ofrece resumen amplio en escritorio. Cumple "pantalla o panel adaptado a móvil y escritorio".                    |
| **56** | **Persistencia del carrito**          | Memoria, `persist` localStorage                                    | **Zustand `persist` en `localStorage` (`yawi-cart`)**                  | El carrito sobrevive recargas. La persistencia remota queda fuera de alcance.                                                                                                   |
| **57** | **Búsqueda y filtrado**               | Filtrado en API, filtrado en cliente                               | **Filtrado en cliente**                                                | No hay endpoint real. El dataset cabe en memoria. Búsqueda por nombre **y** tags; filtro por tags con semántica **OR**.                                                         |
| **58** | **Reutilización de tarjeta**          | Extender `common/ProductCard`, crear nueva en feature              | **Extender `components/common/ProductCard`**                           | Ya es un componente de dominio compartido (landing + catálogo + detalle). Se agregan `tags` y `businessName` opcionales sin romper la landing.                                  |
| **59** | **Resolución de imágenes**            | URL tal cual, helper, forzar absolutas                             | **`utils/resolveImageUrl`**                                            | Compatibilidad con rutas relativas `/uploads/...` (local) y absolutas (Supabase) sin cambiar componentes.                                                                       |
| **60** | **Namespaces i18n**                   | `catalog`+`cart`, `catalog`+`product`+`cart`, `shop`               | **`catalog` + `cart`**                                                 | Separación por dominio consistente con `landing`/`artisans`/`seller` (Decisiones #11, #31). Detalle de producto vive en `catalog`.                                              |
| **61** | **"Adaptadores" (NFR)**               | Crear carpeta `adapters/`, usar capas existentes                   | **`api/` = adaptador de transporte; mapeo DTO→dominio en `services/`** | `ARCHITECTURE.md` no define carpeta `adapters/`. Crear una sería una estructura paralela (prohibido). El adaptador se materializa en `api/` (contrato) + `services/` (mapping). |
| **62** | **Estrategia de pruebas**             | RTL+jsdom, lógica pura (patrón actual)                             | **Lógica pura (Vitest node)**                                          | Ni `@testing-library` ni `jsdom` están instalados (Decisión #50). Se testean servicios, store, utils y el contrato de `api/`. Componentes con test trivial de importación.      |
| **63** | **Formato de moneda**                 | `.toFixed` disperso, `utils/formatCurrency`                        | **`utils/formatCurrency`**                                             | Centraliza el formato USD y evita literales repetidos en componentes.                                                                                                           |
| **64** | **Contador del carrito en el layout** | Navbar importa el feature, Navbar lee el store global              | **Navbar lee `src/store/cartStore.ts`**                                | Mismo patrón ya usado por el Navbar con `authStore`. Evita inversión `components/layout → features`.                                                                            |
| **65** | **Tags como contenido**               | Traducir tags, mostrar tags crudos                                 | **Tags crudos (datos de producto)**                                    | Los tags son datos, no chrome de UI. El texto de interfaz asociado (títulos, "Todas", botones) sí se traduce.                                                                   |

---

## 4. Estructura de archivos

### Archivos nuevos

```text
src/
├── types/
│   ├── product.ts                    ← Product (dominio) + ProductFilters (catálogo)
│   └── cart.ts                       ← CartItem (dominio)
│
├── data/
│   ├── README.md                     ← NUEVO (documenta datos mock)
│   └── mock-products.ts              ← dataset mock (DTOs crudos) para el catálogo
│
├── api/
│   └── products.api.ts               ← ProductDto + getProducts() + getProductById()  (MOCK con contrato HTTP listo)
│   └── products.api.test.ts          ← test del contrato/adaptador mock
│
├── services/
│   ├── products.service.ts           ← mapping DTO→dominio + filterProducts + extractAvailableTags + selectFeaturedProducts
│   ├── products.service.test.ts
│   ├── cart.service.ts               ← cálculo/lógica pura del carrito (subtotal, total items, add/inc/dec/remove)
│   └── cart.service.test.ts
│
├── store/
│   ├── cartStore.ts                  ← Zustand + persist (yawi-cart)
│   └── cartStore.test.ts
│
├── utils/
│   ├── formatCurrency.ts
│   ├── formatCurrency.test.ts
│   ├── resolveImageUrl.ts
│   └── resolveImageUrl.test.ts
│
├── features/
│   ├── catalog/
│   │   ├── components/
│   │   │   ├── CatalogHero/                 (CatalogHero.tsx, index.ts)
│   │   │   ├── ProductSearchBar/            (ProductSearchBar.tsx, index.ts)
│   │   │   ├── ProductFilters/              (ProductFilters.tsx, index.ts)
│   │   │   ├── ProductGrid/                 (ProductGrid.tsx, index.ts)
│   │   │   ├── FeaturedProductsSection/     (FeaturedProductsSection.tsx, index.ts)
│   │   │   ├── CatalogCultureSection/       (CatalogCultureSection.tsx, index.ts)
│   │   │   ├── ProductDetailHero/           (ProductDetailHero.tsx, index.ts)
│   │   │   ├── ProductGallery/              (ProductGallery.tsx, index.ts)
│   │   │   ├── ProductInfo/                 (ProductInfo.tsx, index.ts)
│   │   │   ├── ProductArtisan/              (ProductArtisan.tsx, index.ts)
│   │   │   ├── AddToCartButton/             (AddToCartButton.tsx, index.ts)
│   │   │   └── ProductCultureSection/       (ProductCultureSection.tsx, index.ts)
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   └── useProductDetail.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   └── cart/
│       ├── components/
│       │   ├── CartDrawer/                  (CartDrawer.tsx, index.ts)
│       │   ├── CartItemRow/                 (CartItemRow.tsx, index.ts)
│       │   ├── CartSummary/                 (CartSummary.tsx, index.ts)
│       │   └── CartEmptyState/              (CartEmptyState.tsx, index.ts)
│       ├── hooks/
│       │   └── useCart.ts
│       ├── index.ts
│       └── README.md
│
├── pages/
│   ├── CatalogPage/            (CatalogPage.tsx, index.ts)
│   ├── ProductDetailPage/      (ProductDetailPage.tsx, index.ts)
│   └── CartPage/               (CartPage.tsx, index.ts)
│
└── i18n/locales/
    ├── es/catalog.json
    ├── en/catalog.json
    ├── es/cart.json
    └── en/cart.json
```

### Archivos a modificar (editar puntualmente, nunca reemplazar masivamente)

| Archivo                                                  | Cambio                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/routes/index.tsx`                                   | Agregar `/products`, `/products/:id` y `/cart` dentro de `<Route element={<AppLayout />}>`.      |
| `src/components/layout/Navbar/NavLinks.tsx`              | Cambiar item `explore` de `hash '/#categories'` a `route '/products'`.                           |
| `src/components/layout/Navbar/Navbar.tsx`                | Agregar botón de carrito (ícono `ShoppingBag` + badge) que llama `useCartStore(...).openCart()`. |
| `src/components/layout/Navbar/MobileMenu.tsx`            | Agregar enlace "Ver carrito" a `/cart` que abra/cierre el menú.                                  |
| `src/components/common/ProductCard/ProductCard.tsx`      | Agregar props opcionales `tags`, `businessName`, y hacer `country`/`artisan` opcionales.         |
| `src/components/common/ProductCard/ProductCard.test.tsx` | Mantener test trivial de importación (patrón actual).                                            |
| `src/App.tsx`                                            | Montar `<CartDrawer />` a nivel global (junto a `<ToastContainer />`).                           |
| `src/i18n/i18n.ts`                                       | Importar y registrar `catalog` y `cart` en `es` y `en`.                                          |
| `src/pages/README.md`                                    | Documentar las 3 páginas nuevas.                                                                 |
| `src/store/README.md`                                    | Documentar `cartStore.ts`.                                                                       |
| `src/services/README.md`                                 | Documentar `products.service.ts` y `cart.service.ts`.                                            |
| `src/api/README.md`                                      | Documentar `products.api.ts` (mock).                                                             |
| `src/types/README.md`                                    | Documentar `product.ts` y `cart.ts`.                                                             |
| `src/i18n/README.md`                                     | Documentar namespaces `catalog`/`cart`.                                                          |
| `src/components/common/README.md`                        | Documentar las props nuevas de `ProductCard`.                                                    |
| `src/utils/README.md`                                    | Documentar `formatCurrency` y `resolveImageUrl`.                                                 |
| `docs/DECISIONS.md`                                      | Agregar sección Milestone 6 (#51–#65).                                                           |

> **Nota de imports**: los archivos nuevos usan `@/`. Los archivos existentes conservan su estilo salvo el cambio puntual indicado.

---

## 5. Contratos y tipos

### 5.1 `src/types/product.ts`

```ts
/**
 * Modelo de dominio de un producto artesanal para la UI.
 * El DTO crudo del backend vive en `api/products.api.ts` (no aquí).
 */
export interface Product {
  id: string;
  businessId: string; // FK → Business.id
  name: string;
  tags: string[]; // nunca null (array vacío si no tiene)
  imageUrls: string[]; // nunca null (array vacío si no tiene)
  price: number; // moneda fija USD (Decisión #51)
}

/**
 * Estado de filtros del catálogo.
 * Diseñado para extenderse en el futuro con:
 * country, artisanId, category, priceMin, priceMax, availability.
 */
export interface ProductFilters {
  search: string; // nombre o tags
  tags: string[]; // tags seleccionadas (semántica OR)
}
```

### 5.2 `src/types/cart.ts`

```ts
/** Ítem del carrito. Snapshots del producto para evitar depender de refetch. */
export interface CartItem {
  productId: string;
  businessId: string;
  name: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  quantity: number;
}
```

### 5.3 `src/api/products.api.ts` (DTO + adaptador mock)

```ts
import { MOCK_PRODUCTS } from '@/data/mock-products';

/**
 * DTO crudo equivalente al futuro contrato `GET /products` de yawi_api.
 * Propiedades mínimas del producto: id, business_id, name, tags, image_urls (+ price del MVP).
 * `tags` e `image_urls` son JSON (lista de strings) y pueden llegar `null`.
 */
export interface ProductDto {
  id: string;
  business_id: string;
  name: string;
  tags: string[] | null;
  image_urls: string[] | null;
  price: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * ⚠️ MOCK TEMPORAL.
 * TODO(backend): reemplazar por:
 *   const res = await fetch(`${API_BASE}/products`);
 *   if (!res.ok) throw new Error(`Error fetching products: ${res.status}`);
 *   return res.json() as Promise<ProductDto[]>;
 * La firma pública no debe cambiar.
 */
export async function getProducts(): Promise<ProductDto[]> {
  return Promise.resolve(MOCK_PRODUCTS);
}

/**
 * ⚠️ MOCK TEMPORAL.
 * TODO(backend): reemplazar por `fetch(`${API_BASE}/products/${id}`)`.
 */
export async function getProductById(id: string): Promise<ProductDto> {
  const found = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`Product ${id} not found`);
  return Promise.resolve(found);
}
```

> `API_BASE` se deja declarado (aunque sin usar todavía) para que el reemplazo por HTTP sea de una línea. Evitar la advertencia de variable sin usar no es problema (no se corre lint). Si TypeScript marca error por `noUnusedLocals`, prefijar con `void API_BASE;` o comentarlo hasta la integración real.

### 5.4 `src/data/mock-products.ts`

Dataset de ~8 a 10 productos que cubra varios tags y use las imágenes ya presentes en `public/images/` (`producto1.webp`, `productos2.webp`, `producto3.webp`, `productos4.webp`, `productos5.webp`, `producto6.webp`, `textiles.webp`, `joyeria.webp`, `alfareria.webp`, `maderas.webp`, `accesorios.webp`, `pinturas.webp`, `ropa.webp`, `hamacas.webp`).

- `image_urls` como rutas públicas `/images/...` (el helper `resolveImageUrl` las deja intactas).
- `tags` variadas y reutilizadas para poder demostrar filtrado (p. ej. `['textiles','hecho a mano']`, `['joyeria','plata']`, `['ceramica']`, `['madera','decoracion']`, etc.).
- `business_id` con UUIDs ficticios que **no** tienen por qué existir en el backend: el join con negocios es "best-effort" (si no hay negocio, la tarjeta no muestra artesano).
- Todos con `price` numérico.

> **Nota**: el dataset es contenido estático. No se traduce (Decisión #65).

---

## 6. Pasos de implementación (orden estricto, TDD)

> **Regla**: completar cada paso y verificar que compila antes de avanzar. Para pasos con test, escribir el test primero.

---

### Paso 1 — Utilidades puras (TDD)

#### 1.1 `src/utils/formatCurrency.ts`

**Contrato**: `formatCurrency(amount: number): string` → moneda fija USD.

```ts
export const DEFAULT_CURRENCY = 'USD';

/** Formatea un monto en USD, p. ej. 120 → "$120.00 USD". */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `$${safe.toFixed(2)} ${currency}`;
}
```

**Test `formatCurrency.test.ts`** (escribir primero): formatea enteros, decimales, redondea a 2 decimales, y devuelve `"$0.00 USD"` con entrada no finita.

#### 1.2 `src/utils/resolveImageUrl.ts`

**Contrato**: resuelve una URL de imagen compatible con el almacenamiento del backend.

```ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Devuelve una URL usable en <img src>.
 * - Absolutas (http/https/data/blob) → intactas.
 * - Rutas del backend que empiezan con `/uploads` → prefijadas con VITE_API_URL.
 * - Otras rutas relativas (assets públicos `/images/...`) → intactas.
 */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
}
```

**Test `resolveImageUrl.test.ts`** (escribir primero): absoluta intacta; `/uploads/...` prefijada con el base (mockear `import.meta.env` si es necesario o comprobar que empieza con `http`); `/images/...` intacta; `undefined`/`null`/`''` → `undefined`.

> Ejecutar: `npx vitest run src/utils`.

---

### Paso 2 — Tipos

Crear `src/types/product.ts` y `src/types/cart.ts` con el contenido de la sección 5.

---

### Paso 3 — Mock dataset

Crear `src/data/mock-products.ts` (sección 5.4) con `MOCK_PRODUCTS: ProductDto[]`. Importar el tipo `ProductDto` desde `@/api/products.api` (evitar ciclo: `api` importa `data`, `data` importa tipo de `api` es un ciclo de tipos; si TypeScript lo rechaza, declarar el array como `ProductDto[]` importándolo con `import type` — los ciclos solo de tipos se resuelven; si aun así molesta, mover el interface `ProductDto` a `src/types/product.ts` y re-exportarlo desde `api`).

> **Decisión práctica**: para evitar el ciclo `api ↔ data`, declarar `ProductDto` en `src/types/product.ts` y **re-exportarlo** desde `api/products.api.ts`. Así `data/` importa de `types/` (permitido) y `api/` también. El README de `api/` sugiere DTOs en el `*.api.ts`, pero la regla de capas (`data → types`) manda para evitar ciclos. Documentar esta variante en el README de `api/`.

---

### Paso 4 — Adaptador API + test (TDD)

Crear `src/api/products.api.ts` (sección 5.3, con `ProductDto` re-exportado).

**Test `products.api.test.ts`** (escribir primero):

- `getProducts()` devuelve un array no vacío de DTOs con la forma esperada (`id`, `business_id`, `name`, `tags`, `image_urls`, `price`).
- `getProductById('id-existente')` devuelve el DTO correcto.
- `getProductById('inexistente')` rechaza con error.

---

### Paso 5 — Servicio de productos (TDD)

`src/services/products.service.ts`:

```ts
import { getProducts, getProductById } from '@/api/products.api';
import type { ProductDto } from '@/api/products.api';
import type { Product, ProductFilters } from '@/types/product';

/** DTO → dominio. Normaliza nulls a arrays vacíos. */
export function mapProductDtoToDomain(dto: ProductDto): Product {
  return {
    id: dto.id,
    businessId: dto.business_id,
    name: dto.name,
    tags: dto.tags ?? [],
    imageUrls: dto.image_urls ?? [],
    price: dto.price,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  return (await getProducts()).map(mapProductDtoToDomain);
}

export async function fetchProductById(id: string): Promise<Product> {
  return mapProductDtoToDomain(await getProductById(id));
}

/**
 * Filtra por nombre **o** tags (búsqueda) y por tags seleccionadas (OR).
 * Preparado para crecer (ver ProductFilters): país, artesano, categoría, precio, disponibilidad.
 */
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const term = filters.search.trim().toLowerCase();
  return products.filter((p) => {
    const matchesSearch =
      term === '' ||
      p.name.toLowerCase().includes(term) ||
      p.tags.some((tag) => tag.toLowerCase().includes(term));
    const matchesTags =
      filters.tags.length === 0 || filters.tags.some((tag) => p.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
}

/** Tags únicos de los productos cargados, ordenados alfabéticamente. */
export function extractAvailableTags(products: Product[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b));
}

/** Selección determinista de destacados (primeros N). */
export function selectFeaturedProducts(products: Product[], limit = 4): Product[] {
  return products.slice(0, limit);
}
```

**Test `products.service.test.ts`** (escribir primero), mockeando `@/api/products.api` con `vi.mock`:

1. `mapProductDtoToDomain`: `tags: null` → `[]`, `image_urls: null` → `[]`, mapea `business_id`→`businessId`.
2. `fetchProducts` mapea la lista; con `[]` devuelve `[]`.
3. `fetchProductById` mapea un DTO.
4. `filterProducts`:
   - busca por nombre (case-insensitive);
   - busca por tag;
   - filtro por tag seleccionada (OR con varias);
   - combinación búsqueda + filtros;
   - sin filtros devuelve todo.
5. `extractAvailableTags`: dedup + orden alfabético.
6. `selectFeaturedProducts`: respeta `limit` y orden.

> Ejecutar: `npx vitest run src/services/products.service.test.ts`.

---

### Paso 6 — Servicio de carrito (TDD)

`src/services/cart.service.ts` — **lógica pura, sin React**:

```ts
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

export function toCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    businessId: product.businessId,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrls[0],
    tags: product.tags,
    quantity,
  };
}

/** Agrega 1 unidad (o `quantity`) o incrementa si ya existe. */
export function addItem(items: CartItem[], product: Product, quantity = 1): CartItem[] {
  /* ... */
}

export function incrementItem(items: CartItem[], productId: string): CartItem[] {
  /* ... */
}

/** Nunca baja de 1 (la eliminación es una acción aparte). */
export function decrementItem(items: CartItem[], productId: string): CartItem[] {
  /* ... */
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  /* ... */
}

export function computeTotalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function computeSubtotal(items: CartItem[]): number {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return Math.round(total * 100) / 100;
}
```

**Test `cart.service.test.ts`** (escribir primero): agregar nuevo, agregar existente (suma cantidad), incrementar, decrementar sin bajar de 1, decrementar ítem inexistente (no-op), eliminar, `computeTotalItems`, `computeSubtotal` (redondeo a 2 decimales), carrito vacío → 0.

---

### Paso 7 — Store del carrito (TDD)

`src/store/cartStore.ts` (Zustand + `persist`):

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addItem,
  incrementItem,
  decrementItem,
  removeItem,
  computeTotalItems,
  computeSubtotal,
} from '@/services/cart.service';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const CART_STORAGE_NAME = 'yawi-cart';

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addToCart: (product, quantity = 1) =>
        set((s) => ({ items: addItem(s.items, product, quantity) })),
      increment: (productId) => set((s) => ({ items: incrementItem(s.items, productId) })),
      decrement: (productId) => set((s) => ({ items: decrementItem(s.items, productId) })),
      remove: (productId) => set((s) => ({ items: removeItem(s.items, productId) })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: CART_STORAGE_NAME,
      partialize: (state) => ({ items: state.items }), // NO persistir isOpen
    },
  ),
);

// Selectores reutilizables (evitan lógica en componentes)
export const selectTotalItems = (s: CartState) => computeTotalItems(s.items);
export const selectSubtotal = (s: CartState) => computeSubtotal(s.items);
```

**Test `cartStore.test.ts`** (escribir primero):

- Estado inicial `items: []`, `isOpen: false`.
- `addToCart` agrega; agregar el mismo producto incrementa cantidad.
- `increment`/`decrement`/`remove`/`clear` funcionan.
- `selectTotalItems` y `selectSubtotal` calculan correctamente.
- `partialize` persiste solo `items` (comprobar `useCartStore.persist.getOptions().name === 'yawi-cart'` y que `partialize!({ ...state })` no incluya `isOpen`).
- En cada test resetear: `useCartStore.setState({ items: [], isOpen: false })`.

> En entorno `node`, `localStorage` no existe; `persist` se comporta como no-op con advertencia. Los tests validan el estado en memoria y `partialize`, no el I/O.

---

### Paso 8 — Hooks del feature

#### `src/features/catalog/hooks/useProducts.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/services/products.service';

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: fetchProducts });
}
```

#### `src/features/catalog/hooks/useProductDetail.ts`

```ts
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });
}
```

#### `src/features/cart/hooks/useCart.ts`

Capa que desacopla la UI del store (el "contexto/capa equivalente" del requerimiento):

```ts
import { useCartStore, selectTotalItems, selectSubtotal } from '@/store/cartStore';

export function useCart() {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore(selectTotalItems);
  const subtotal = useCartStore(selectSubtotal);
  const isOpen = useCartStore((s) => s.isOpen);
  const addToCart = useCartStore((s) => s.addToCart);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  return {
    items,
    totalItems,
    subtotal,
    isOpen,
    addToCart,
    increment,
    decrement,
    remove,
    clear,
    openCart,
    closeCart,
  };
}
```

> Los components de `features/*` consumen `useCart()` / hooks, nunca `@/api/` ni `@/lib/`.

---

### Paso 9 — i18n

#### `src/i18n/locales/es/catalog.json`

```json
{
  "hero": {
    "badge": "Productos Auténticos",
    "title": "Descubre el alma de Latinoamérica",
    "subtitle": "Explora piezas hechas a mano por artesanos de toda la región y conecta con culturas únicas.",
    "cta_primary": "Explorar catálogo",
    "cta_secondary": "Conocer Yawi"
  },
  "search": { "label": "Buscar productos", "placeholder": "Buscar por nombre o etiqueta..." },
  "filters": { "title": "Filtrar por etiquetas", "all": "Todas", "clear": "Limpiar filtros" },
  "grid": {
    "loading": "Cargando productos...",
    "empty": "No encontramos productos con esos criterios.",
    "error": "No pudimos cargar los productos. Intenta de nuevo.",
    "retry": "Reintentar"
  },
  "card": { "view_product": "Ver producto", "artisan_label": "Artesano", "price_label": "Precio" },
  "featured": {
    "title": "Productos Destacados",
    "subtitle": "Una selección de piezas que representan lo mejor de la artesanía latinoamericana."
  },
  "culture": {
    "title": "Cada compra apoya a un artesano",
    "text": "Al comprar en Yawi apoyas directamente a emprendedores y artesanos latinoamericanos, ayudando a preservar tradiciones y a crear oportunidades justas para sus comunidades."
  },
  "detail": {
    "back": "Volver al catálogo",
    "gallery_title": "Galería",
    "tags_title": "Etiquetas",
    "price_label": "Precio",
    "artisan_title": "Sobre el artesano",
    "artisan_country": "País",
    "add_to_cart": "Agregar al carrito",
    "no_images": "Este producto no tiene imágenes disponibles.",
    "culture_title": "El impacto de tu compra",
    "culture_text": "Comprar {{name}} apoya a artesanos latinoamericanos y ayuda a preservar técnicas tradicionales.",
    "loading": "Cargando producto...",
    "error": "No pudimos cargar el producto.",
    "not_found": "Producto no encontrado."
  }
}
```

#### `src/i18n/locales/es/cart.json`

```json
{
  "title": "Tu carrito",
  "open": "Abrir carrito",
  "close": "Cerrar carrito",
  "items": "{{count}} artículos",
  "empty_title": "Tu carrito está vacío",
  "empty_message": "Explora el catálogo y agrega tus productos favoritos.",
  "empty_cta": "Explorar productos",
  "increase": "Aumentar cantidad",
  "decrease": "Reducir cantidad",
  "remove": "Eliminar",
  "clear": "Vaciar carrito",
  "quantity": "Cantidad",
  "subtotal": "Subtotal",
  "total": "Total",
  "view_full_cart": "Ver carrito completo",
  "continue_shopping": "Seguir comprando",
  "checkout": "Finalizar compra",
  "checkout_coming_soon": "Checkout próximamente",
  "added": "Producto agregado al carrito"
}
```

> `catalog.json` y `cart.json` en `en/` con la **misma jerarquía de claves** (regla de `i18n/README.md`). Evitar claves plurales (`_plural`/`_one`) y usar interpolación `{{count}}` para no depender de las reglas de plural de i18next.

#### Registrar en `src/i18n/i18n.ts`

Agregar imports `esCatalog`, `enCatalog`, `esCart`, `enCart` y las claves `catalog`/`cart` dentro de los recursos `es` y `en`. No modificar las claves existentes.

---

### Paso 10 — Extender `components/common/ProductCard`

Modificar `ProductCard.tsx` (mantener compatibilidad con `ProductCarousel` de la landing):

- Agregar props opcionales:
  - `tags?: string[]` → render de hasta ~3 `Badge` `outline` debajo del nombre.
  - `businessName?: string` → se muestra como línea de negocio/artesano (si no viene, usar `artisan`).
  - `country?: string` y `artisan?: string` pasan a **opcionales** (la landing los sigue enviando).
- Convertir el precio a `formatCurrency(price)` (o mantener el render actual si se prefiere no alterar la landing; ver nota).
- Usar `resolveImageUrl(imageSrc)` en `ImagePlaceholder`.
- Mantener `p-0 overflow-hidden`, `hoverable`, `rounded-card`, tokens de diseño.

> **Compatibilidad**: `ProductCarousel` (landing) sigue pasando `country`, `artisan`, `price`, `currency`, `ctaLabel`. Al ser props opcionales, no se rompe. El `ProductCard.test.tsx` se mantiene como test trivial de importación (patrón actual).

**`ProductGrid`** (feature catalog) envuelve las tarjetas con estados:

- Loading: 6 `Skeleton` con dimensiones de tarjeta.
- Error: ícono + mensaje + botón "Reintentar".
- Empty: ícono `SearchX` + mensaje.
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
- Recibe `onViewProduct(id)` y `businessNameById` (o un `Map<string,string>`).

---

### Paso 11 — Componentes del feature `catalog`

Todos ≤ ~150 líneas, presentacionales, textos vía `useTranslation('catalog')`, sin imports de `@/api`/`@/lib`.

1. **`CatalogHero`**: patrón de `ArtisansHero`/`HeroSection`. Gradiente navy→indigo con orbs (`var(--color-*)`), 40% texto / 60% visual (desktop), columna única en móvil. CTA primario → scroll a `#catalog-discovery`; CTA secundario → `/artisans` (o `/#story`).
2. **`ProductSearchBar`**: reutiliza `Input` de `components/ui` con ícono `Search`, debounce 300ms (patrón de `ArtisansSearchBar`).
3. **`ProductFilters`**: chips de tags derivadas (`extractAvailableTags`), scroll horizontal en móvil, `md:flex-wrap`. Chip activo `bg-primary-navy text-white`; inactivo `border border-primary-navy/30`. Botón "Limpiar filtros" cuando hay selección. Propuesta a futuro: dejar un contenedor "extensible" comentado para país/artesano/categoría/precio/disponibilidad (sin implementarlos).
4. **`ProductGrid`** (ver Paso 10).
5. **`FeaturedProductsSection`**: usa `selectFeaturedProducts(products)`; 3–4 tarjetas; `SectionContainer background="surface"`.
6. **`CatalogCultureSection`**: sección cultural; gradiente suave + `Sparkles`; título/texto i18n. Inspirada en `CultureSection` de la landing.
7. **`ProductDetailHero`**: imagen destacada (primera de `imageUrls`, resuelta con `resolveImageUrl`) o placeholder; overlay gradiente; nombre, tags y precio; botón volver; `h-64 md:h-96 lg:h-[70vh]`.
8. **`ProductGallery`**: 0 → mensaje `no_images`; 1 → imagen grande; 2–4 → grid `grid-cols-2 md:grid-cols-4`. Thumbnails seleccionables (estado local `useState`).
9. **`ProductInfo`**: nombre, tags (`Badge`), precio (`formatCurrency`), descripción pública si existiera (no hay en el modelo mínimo → omitir o mostrar tags como "información pública disponible").
10. **`ProductArtisan`**: recibe `business?: Business` (de `features/artisans`) y `owner`; avatar con iniciales, nombre del negocio, país, ubicación resumida. Si no hay negocio, no renderiza (best-effort).
11. **`AddToCartButton`**: recibe `product`; llama `useCart().addToCart(product)`, dispara `showToast` (`variant: 'success'`, `cart.added`) y abre el drawer (`openCart()`). `Button variant="cta"`/`primary`.
12. **`ProductCultureSection`**: refuerza el propósito; interpolación `detail.culture_text` con `name`.

**`features/catalog/index.ts`**: exportar hooks + componentes + tipos públicos.
**`features/catalog/README.md`**: propósito, rutas, dependencias, contrato de datos, extensiones de filtros.

---

### Paso 12 — Componentes del feature `cart`

1. **`CartDrawer`**: portal `createPortal` (patrón `MobileMenu`). `fixed` overlay + panel derecho (`w-full sm:w-[420px]`), backdrop `bg-primary-navy/60`, `Escape` cierra, bloqueo de scroll, `role="dialog" aria-modal`. Contenido: header (título + cerrar), lista de `CartItemRow`, `CartEmptyState` si vacío, `CartSummary` (subtotal + acciones). Acciones: `clear`, enlace `view_full_cart` a `/cart`. CTA "Finalizar compra" **deshabilitado** con label `checkout_coming_soon` (fuera de alcance).
2. **`CartItemRow`**: imagen (`resolveImageUrl` + `ImagePlaceholder`), nombre, precio unitario, stepper (− cantidad +), botón eliminar. `−` deshabilitado si `quantity === 1`.
3. **`CartSummary`**: subtotal/total con `formatCurrency`; children para acciones.
4. **`CartEmptyState`**: ícono + `empty_title` + `empty_message` + CTA `empty_cta` → `/products`, cierra drawer.

**`features/cart/index.ts`**: exportar `useCart`, `CartDrawer`, `CartItemRow`, `CartSummary`, `CartEmptyState`.
**`features/cart/README.md`**: propósito, store, persistencia, capa `useCart`.

> La **página** `/cart` reutiliza `CartItemRow` + `CartSummary` + `CartEmptyState` en un layout de 2 columnas (items | resumen sticky en desktop; columna en móvil).

---

### Paso 13 — Páginas

#### `src/pages/CatalogPage/CatalogPage.tsx`

Solo composición:

```tsx
const { t } = useTranslation('catalog');
const { data: products = [], isLoading, isError, refetch } = useProducts();
const { data: businesses = [] } = useBusinesses(); // de @/features/artisans (API pública)
const [filters, setFilters] = useState<ProductFilters>({ search: '', tags: [] });

const availableTags = useMemo(() => extractAvailableTags(products), [products]);
const businessNameById = useMemo(
  () => new Map(businesses.map((b) => [b.id, b.name])),
  [businesses],
);
const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);
```

Estructura: `<CatalogHero />` → `FeaturedProductsSection` (si hay productos) → sección `#catalog-discovery` con `ProductSearchBar` + `ProductFilters` + `ProductGrid` → `CatalogCultureSection`.
`onViewProduct` navega a `/products/${id}`.

`index.ts`: `export { default as CatalogPage } from './CatalogPage';`

#### `src/pages/ProductDetailPage/ProductDetailPage.tsx`

```tsx
const { id = '' } = useParams<{ id: string }>();
const { data: product, isLoading, isError } = useProductDetail(id);
const { data: business } = useBusinessDetail(product?.businessId ?? '');
```

- Loading → skeletons.
- Error / `!product` → estado de error con "Volver al catálogo".
- Éxito → `ProductDetailHero` → `ProductGallery` → `ProductInfo` (+ `AddToCartButton`) → `ProductArtisan` → `ProductCultureSection`.

#### `src/pages/CartPage/CartPage.tsx`

Composición de `useCart()` + `CartItemRow` + `CartSummary` + `CartEmptyState`. Enlace "Seguir comprando" → `/products`.

---

### Paso 14 — Rutas

En `src/routes/index.tsx`:

```tsx
const CatalogPage = lazy(() => import('../pages/CatalogPage/CatalogPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage/CartPage'));
```

Dentro de `<Route element={<AppLayout />}>`:

```tsx
<Route path="/products" element={<CatalogPage />} />
<Route path="/products/:id" element={<ProductDetailPage />} />
<Route path="/cart" element={<CartPage />} />
```

---

### Paso 15 — Navbar, MobileMenu y App

- `NavLinks.tsx`: `{ labelKey: 'explore', href: '/products', type: 'route' }`.
- `Navbar.tsx`: importar `useCartStore`, `selectTotalItems`. Agregar botón (siempre visible) con ícono `ShoppingBag` + badge de `totalItems` (ocultar badge si 0), `onClick={() => openCart()}`, `aria-label={t('open', {ns:'cart'})}`. Mantener el resto del comportamiento.
- `MobileMenu.tsx`: agregar un `Link` a `/cart` ("Ver carrito") que llame `onClose`.
- `App.tsx`: montar `<CartDrawer />` globalmente (junto a `<ToastContainer />`), importándolo desde `@/features/cart`.

---

### Paso 16 — READMEs y DECISIONS

- Crear `src/features/catalog/README.md` y `src/features/cart/README.md`.
- Crear `src/data/README.md` (dataset mock).
- Actualizar los READMEs listados en la sección 4.
- Agregar la sección **Milestone 6** a `docs/DECISIONS.md` con la tabla de la sección 3.

---

### Paso 17 — Verificación final

```bash
npx tsc --noEmit          # sin errores de tipos
npx vitest run            # todos los tests en verde
npm run format:check      # si falla → npm run format
npm run dev               # servidor de desarrollo
```

**Checklist manual** (ver sección 11).

---

## 7. Estrategia de pruebas (TDD)

| Capa                  | Herramienta        | Archivo                                                         | Qué cubre                                                         |
| --------------------- | ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| Utils                 | Vitest (node)      | `utils/formatCurrency.test.ts`, `utils/resolveImageUrl.test.ts` | Formato USD, resolución de URLs relativas/absolutas.              |
| Adaptador (api)       | Vitest (node)      | `api/products.api.test.ts`                                      | Forma del DTO y comportamiento de `getProducts`/`getProductById`. |
| Servicio de productos | Vitest + `vi.mock` | `services/products.service.test.ts`                             | Mapping, búsqueda, filtros, tags, destacados.                     |
| Servicio de carrito   | Vitest (node)      | `services/cart.service.test.ts`                                 | Add/inc/dec/remove, totales, redondeo, casos límite.              |
| Store del carrito     | Vitest (node)      | `store/cartStore.test.ts`                                       | Acciones, selectores, `persist`/`partialize`.                     |
| Componentes           | Vitest             | tests triviales de importación (patrón actual)                  | Que los componentes se exportan correctamente.                    |

**Reglas de test**:

- Escribir el test **antes** de la implementación y verlo fallar.
- Sin RTL/jsdom: los componentes con lógica se testean indirectamente a través de la lógica pura extraída a `services/`/`utils/`.
- Consultar por rol/texto cuando aplique (no por clase CSS).
- Resetear el store del carrito en `beforeEach`.

---

## 8. Reglas de diseño (resumen de `DESIGN.md`)

| Elemento     | Regla                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| Colores      | Solo tokens Tailwind del `@theme` / `var(--color-*)`. **Cero hex** en componentes.    |
| Gradientes   | Inline con `var(--color-primary-navy)`, `var(--color-primary-indigo)`, etc.           |
| Hero         | 40% texto / 60% visual (desktop); columna única en móvil.                             |
| Cards        | `rounded-card`, `bg-surface`, `border-border`, `shadow-card`, hover `-translate-y-1`. |
| Headings     | `font-extrabold tracking-tight leading-tight`.                                        |
| Secciones    | `py-16 md:py-24`; usar `SectionContainer` cuando aplique.                             |
| Fondos       | Página `bg-background`; cards `bg-surface`.                                           |
| Plumón peach | < 10% del área visible (solo CTAs/etiquetas destacadas).                              |
| Animaciones  | `transition-all duration-200/300`, suaves; sin rebotes ni rotaciones.                 |
| Responsive   | Móvil 1 columna → tablet 2 → desktop 3/4. Mobile First.                               |
| Logo         | `/images/yawi-logo.svg` (ya incluido en `public/images/`).                            |

---

## 9. Documentación (NFR)

| Documento                         | Acción                                                                   |
| --------------------------------- | ------------------------------------------------------------------------ |
| `src/features/catalog/README.md`  | Crear: propósito, rutas, hooks, dependencias, extensión de filtros.      |
| `src/features/cart/README.md`     | Crear: propósito, store, persistencia, `useCart`, componentes.           |
| `src/data/README.md`              | Crear: describe `mock-products.ts` y cómo sustituirlo cuando exista API. |
| `docs/DECISIONS.md`               | Agregar Milestone 6 (#51–#65).                                           |
| `src/pages/README.md`             | Add `CatalogPage`, `ProductDetailPage`, `CartPage`.                      |
| `src/store/README.md`             | Add `cartStore.ts` (estado, persistencia, selectores).                   |
| `src/services/README.md`          | Add `products.service.ts`, `cart.service.ts`.                            |
| `src/api/README.md`               | Add `products.api.ts` (mock + contrato futuro).                          |
| `src/types/README.md`             | Add `product.ts`, `cart.ts`.                                             |
| `src/i18n/README.md`              | Add namespaces `catalog`, `cart`.                                        |
| `src/components/common/README.md` | Add props nuevas de `ProductCard`.                                       |
| `src/utils/README.md`             | Add `formatCurrency`, `resolveImageUrl`.                                 |

---

## 10. Riesgos y notas para el agente

1. **Ciclo `api ↔ data`**: `ProductDto` se declara en `types/product.ts` y se re-exporta desde `api/products.api.ts` para que `data/` no importe de `api/`. Documentarlo.
2. **`localStorage` en tests**: no existe en entorno `node`; `persist` es no-op. No intentar mockear `localStorage` (no hay jsdom). Testear estado en memoria + `partialize`.
3. **`business_id` sin negocio real**: el join con `businesses` es best-effort. Si `useBusinesses` está vacío o falla, la tarjeta/detalle simplemente no muestra artesano. Nunca romper el render por eso.
4. **`Price` y `currency`**: el dominio usa `price: number` con USD fijo. No introducir `currency` por producto.
5. **Compatibilidad de `ProductCard`**: al hacer `country`/`artisan` opcionales, revisar que `ProductCarousel` (landing) siga compilando y mostrando igual.
6. **No tocar `yawi_api`** ni el design system (`index.css`) sin aprobación.
7. **No crear** carpetas `adapters/`, `contexts/` nuevas ni features adicionales. El "contexto/capa equivalente" es el store + `useCart`.
8. **`UseBusinesses`/`useBusinessDetail`**: consumirlos desde `@/features/artisans` (API pública), nunca desde sus internals.
9. Si algo contradice `ARCHITECTURE.md`, pausar y consultar antes de continuar.

---

## 11. Checklist de verificación manual

- [ ] `/products` carga el catálogo sin overflow horizontal en móvil (320–767px, 1 columna).
- [ ] Tablet (768–1023px): 2 columnas. Desktop (≥1024px): 3–4 columnas.
- [ ] Búsqueda por **nombre** filtra en tiempo real (con debounce).
- [ ] Búsqueda por **tag** filtra correctamente.
- [ ] Filtro por tags (OR) funciona; "Limpiar filtros" restablece.
- [ ] Estado vacío visible cuando no hay coincidencias.
- [ ] Estado error visible cuando falla la carga, con "Reintentar".
- [ ] Destacados y sección cultural se muestran.
- [ ] Click en "Ver producto" navega a `/products/:id` con el detalle correcto.
- [ ] Detalle: hero, galería (thumbnails), tags, precio, negocio/artesano y sección cultural.
- [ ] "Agregar al carrito" agrega, muestra toast y abre el drawer.
- [ ] Drawer: incrementar, decrementar (deshabilitado en 1), eliminar, vaciar, subtotal.
- [ ] `/cart`: resumen amplio, estado vacío, "Seguir comprando".
- [ ] El carrito persiste al navegar entre páginas y al recargar (localStorage `yawi-cart`).
- [ ] El badge del carrito en el Navbar refleja el total de ítems.
- [ ] Cambio de idioma EN/ES traduce todo el texto de UI (catálogo, detalle, carrito).
- [ ] Navbar "Explorar" apunta a `/products` y marca activo.
- [ ] Ningún hex en componentes; todos los colores vienen de tokens.
- [ ] `npx tsc --noEmit`, `npx vitest run` y `npm run format:check` en verde.

---

_Plan listo para revisión y aprobación antes de implementar._
