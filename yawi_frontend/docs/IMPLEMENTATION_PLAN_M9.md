# IMPLEMENTATION PLAN — Milestone 9: Refactorización SEO Transaccional — Página de Artesanías

> **Redactado por**: Arquitecto Senior Frontend / SEO
> **Implementador objetivo**: Agente IA
> **Fecha**: 2026-10-27
> **Rama sugerida**: `feature/m9-artesanias-seo`
> **Estado**: Pendiente de aprobación

---

## 0. Prerequisitos — Leer antes de tocar cualquier archivo

1. Leer `src/ARCHITECTURE.md` completo. **Si algún paso contradice ese archivo, la arquitectura manda.**
2. Leer `docs/DESIGN.md` (colores, spacing, cards, CTAs, responsive) y `docs/DECISIONS.md`.
3. Leer `docs/IMPLEMENTATION_PLAN_M6.md`, `M7.md` y `M8.md`: catálogo, detalle, carrito y checkout **YA están implementados**. Este milestone NO los rehace; los reutiliza y reconecta.
4. **`yawi_api` endpoints son de SOLO LECTURA.** No se crean ni modifican endpoints. Solo se modifica el **seeder** (`database.service.ts`) para agregar productos mock con tags que mapeen a las 6 categorías.
5. **Nunca** escribir hexadecimales de color en componentes. Solo tokens Tailwind del `@theme`.
6. `@/` alias activo. Usarlo en todos los imports nuevos.
7. Tests sin React (no hay RTL ni jsdom — Decisión #50). Solo lógica pura (Vitest node).
8. Al terminar ejecutar `npx tsc --noEmit`, `npx vitest run`, `npm run format:check`.

---

## 1. Contexto y objetivo

### 1.1 Problema actual

La página actual de "Explorar" (`/products` → `CatalogPage`) funciona como catálogo plano sin jerarquía de categorías. La arquitectura del sitio no refleja keywords transaccionales para SEO. La ruta raíz (`/`) carga una landing informacional que, si bien es útil para branding, no maximiza la intención de compra.

### 1.2 Objetivo del refactor

Transformar la arquitectura del sitio en un modelo **SEO transaccional** donde:

- La ruta raíz redirige a `/artesanias` (intención de compra).
- Cada categoría tiene su propia URL canónica (`/artesanias/:slug`).
- El usuario llega a un producto en **máximo 3 clics**: Artesanías → Categoría → Producto.
- Las secciones informacionales se mueven a `/cultura-yawi` (la landing original).
- El hero es **compacto** en todas las páginas transaccionales (estilo Amazon): el usuario ve productos/categorías inmediatamente sin scroll.

### 1.3 Lo que NO cambia

| Pieza                                                        | Estado                                      |
| ------------------------------------------------------------ | ------------------------------------------- |
| Landing original (contenido)                                 | ✅ Se mantiene íntegro, solo cambia de ruta |
| API endpoints (`GET /products`, `GET /products/:id`)         | ✅ Sin cambios                              |
| Lógica de negocio (carrito, checkout, órdenes)               | ✅ Sin cambios                              |
| Design system (colores, tipografía, spacing, componentes UI) | ✅ Sin cambios                              |
| Detalle de producto (`/products/:id`)                        | ✅ Sin cambios                              |
| Página de artesanos (`/artisans`)                            | ✅ Sin cambios                              |

---

## 2. Arquitectura de sitio: Antes vs Después

### 2.1 Mapa de rutas

| Ruta actual                 | Ruta nueva                           | Componente | Cambio                                                     |
| --------------------------- | ------------------------------------ | ---------- | ---------------------------------------------------------- |
| `/` → `LandingPage`         | `/` → **Redirect** a `/artesanias`   | —          | Redirect 302 con `<Navigate>`                              |
| —                           | `/artesanias` → `ArtesaniasPage`     | **Nuevo**  | Nueva landing transaccional                                |
| —                           | `/artesanias/:slug` → `CategoryPage` | **Nuevo**  | Página por categoría                                       |
| `/products` → `CatalogPage` | `/products` → `CatalogPage`          | Existente  | **Sin cambios** (ruta interna, queda como fallback/legacy) |
| —                           | `/cultura-yawi` → `LandingPage`      | Existente  | Solo cambio de ruta                                        |
| `/products/:id`             | `/products/:id`                      | Existente  | Sin cambios                                                |
| `/vender`                   | `/vender`                            | Existente  | Sin cambios                                                |
| `/artisans`                 | `/artisans`                          | Existente  | Sin cambios                                                |
| `/login`, `/register`       | `/login`, `/register`                | Existente  | Sin cambios                                                |

### 2.2 Navegación (NavLinks)

| Antes                       | Después                                    |
| --------------------------- | ------------------------------------------ |
| Inicio (`/`)                | **Artesanías** (`/artesanias`)             |
| Explorar (`/products`)      | **Cultura Yawi** (`/cultura-yawi`)         |
| Artesanos (`/artisans`)     | Artesanos (`/artisans`)                    |
| Sobre Yawi (`/#story`)      | **Eliminar** (redundante con Cultura Yawi) |
| Vender con Yawi (`/vender`) | Vender con Yawi (`/vender`)                |

### 2.3 Flujo de usuario (regla de 3 clics)

```
/artesanias (grid de categorías + productos destacados)
    ↓ clic en categoría
/artesanias/barro-ceramica (grid de productos de la categoría)
    ↓ clic en producto
/products/:id (detalle de producto — existente)
```

---

## 3. Categorías: Definición canónica

Las 6 categorías se definen como **dato estático** en `src/data/categories.ts` (nueva ubicación según ARCHITECTURE.md: "Static non-translation content").

Cada categoría mapea a un **slug de URL**, un **tag de filtrado** (que coincide con los tags de los productos en la DB), una **imagen** local, y **claves i18n**.

```ts
// src/data/categories.ts
export interface Category {
  id: string; // identificador interno
  slug: string; // URL slug → /artesanias/:slug
  tag: string; // tag para filtrar productos (coincide con product.tags[])
  image: string; // ruta en /images/
  titleKey: string; // clave i18n para el nombre
  descriptionKey: string; // clave i18n para descripción SEO
  order: number; // orden de presentación
}

export const CATEGORIES: Category[] = [
  {
    id: 'barro-ceramica',
    slug: 'barro-ceramica',
    tag: 'barro-ceramica',
    image: '/images/alfareria.webp',
    titleKey: 'artesanias.categories.barro_ceramica',
    descriptionKey: 'artesanias.categories.barro_ceramica_desc',
    order: 1,
  },
  {
    id: 'maderas',
    slug: 'maderas',
    tag: 'maderas',
    image: '/images/maderas.webp',
    titleKey: 'artesanias.categories.maderas',
    descriptionKey: 'artesanias.categories.maderas_desc',
    order: 2,
  },
  {
    id: 'textiles-tejidos',
    slug: 'textiles-tejidos',
    tag: 'textiles-tejidos',
    image: '/images/textiles.webp',
    titleKey: 'artesanias.categories.textiles_tejidos',
    descriptionKey: 'artesanias.categories.textiles_tejidos_desc',
    order: 3,
  },
  {
    id: 'joyeria',
    slug: 'joyeria',
    tag: 'joyeria',
    image: '/images/joyeria.webp',
    titleKey: 'artesanias.categories.joyeria',
    descriptionKey: 'artesanias.categories.joyeria_desc',
    order: 4,
  },
  {
    id: 'pinturas-arte',
    slug: 'pinturas-arte',
    tag: 'pinturas-arte',
    image: '/images/pinturas.webp',
    titleKey: 'artesanias.categories.pinturas_arte',
    descriptionKey: 'artesanias.categories.pinturas_arte_desc',
    order: 5,
  },
  {
    id: 'accesorios',
    slug: 'accesorios',
    tag: 'accesorios',
    image: '/images/accesorios.webp',
    titleKey: 'artesanias.categories.accesorios',
    descriptionKey: 'artesanias.categories.accesorios_desc',
    order: 6,
  },
];
```

### 3.1 Concordancia con Landing

Las categorías del landing (`features/landing/components/CategoriesSection`) deben actualizarse para usar los mismos nombres y el mismo orden que las transaccionales. No se cambia la estructura del landing, solo las labels i18n y el orden en `landing-images.json`.

**Actualizar `landing-images.json` categorías:**

```json
{
  "categories": [
    {
      "id": "barro-ceramica",
      "src": "/images/alfareria.webp",
      "titleKey": "categories.items.barro_ceramica"
    },
    { "id": "maderas", "src": "/images/maderas.webp", "titleKey": "categories.items.maderas" },
    {
      "id": "textiles-tejidos",
      "src": "/images/textiles.webp",
      "titleKey": "categories.items.textiles_tejidos"
    },
    { "id": "joyeria", "src": "/images/joyeria.webp", "titleKey": "categories.items.joyeria" },
    {
      "id": "pinturas-arte",
      "src": "/images/pinturas.webp",
      "titleKey": "categories.items.pinturas_arte"
    },
    {
      "id": "accesorios",
      "src": "/images/accesorios.webp",
      "titleKey": "categories.items.accesorios"
    }
  ]
}
```

**Actualizar `i18n/locales/{es,en}/landing.json`** keys de categorías:

```json
"categories": {
  "items": {
    "barro_ceramica": "Barro & Cerámica",
    "maderas": "Maderas",
    "textiles_tejidos": "Textiles & Tejidos",
    "joyeria": "Joyería",
    "pinturas_arte": "Pinturas y Arte",
    "accesorios": "Accesorios"
  }
}
```

Las `CategoryCard` del landing deben agregar un `onClick` que navegue a `/artesanias/:slug` usando `useNavigate`.

---

## 4. Nuevo feature: `artesanias`

### 4.1 Estructura de archivos

```
src/features/artesanias/
  components/
    ArtesaniasHeroBanner/
      ArtesaniasHeroBanner.tsx     ← Banner compacto (slim)
      index.ts
    CategoryGrid/
      CategoryGrid.tsx             ← Grid de 6 categorías clicables
      CategoryGridCard.tsx         ← Tarjeta individual de categoría
      index.ts
    CategoryHeroBanner/
      CategoryHeroBanner.tsx       ← Banner mínimo para página de categoría
      index.ts
    Breadcrumb/
      Breadcrumb.tsx               ← Breadcrumb reutilizable
      index.ts
    CategorySidebar/
      CategorySidebar.tsx          ← Links a otras categorías (subcategorías)
      index.ts
  hooks/
    useProductsByCategory.ts       ← Filtra productos por tag de categoría
  index.ts                         ← API pública del feature
```

### 4.2 Decisiones de diseño clave

| Decisión                                                       | Justificación                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hero compacto (slim banner, ~120px) en vez de hero full-screen | Estilo Amazon: el usuario ve categorías/productos sin scroll. Menos de 3 clics al producto. |
| Filtrado por tag en cliente (no nuevo endpoint)                | Reutiliza `GET /products` existente. Sin lógica nueva de negocio.                           |
| Categorías como dato estático en `src/data/`                   | No requiere endpoint. Escalable si se migra a API en el futuro.                             |
| Breadcrumb como componente del feature                         | Buena práctica SEO + UX. Solo necesario en páginas transaccionales.                         |
| Eliminar `CatalogCultureSection` de la página de artesanías    | Más espacio para productos. La cultura vive en `/cultura-yawi`.                             |

---

## 5. Componentes — Especificación detallada

### 5.1 `ArtesaniasHeroBanner` (banner compacto)

**Propósito:** Banner slim en la parte superior de `/artesanias`. NO es un hero full-screen. Contiene título SEO + barra de búsqueda inline.

**Diseño:**

```
┌─────────────────────────────────────────────────────────────────┐
│  bg-primary-navy, h-auto, py-6 sm:py-8                         │
│                                                                 │
│  [Sparkles icon] "Artesanías de Latinoamérica"    (h1, SEO)    │
│  "Encuentra piezas únicas hechas a mano"          (subtitle)   │
│  [═══════════ Buscar artesanías... ═══════════]   (search bar) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props:** `search: string`, `onSearchChange: (value: string) => void`

**Reglas:**

- Altura máxima: `py-6 sm:py-8` (compacto, no `py-16 md:py-24` como el hero actual).
- El `<h1>` contiene la keyword principal "Artesanías".
- La barra de búsqueda se reutiliza del componente `ProductSearchBar` existente (pasado como children o prop).
- Sin collage de imágenes, sin orbs decorativos grandes. Solo fondo `bg-primary-navy` con un gradiente sutil mínimo.
- Mobile: stack vertical, búsqueda ocupa ancho completo.

### 5.2 `CategoryGrid` + `CategoryGridCard`

**Propósito:** Grid de 6 tarjetas de categoría. Primer contenido visible tras el banner.

**Diseño:**

```
┌─────────────────────────────────────────────────────────────────┐
│  "Comprar por categoría"  (h2)                                  │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 📷       │ │ 📷       │ │ 📷       │ │ 📷       │          │
│  │ Barro &  │ │ Maderas  │ │ Textiles │ │ Joyería  │          │
│  │ Cerámica │ │          │ │ & Tejidos│ │          │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐                                     │
│  │ 📷       │ │ 📷       │                                     │
│  │ Pinturas │ │ Acceso-  │                                     │
│  │ y Arte   │ │ rios     │                                     │
│  └──────────┘ └──────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` (misma lógica que el landing).

**`CategoryGridCard` props:**

```ts
interface CategoryGridCardProps {
  imageSrc: string;
  title: string;
  slug: string;
  onClick: () => void;
}
```

**Comportamiento:**

- Clic → `navigate(`/artesanias/${slug}`)`.
- Reutiliza estilo visual del `CategoryCard` existente del landing (misma estética: imagen + overlay gradient + título en la base).
- Hover: `scale-105`, sombra elevada, texto cambia a `peach-accent`.

### 5.3 `CategoryHeroBanner` (banner mínimo para página de categoría)

**Propósito:** Banner mínimo en `/artesanias/:slug`. El usuario debe ver el grid de productos **inmediatamente**.

**Diseño:**

```
┌─────────────────────────────────────────────────────────────────┐
│  bg-primary-navy, py-4 sm:py-6                                  │
│                                                                 │
│  Artesanías > Barro & Cerámica           (Breadcrumb)          │
│  "Barro & Cerámica"                      (h1, keyword SEO)     │
│  "Piezas de cerámica y barro hechas a mano por artesanos..."   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Props:**

```ts
interface CategoryHeroBannerProps {
  title: string;
  description: string;
  breadcrumbItems: BreadcrumbItem[];
}
```

**Reglas:**

- Altura ultra-mínima: `py-4 sm:py-6`.
- Sin imagen de fondo (la imagen ya aparece en las tarjetas de categoría).
- Breadcrumb integrado en el banner.
- `<h1>` = nombre de la categoría (keyword transaccional).

### 5.4 `Breadcrumb`

**Propósito:** Navegación jerárquica para SEO y UX.

**Diseño:** `Artesanías > Barro & Cerámica` con separador `>` o `chevron-right`.

**Props:**

```ts
interface BreadcrumbItem {
  label: string;
  href?: string; // undefined = item actual (no clickeable)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
```

**Reglas:**

- Usa `<nav aria-label="Breadcrumb">` + `<ol>` para accesibilidad.
- Links con `<NavLink>` de react-router-dom.
- Último item sin link (texto actual).
- Texto en `text-white/70` para items con link, `text-white font-semibold` para el actual.

### 5.5 `CategorySidebar`

**Propósito:** Panel lateral (o strip horizontal en mobile) con links a las demás categorías.

**Diseño desktop:**

```
┌──────────────┐ ┌─────────────────────────────────────┐
│ Categorías   │ │                                     │
│              │ │  Grid de productos                   │
│ • Barro (✓)  │ │                                     │
│ • Maderas    │ │                                     │
│ • Textiles   │ │                                     │
│ • Joyería    │ │                                     │
│ • Pinturas   │ │                                     │
│ • Accesorios │ │                                     │
└──────────────┘ └─────────────────────────────────────┘
```

**Diseño mobile:** Strip horizontal scrollable con chips/pills de categorías.

**Props:**

```ts
interface CategorySidebarProps {
  categories: Category[];
  activeSlug: string;
}
```

**Reglas:**

- Desktop: `hidden lg:block`, sidebar fijo de ~220px.
- Mobile: `lg:hidden`, flex horizontal con `overflow-x-auto`, pills estilizados.
- Categoría activa: `bg-primary-indigo text-white` / inactiva: `bg-surface text-primary-text border-border`.
- Links con `<NavLink to={`/artesanias/${cat.slug}`}>`.

### 5.6 Hook: `useProductsByCategory`

**Propósito:** Reutiliza `useProducts()` existente y filtra por tag de categoría.

```ts
// src/features/artesanias/hooks/useProductsByCategory.ts
import { useMemo } from 'react';
import { useProducts } from '@/features/catalog';
import type { Product } from '@/types/product';

export function useProductsByCategory(categoryTag: string) {
  const query = useProducts();

  const filtered = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((p: Product) =>
      p.tags.some((tag) => tag.toLowerCase() === categoryTag.toLowerCase()),
    );
  }, [query.data, categoryTag]);

  return {
    ...query,
    data: filtered,
    allProducts: query.data,
  };
}
```

**Regla importante:** Este hook **NO crea un nuevo endpoint**. Reutiliza `useProducts()` (que ya llama a `GET /products`). TanStack Query cachea la respuesta, así que la navegación entre categorías no re-fetcha.

---

## 6. Páginas — Especificación

### 6.1 `ArtesaniasPage` (nueva)

**Ruta:** `/artesanias`
**Archivo:** `src/pages/ArtesaniasPage/ArtesaniasPage.tsx`

**Estructura:**

```tsx
export default function ArtesaniasPage() {
  // Reutiliza useProducts() del feature catalog
  // Estado local: search (string), tags (string[])

  return (
    <>
      {/* 1. Banner compacto con búsqueda */}
      <ArtesaniasHeroBanner
        search={filters.search}
        onSearchChange={...}
      />

      {/* 2. Grid de categorías — PRIMER contenido visible */}
      <CategoryGrid categories={CATEGORIES} />

      {/* 3. Productos destacados (condicional: solo si hay productos) */}
      <FeaturedProductsSection
        products={products}
        onViewProduct={handleViewProduct}
      />

      {/* 4. Búsqueda y filtros (sección de descubrimiento) */}
      <section id="artesanias-discovery">
        <ProductFilters ... />
        <ProductGrid ... />
      </section>

      {/* NO CatalogCultureSection — eliminada */}
    </>
  );
}
```

**SEO HTML:**

- `<h1>`: "Artesanías de Latinoamérica" (dentro del banner).
- `<h2>`: "Comprar por categoría" (en `CategoryGrid`).
- `<h2>`: "Productos Destacados" (en `FeaturedProductsSection`).
- Meta description vía `document.title` en `useEffect`:
  `"Compra artesanías hechas a mano: barro, cerámica, textiles, joyería, maderas y más. Directo de artesanos latinoamericanos."`.

### 6.2 `CategoryPage` (nueva)

**Ruta:** `/artesanias/:slug`
**Archivo:** `src/pages/CategoryPage/CategoryPage.tsx`

**Estructura:**

```tsx
export default function CategoryPage() {
  const { slug } = useParams();
  const category = CATEGORIES.find((c) => c.slug === slug);
  // Si no existe la categoría → 404 o redirect

  const { data: products, isLoading, isError, refetch } = useProductsByCategory(category.tag);

  return (
    <>
      {/* 1. Banner mínimo con breadcrumb */}
      <CategoryHeroBanner
        title={t(category.titleKey)}
        description={t(category.descriptionKey)}
        breadcrumbItems={[
          { label: t('artesanias.breadcrumb.home'), href: '/artesanias' },
          { label: t(category.titleKey) },
        ]}
      />

      {/* 2. Layout: Sidebar + Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar con otras categorías (desktop) */}
          <CategorySidebar categories={CATEGORIES} activeSlug={slug} />

          {/* Grid de productos */}
          <div className="flex-1">
            {/* Mobile: chips de categorías */}
            <CategorySidebar categories={CATEGORIES} activeSlug={slug} mobile />

            <ProductGrid
              products={products}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => void refetch()}
              onViewProduct={(id) => navigate(`/products/${id}`)}
            />
          </div>
        </div>
      </section>
    </>
  );
}
```

**SEO HTML:**

- `<h1>`: Nombre de la categoría (ej: "Barro & Cerámica").
- `document.title`: `"Barro & Cerámica — Artesanías | Yawi"`.
- Breadcrumb con datos estructurados implícitos via `aria-label`.

---

## 7. Cambios en archivos existentes

### 7.1 Rutas (`src/routes/index.tsx`)

```diff
+import { Navigate } from 'react-router-dom';

+const ArtesaniasPage = lazy(() => import('../pages/ArtesaniasPage/ArtesaniasPage'));
+const CategoryPage = lazy(() => import('../pages/CategoryPage/CategoryPage'));

 <Route element={<AppLayout />}>
-  <Route path="/" element={<LandingPage />} />
+  <Route path="/" element={<Navigate to="/artesanias" replace />} />
+  <Route path="/artesanias" element={<ArtesaniasPage />} />
+  <Route path="/artesanias/:slug" element={<CategoryPage />} />
+  <Route path="/cultura-yawi" element={<LandingPage />} />
   <Route path="/vender" element={<SellerLandingPage />} />
   <Route path="/artisans" element={<ArtisansPage />} />
   ...
 </Route>
```

> **Nota:** La ruta `/products` se mantiene como fallback. `CatalogPage` sigue existiendo y funcional. No se elimina.

### 7.2 Navegación (`src/components/layout/Navbar/NavLinks.tsx`)

```diff
 export const NAV_ITEMS: NavItem[] = [
-  { labelKey: 'home', href: '/', type: 'route' },
-  { labelKey: 'explore', href: '/products', type: 'route' },
+  { labelKey: 'artesanias', href: '/artesanias', type: 'route' },
+  { labelKey: 'cultura', href: '/cultura-yawi', type: 'route' },
   { labelKey: 'artisans', href: '/artisans', type: 'route' },
-  { labelKey: 'about', href: '/#story', type: 'hash' },
   { labelKey: 'sell', href: '/vender', type: 'route' },
 ];
```

### 7.3 i18n — Navegación (`i18n/locales/{es,en}/nav.json`)

**Español:**

```diff
-  "home": "Inicio",
-  "explore": "Explorar",
+  "artesanias": "Artesanías",
+  "cultura": "Cultura Yawi",
-  "about": "Sobre Yawi",
```

**Inglés:**

```diff
-  "home": "Home",
-  "explore": "Explore",
+  "artesanias": "Handicrafts",
+  "cultura": "Yawi Culture",
-  "about": "About Yawi",
```

### 7.4 i18n — Nuevo namespace `artesanias.json`

**Crear:** `i18n/locales/es/artesanias.json` y `i18n/locales/en/artesanias.json`

**Español (`es/artesanias.json`):**

```json
{
  "hero": {
    "title": "Artesanías de Latinoamérica",
    "subtitle": "Encuentra piezas únicas hechas a mano por artesanos de toda la región.",
    "search_placeholder": "Buscar artesanías..."
  },
  "categories": {
    "section_title": "Comprar por categoría",
    "barro_ceramica": "Barro & Cerámica",
    "barro_ceramica_desc": "Piezas de cerámica y barro hechas a mano con técnicas ancestrales por artesanos latinoamericanos.",
    "maderas": "Maderas",
    "maderas_desc": "Tallados, esculturas y objetos decorativos en maderas nobles trabajadas artesanalmente.",
    "textiles_tejidos": "Textiles & Tejidos",
    "textiles_tejidos_desc": "Hamacas, mantas, huipiles y tejidos elaborados con técnicas tradicionales transmitidas por generaciones.",
    "joyeria": "Joyería",
    "joyeria_desc": "Collares, pulseras, aretes y accesorios únicos creados con materiales autóctonos.",
    "pinturas_arte": "Pinturas y Arte",
    "pinturas_arte_desc": "Obras pictóricas y arte visual que capturan la identidad cultural latinoamericana.",
    "accesorios": "Accesorios",
    "accesorios_desc": "Bolsos, carteras, sombreros y complementos artesanales con identidad cultural."
  },
  "breadcrumb": {
    "home": "Artesanías"
  },
  "sidebar": {
    "title": "Categorías"
  },
  "empty": {
    "title": "Sin productos en esta categoría",
    "text": "Pronto agregaremos más productos. Explora otras categorías mientras tanto.",
    "cta": "Ver todas las artesanías"
  },
  "meta": {
    "home_title": "Artesanías de Latinoamérica | Yawi",
    "home_description": "Compra artesanías hechas a mano: barro, cerámica, textiles, joyería, maderas y más. Directo de artesanos latinoamericanos.",
    "category_title_suffix": "— Artesanías | Yawi"
  }
}
```

**Inglés (`en/artesanias.json`):** Mismo esquema traducido al inglés.

### 7.5 Registrar namespace i18n (`i18n/i18n.ts`)

Agregar `'artesanias'` al array de namespaces cargados:

```diff
 ns: ['common', 'nav', 'landing', 'seller', 'auth', 'catalog',
-     'artisans', 'cart', 'checkout', 'orders', 'footer'],
+     'artisans', 'cart', 'checkout', 'orders', 'footer', 'artesanias'],
```

### 7.6 Landing CategoriesSection — Agregar navegación

**Archivo:** `src/features/landing/components/CategoriesSection/CategoriesSection.tsx`

Agregar `onClick` a `CategoryCard` para navegar a `/artesanias/:slug`:

```diff
+import { useNavigate } from 'react-router-dom';
+import { CATEGORIES } from '@/data/categories';

 export const CategoriesSection: React.FC = () => {
+  const navigate = useNavigate();

   return (
     ...
     {categories.map((cat) => (
       <CategoryCard
         key={cat.id}
         imageSrc={cat.src}
         title={t(cat.titleKey)}
+        onClick={() => {
+          const category = CATEGORIES.find(c => c.id === cat.id);
+          if (category) navigate(`/artesanias/${category.slug}`);
+        }}
       />
     ))}
   );
 };
```

### 7.7 Landing CTA updates

**Archivo:** `src/features/landing/components/FinalCtaSection`

Actualizar el CTA "Explorar la galería" para apuntar a `/artesanias` en vez de `/products`:

```diff
-  href="/products"
+  href="/artesanias"
```

Revisar también `HeroSection` CTAs si apuntan a `/products`.

---

## 8. Cambios en backend — Solo seeder

### 8.1 Actualizar productos existentes

Modificar los tags de los 6 productos existentes en `database.service.ts` para que incluyan al menos un tag de las nuevas categorías:

```ts
const productsData = [
  {
    name: 'Juego de Sábanas King Size',
    price: 45.00,
    tags: ['textiles-tejidos', 'hogar', 'dormitorio'],      // ← añadido tag de categoría
    images_urls: ['/images/textiles.webp'],                   // ← imagen local
    ...
  },
  {
    name: 'Lámpara de Mesa LED',
    price: 22.50,
    tags: ['maderas', 'hogar', 'iluminación'],               // ← reclasificado
    images_urls: ['/images/maderas.webp'],
    ...
  },
  // ... etc
];
```

### 8.2 Agregar productos nuevos al seeder

Agregar **~12 productos nuevos** (2 por categoría) con imágenes existentes en `public/images/`. Los productos se asocian a los businesses ya creados por el seeder.

```ts
// Productos adicionales para cubrir las 6 categorías
const additionalProducts = [
  // Barro & Cerámica
  {
    name: 'Jarrón de barro artesanal',
    price: 28.0,
    tags: ['barro-ceramica', 'decoración'],
    images_urls: ['/images/alfareria.webp'],
    properties: { material: 'barro', origin: 'El Salvador' },
    business_id: createdBusinesses[0].id,
  },
  {
    name: 'Plato decorativo de cerámica pintada',
    price: 18.5,
    tags: ['barro-ceramica', 'decoración'],
    images_urls: ['/images/alfareria.webp'],
    properties: { material: 'cerámica', technique: 'pintado a mano' },
    business_id: createdBusinesses[0].id,
  },
  // Maderas
  {
    name: 'Máscara ceremonial tallada en madera',
    price: 55.0,
    tags: ['maderas', 'decoración', 'cultural'],
    images_urls: ['/images/maderas.webp'],
    properties: { wood: 'cedro', origin: 'Guatemala' },
    business_id: createdBusinesses[0].id,
  },
  {
    name: 'Cucharas artesanales de madera (set de 4)',
    price: 15.0,
    tags: ['maderas', 'cocina'],
    images_urls: ['/images/maderas.webp'],
    properties: { wood: 'palo blanco', pieces: 4 },
    business_id: createdBusinesses[1].id,
  },
  // Textiles & Tejidos
  {
    name: 'Hamaca de algodón tejida a mano',
    price: 75.0,
    tags: ['textiles-tejidos', 'hogar'],
    images_urls: ['/images/textiles.webp'],
    properties: { material: 'algodón', size: 'familiar' },
    business_id: createdBusinesses[1].id,
  },
  {
    name: 'Huipil bordado tradicional',
    price: 120.0,
    tags: ['textiles-tejidos', 'ropa', 'cultural'],
    images_urls: ['/images/textiles.webp'],
    properties: { origin: 'Guatemala', technique: 'telar de cintura' },
    business_id: createdBusinesses[2].id,
  },
  // Joyería
  {
    name: 'Collar de jade guatemalteco',
    price: 85.0,
    tags: ['joyeria', 'piedras'],
    images_urls: ['/images/joyeria.webp'],
    properties: { stone: 'jade', origin: 'Guatemala' },
    business_id: createdBusinesses[2].id,
  },
  {
    name: 'Aretes de semillas naturales',
    price: 12.0,
    tags: ['joyeria', 'semillas'],
    images_urls: ['/images/joyeria.webp'],
    properties: { material: 'semillas de tagua', origin: 'Ecuador' },
    business_id: createdBusinesses[2].id,
  },
  // Pinturas y Arte
  {
    name: 'Cuadro naif de pueblo salvadoreño',
    price: 95.0,
    tags: ['pinturas-arte', 'cuadros'],
    images_urls: ['/images/pinturas.webp'],
    properties: { technique: 'acrílico sobre lienzo', size: '40x60cm' },
    business_id: createdBusinesses[0].id,
  },
  {
    name: 'Miniatura pintada en madera',
    price: 22.0,
    tags: ['pinturas-arte', 'decoración'],
    images_urls: ['/images/pinturas.webp'],
    properties: { technique: 'óleo', size: '10x15cm' },
    business_id: createdBusinesses[1].id,
  },
  // Accesorios
  {
    name: 'Bolso de henequén tejido',
    price: 35.0,
    tags: ['accesorios', 'bolsos'],
    images_urls: ['/images/accesorios.webp'],
    properties: { material: 'henequén', origin: 'El Salvador' },
    business_id: createdBusinesses[2].id,
  },
  {
    name: 'Sombrero de palma artesanal',
    price: 20.0,
    tags: ['accesorios', 'sombreros'],
    images_urls: ['/images/accesorios.webp'],
    properties: { material: 'palma', origin: 'El Salvador' },
    business_id: createdBusinesses[0].id,
  },
];
```

> **Nota:** Las `images_urls` usan rutas locales de `public/images/`. Estas imágenes ya existen en el repositorio. El frontend las renderiza correctamente porque `resolveImageUrl` ya las maneja.

### 8.3 Importante — No alterar lógica de negocio del seeder

- Los productos nuevos se insertan **después** de los existentes, usando el mismo patrón `productRepo.create(pData) → save`.
- No se modifican las entidades, DTOs ni controladores.
- Los orders existentes del seed siguen referenciando los mismos productos originales.

---

## 9. Actualización de tests

### 9.1 Tests que pueden romperse

| Test                             | Razón                                  | Acción                           |
| -------------------------------- | -------------------------------------- | -------------------------------- |
| Tests de NavLinks (si existen)   | `NAV_ITEMS` cambió                     | Actualizar assertions            |
| Tests de rutas (si existen)      | Ruta `/` ya no renderiza `LandingPage` | Actualizar para esperar redirect |
| `products.service.test.ts`       | Sin cambios en la lógica               | **No tocar**                     |
| `products.api.test.ts`           | Sin cambios en la API                  | **No tocar**                     |
| Tests de componentes del landing | Labels de categorías cambiaron         | Actualizar keys i18n en mocks    |

### 9.2 Tests nuevos recomendados

| Test                            | Qué valida                                                        |
| ------------------------------- | ----------------------------------------------------------------- |
| `useProductsByCategory.test.ts` | Filtra correctamente por tag, retorna vacío si no hay match       |
| `categories.test.ts`            | Todos los slugs son únicos, todos tienen imagen, orden secuencial |

**`useProductsByCategory.test.ts`** (lógica pura, sin React):

```ts
// Simplemente testear la lógica de filtrado
import { describe, it, expect } from 'vitest';
import type { Product } from '@/types/product';

function filterByCategory(products: Product[], tag: string): Product[] {
  return products.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
}

describe('filterByCategory', () => {
  const products: Product[] = [
    {
      id: '1',
      businessId: 'b1',
      name: 'Jarrón',
      tags: ['barro-ceramica'],
      imageUrls: [],
      price: 28,
    },
    {
      id: '2',
      businessId: 'b1',
      name: 'Hamaca',
      tags: ['textiles-tejidos'],
      imageUrls: [],
      price: 75,
    },
    {
      id: '3',
      businessId: 'b1',
      name: 'Plato',
      tags: ['barro-ceramica', 'decoración'],
      imageUrls: [],
      price: 18,
    },
  ];

  it('filtra por tag de categoría', () => {
    expect(filterByCategory(products, 'barro-ceramica')).toHaveLength(2);
  });

  it('retorna vacío si no hay match', () => {
    expect(filterByCategory(products, 'joyeria')).toHaveLength(0);
  });

  it('es case-insensitive', () => {
    expect(filterByCategory(products, 'Barro-Ceramica')).toHaveLength(2);
  });
});
```

---

## 10. Feature public API (`index.ts`)

```ts
// src/features/artesanias/index.ts

// Componentes
export { ArtesaniasHeroBanner } from './components/ArtesaniasHeroBanner';
export { CategoryGrid } from './components/CategoryGrid';
export { CategoryGridCard } from './components/CategoryGrid/CategoryGridCard';
export { CategoryHeroBanner } from './components/CategoryHeroBanner';
export { Breadcrumb } from './components/Breadcrumb';
export { CategorySidebar } from './components/CategorySidebar';

// Hooks
export { useProductsByCategory } from './hooks/useProductsByCategory';
```

---

## 11. Documentación a actualizar

### 11.1 `src/pages/README.md`

Agregar:

```markdown
- `ArtesaniasPage/`: Página principal transaccional (`/artesanias`) que muestra categorías de artesanías y productos destacados. Nueva landing por defecto del sitio (usa `AppLayout`).
- `CategoryPage/`: Página de categoría individual (`/artesanias/:slug`) que muestra productos filtrados por categoría con sidebar de navegación (usa `AppLayout`).
```

Actualizar la entrada de LandingPage:

```diff
-  - `LandingPage/`: Página de inicio que orquesta...
+  - `LandingPage/`: Página cultural (`/cultura-yawi`, antes `/`) que orquesta...
```

### 11.2 `src/features/` — Nuevo README

Crear `src/features/artesanias/README.md`:

```markdown
# Feature: Artesanías

## Propósito

Página principal transaccional del sitio y páginas de categoría individual.
Rutas: `/artesanias` (landing SEO) y `/artesanias/:slug` (categoría).

## Estructura

- `components/` — ArtesaniasHeroBanner, CategoryGrid, CategoryGridCard,
  CategoryHeroBanner, Breadcrumb, CategorySidebar.
- `hooks/` — useProductsByCategory (filtra productos por tag de categoría).
- `index.ts` — API pública del feature.

## Dependencias

- `@/data/categories` — Definición estática de las 6 categorías.
- `@/features/catalog` — useProducts (reutilizado para datos de productos).
- `@/components/common` — ProductCard.
- `@/types/product` — Product.
```

### 11.3 `src/routes/README.md`

Documentar el redirect de `/` y las nuevas rutas.

### 11.4 `yawi_frontend/README.md`

Agregar nota sobre la arquitectura SEO transaccional y las rutas principales.

---

## 12. Orden de implementación (paso a paso)

### Fase 1: Datos y configuración (sin UI)

| #   | Tarea                                               | Archivo(s)                        |
| --- | --------------------------------------------------- | --------------------------------- |
| 1.1 | Crear `src/data/categories.ts`                      | Nuevo                             |
| 1.2 | Crear i18n `artesanias.json` (es + en)              | Nuevo (×2)                        |
| 1.3 | Registrar namespace en `i18n.ts`                    | Modificar                         |
| 1.4 | Actualizar i18n `nav.json` (es + en)                | Modificar (×2)                    |
| 1.5 | Actualizar i18n `landing.json` categorías (es + en) | Modificar (×2)                    |
| 1.6 | Actualizar `landing-images.json` (orden + ids)      | Modificar                         |
| 1.7 | Actualizar seeder con tags + productos nuevos       | Modificar (`database.service.ts`) |
| 1.8 | Verificar: `npx tsc --noEmit` pasa                  | —                                 |

### Fase 2: Feature artesanias — Componentes

| #    | Tarea                                      | Archivo(s) |
| ---- | ------------------------------------------ | ---------- |
| 2.1  | Crear `Breadcrumb` componente              | Nuevo      |
| 2.2  | Crear `ArtesaniasHeroBanner` componente    | Nuevo      |
| 2.3  | Crear `CategoryGridCard` componente        | Nuevo      |
| 2.4  | Crear `CategoryGrid` componente            | Nuevo      |
| 2.5  | Crear `CategoryHeroBanner` componente      | Nuevo      |
| 2.6  | Crear `CategorySidebar` componente         | Nuevo      |
| 2.7  | Crear hook `useProductsByCategory`         | Nuevo      |
| 2.8  | Crear test `useProductsByCategory.test.ts` | Nuevo      |
| 2.9  | Crear `index.ts` del feature               | Nuevo      |
| 2.10 | Crear `README.md` del feature              | Nuevo      |

### Fase 3: Páginas y rutas

| #   | Tarea                                                                       | Archivo(s) |
| --- | --------------------------------------------------------------------------- | ---------- |
| 3.1 | Crear `ArtesaniasPage/ArtesaniasPage.tsx` + `index.ts`                      | Nuevo      |
| 3.2 | Crear `CategoryPage/CategoryPage.tsx` + `index.ts`                          | Nuevo      |
| 3.3 | Actualizar `routes/index.tsx` (redirect `/`, nuevas rutas, `/cultura-yawi`) | Modificar  |
| 3.4 | Actualizar `NavLinks.tsx` (NAV_ITEMS)                                       | Modificar  |
| 3.5 | Verificar: `npx tsc --noEmit` pasa                                          | —          |

### Fase 4: Integración y landing updates

| #   | Tarea                                                           | Archivo(s)             |
| --- | --------------------------------------------------------------- | ---------------------- |
| 4.1 | Actualizar `CategoriesSection` del landing (onClick → navigate) | Modificar              |
| 4.2 | Actualizar `FinalCtaSection` CTA href                           | Modificar              |
| 4.3 | Revisar `HeroSection` CTAs (si apuntan a `/products`)           | Modificar si necesario |
| 4.4 | Actualizar `CatalogHero` CTA secundario si apunta a `/`         | Verificar              |

### Fase 5: Tests y documentación

| #   | Tarea                                                | Archivo(s) |
| --- | ---------------------------------------------------- | ---------- |
| 5.1 | Actualizar tests de NavLinks si existen              | Modificar  |
| 5.2 | Actualizar tests de rutas si existen                 | Modificar  |
| 5.3 | Ejecutar `npx vitest run` — corregir cualquier fallo | —          |
| 5.4 | Actualizar `src/pages/README.md`                     | Modificar  |
| 5.5 | Actualizar `src/routes/README.md`                    | Modificar  |
| 5.6 | Actualizar `yawi_frontend/README.md`                 | Modificar  |

### Fase 6: Validación final

| #   | Tarea                                                                 |
| --- | --------------------------------------------------------------------- |
| 6.1 | `npx tsc --noEmit` — sin errores de tipos                             |
| 6.2 | `npx vitest run` — todos los tests pasan                              |
| 6.3 | `npm run format:check` (y `format` si falla)                          |
| 6.4 | Verificar mobile-first: probar en viewport 375px                      |
| 6.5 | Verificar flujo de 3 clics: `/artesanias` → categoría → producto      |
| 6.6 | Verificar que `/cultura-yawi` carga el landing original correctamente |
| 6.7 | Verificar que `/products` sigue funcionando (legacy)                  |
| 6.8 | Verificar que el carrito/checkout no se rompió                        |

---

## 13. Checklist de aceptación

- [ ] `/` redirige a `/artesanias`
- [ ] `/artesanias` muestra banner compacto + grid de 6 categorías + productos destacados + búsqueda
- [ ] `/artesanias/:slug` muestra banner mínimo + breadcrumb + sidebar + productos filtrados
- [ ] `/cultura-yawi` carga el landing original sin cambios visuales
- [ ] `/products` sigue funcionando (legacy, no roto)
- [ ] `/products/:id` sigue funcionando
- [ ] Navegación actualizada: Artesanías, Cultura Yawi, Artesanos, Vender con Yawi
- [ ] Categorías del landing coinciden con las transaccionales (nombres y orden)
- [ ] Clic en categoría del landing navega a `/artesanias/:slug`
- [ ] Seeder genera productos con tags de las 6 categorías
- [ ] Imágenes locales de `public/images/` se renderizan correctamente
- [ ] Breadcrumbs visibles y funcionales en páginas de categoría
- [ ] Mobile-first: diseño responsive en 375px
- [ ] `<h1>` único y con keyword transaccional en cada página
- [ ] i18n completo: español e inglés
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npx vitest run` todos pasan
- [ ] Carrito, checkout y órdenes no afectados
- [ ] READMEs actualizados

---

## 14. Resumen de archivos afectados

### Archivos nuevos (~20)

| Archivo                                                                            | Tipo            |
| ---------------------------------------------------------------------------------- | --------------- |
| `src/data/categories.ts`                                                           | Datos estáticos |
| `src/features/artesanias/index.ts`                                                 | Feature API     |
| `src/features/artesanias/README.md`                                                | Documentación   |
| `src/features/artesanias/hooks/useProductsByCategory.ts`                           | Hook            |
| `src/features/artesanias/components/ArtesaniasHeroBanner/ArtesaniasHeroBanner.tsx` | Componente      |
| `src/features/artesanias/components/ArtesaniasHeroBanner/index.ts`                 | Barrel          |
| `src/features/artesanias/components/CategoryGrid/CategoryGrid.tsx`                 | Componente      |
| `src/features/artesanias/components/CategoryGrid/CategoryGridCard.tsx`             | Componente      |
| `src/features/artesanias/components/CategoryGrid/index.ts`                         | Barrel          |
| `src/features/artesanias/components/CategoryHeroBanner/CategoryHeroBanner.tsx`     | Componente      |
| `src/features/artesanias/components/CategoryHeroBanner/index.ts`                   | Barrel          |
| `src/features/artesanias/components/Breadcrumb/Breadcrumb.tsx`                     | Componente      |
| `src/features/artesanias/components/Breadcrumb/index.ts`                           | Barrel          |
| `src/features/artesanias/components/CategorySidebar/CategorySidebar.tsx`           | Componente      |
| `src/features/artesanias/components/CategorySidebar/index.ts`                      | Barrel          |
| `src/pages/ArtesaniasPage/ArtesaniasPage.tsx`                                      | Página          |
| `src/pages/ArtesaniasPage/index.ts`                                                | Barrel          |
| `src/pages/CategoryPage/CategoryPage.tsx`                                          | Página          |
| `src/pages/CategoryPage/index.ts`                                                  | Barrel          |
| `src/i18n/locales/es/artesanias.json`                                              | Traducción      |
| `src/i18n/locales/en/artesanias.json`                                              | Traducción      |

### Archivos modificados (~12)

| Archivo                                                                   | Cambio                                      |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| `src/routes/index.tsx`                                                    | Redirect `/`, nuevas rutas, `/cultura-yawi` |
| `src/components/layout/Navbar/NavLinks.tsx`                               | `NAV_ITEMS` actualizado                     |
| `src/i18n/locales/es/nav.json`                                            | Keys renombradas                            |
| `src/i18n/locales/en/nav.json`                                            | Keys renombradas                            |
| `src/i18n/locales/es/landing.json`                                        | Categorías renombradas                      |
| `src/i18n/locales/en/landing.json`                                        | Categorías renombradas                      |
| `src/i18n/i18n.ts`                                                        | Namespace `artesanias` registrado           |
| `src/features/landing/landing-images.json`                                | IDs y orden de categorías                   |
| `src/features/landing/components/CategoriesSection/CategoriesSection.tsx` | onClick navega a categoría                  |
| `src/features/landing/components/FinalCtaSection/FinalCtaSection.tsx`     | CTA href actualizado                        |
| `src/pages/README.md`                                                     | Documentación actualizada                   |
| `yawi_api/src/database/database.service.ts`                               | Productos mock con tags de categorías       |
