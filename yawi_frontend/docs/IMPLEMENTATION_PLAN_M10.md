# IMPLEMENTATION PLAN — Milestone 10: Página de Resultados de Búsqueda (`/buscar`)

> **Redactado por**: Arquitecto Senior Frontend / SEO
> **Implementador objetivo**: Agente IA
> **Fecha**: 2026-10-27
> **Rama sugerida**: `feature/m10-search-results`
> **Estado**: Pendiente de aprobación

---

## 0. Prerequisitos — Leer antes de tocar cualquier archivo

1. Leer `src/ARCHITECTURE.md` completo. **Si algún paso contradice ese archivo, la arquitectura manda.**
2. Leer `docs/DESIGN.md` (colores, spacing, cards, CTAs, responsive) y `docs/DECISIONS.md`.
3. Leer `docs/IMPLEMENTATION_PLAN_M9.md`: la estructura de `ArtesaniasPage`, `CategoryPage`, el feature `artesanias`, el hook `useProducts`, el servicio `filterProducts` y el componente `ArtesaniasHeroBanner` **YA están implementados**. Este milestone los reutiliza y extiende.
4. **`yawi_api` endpoints son de SOLO LECTURA.** No se crean ni modifican endpoints. El filtrado es completamente client-side usando `GET /products` (ya cacheado por TanStack Query).
5. **Nunca** escribir hexadecimales de color en componentes. Solo tokens Tailwind del `@theme`.
6. `@/` alias activo. Usarlo en todos los imports nuevos.
7. Tests sin React (no hay RTL ni jsdom — Decisión #50). Solo lógica pura (Vitest node).
8. Al terminar ejecutar `npx tsc --noEmit`, `npx vitest run`, `npm run format:check`.

---

## 1. Contexto y objetivo

### 1.1 Problema actual

El search bar del banner compacto de `/artesanias` (`ArtesaniasHeroBanner`) actualmente actualiza un estado local con debounce y filtra productos en la misma página. Este comportamiento es útil para exploración casual, pero no da al usuario una **URL compartible** con sus resultados, no aprovecha las buenas prácticas SEO para páginas de búsqueda, y no es un destino navegable desde el historial del navegador.

### 1.2 Objetivo del milestone

Crear la página `/buscar?q=<term>` que:

- Recibe el término de búsqueda como query param (`?q=`).
- Filtra todos los productos con la función `filterProducts()` ya existente (client-side, sin nuevo endpoint).
- Muestra los resultados usando `ProductGrid` existente.
- Presenta un estado vacío informativo con sugerencias de categorías y CTA, estilo AWS/Amazon.
- Reutiliza `ArtesaniasHeroBanner` (pre-poblado con la query activa) para consistencia estética.
- Incluye breadcrumb: `Artesanías > Resultados para "query"`.
- Es mobile-first, accesible, con SEO correcto (`<title>` dinámico, `<h1>` único).

### 1.3 Punto de entrada al flujo

El único punto de acceso nuevo es el search bar del banner en `/artesanias`: al presionar **Enter** o hacer **clic en el ícono de lupa**, el usuario navega a `/buscar?q=<term>` en lugar de filtrar in-page.

### 1.4 Lo que NO cambia

| Pieza                                                 | Estado                                                 |
| ----------------------------------------------------- | ------------------------------------------------------ |
| API endpoints (`GET /products`, `GET /products/:id`)  | ✅ Sin cambios                                         |
| Lógica de `filterProducts()` en `products.service.ts` | ✅ Sin cambios                                         |
| `useProducts()` hook y su caché TanStack Query        | ✅ Sin cambios                                         |
| `ProductGrid`, `ProductCard`, `ProductFilters`        | ✅ Sin cambios                                         |
| `CategoryPage` (`/artesanias/:slug`)                  | ✅ Sin cambios                                         |
| `ArtesaniasPage` — filtrado in-page con debounce      | ✅ Se mantiene; solo se agrega el submit de navegación |
| Design system (colores, tipografía, spacing)          | ✅ Sin cambios                                         |
| Carrito, checkout, órdenes                            | ✅ Sin cambios                                         |

---

## 2. Arquitectura de la nueva ruta

### 2.1 Mapa de rutas — cambio

| Ruta actual    | Estado                             | Componente          |
| -------------- | ---------------------------------- | ------------------- |
| `/buscar`      | **Nueva**                          | `SearchResultsPage` |
| `/artesanias`  | Existente, modificada (submit nav) | `ArtesaniasPage`    |
| Resto de rutas | Sin cambios                        | —                   |

### 2.2 Flujo de usuario

```
/artesanias (ArtesaniasPage)
    ↓ Enter / clic lupa en ArtesaniasHeroBanner
/buscar?q=barro (SearchResultsPage)
    ↓ clic en producto
/products/:id (detalle — existente)
```

---

## 3. Modificación de `ArtesaniasHeroBanner`

### 3.1 Cambio requerido

El componente `ArtesaniasHeroBanner` acepta actualmente:

```ts
export interface ArtesaniasHeroBannerProps {
  search: string;
  onSearchChange: (value: string) => void;
}
```

Se extiende con un prop opcional `onSubmit`:

```ts
export interface ArtesaniasHeroBannerProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** Cuando se define, Enter y clic en lupa llaman a este callback en vez de solo actualizar el estado. */
  onSubmit?: (query: string) => void;
}
```

### 3.2 Lógica de submit

El `<input>` se envuelve en un `<form>` para capturar `onSubmit` nativo:

```tsx
<form
  role="search"
  onSubmit={(e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(innerValue.trim());
  }}
>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Search className="w-4 h-4 text-primary-navy/60" />
    </div>
    <input
      id="artesanias-hero-search"
      type="search"
      value={innerValue}
      onChange={(e) => setInnerValue(e.target.value)}
      placeholder={t('hero.search_placeholder')}
      className="..."
    />
    {/* Botón de lupa visible solo cuando onSubmit está definido */}
    {onSubmit && (
      <button
        type="submit"
        aria-label={t('hero.search_aria_submit')}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary-navy/60 hover:text-primary-navy transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    )}
  </div>
</form>
```

**Reglas:**

- El debounce interno **solo** se activa cuando `onSubmit` no está definido (comportamiento actual de filtrado in-page).
- Cuando `onSubmit` está definido, el debounce no navega; solo actualiza `innerValue` visualmente. La navegación ocurre en `form.onSubmit`.
- El botón de submit solo se renderiza cuando `onSubmit` está definido (en `ArtesaniasPage` no aparece; en `SearchResultsPage` sí).

### 3.3 Uso en `ArtesaniasPage` (modificación mínima)

```tsx
// ArtesaniasPage.tsx
<ArtesaniasHeroBanner
  search={filters.search}
  onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
  onSubmit={(query) => navigate(`/buscar?q=${encodeURIComponent(query)}`)}
/>
```

> **Nota:** Al definir `onSubmit`, el Enter en el banner de `/artesanias` navega a `/buscar`. El filtrado in-page debounced se desactiva para el campo del banner; los tags y filtros de la sección `#artesanias-discovery` siguen funcionando igual.

---

## 4. Nueva página: `SearchResultsPage`

### 4.1 Estructura de archivos

```
src/pages/SearchResultsPage/
  SearchResultsPage.tsx   ← Página (default export, lazy)
  index.ts                ← export { default } from './SearchResultsPage'
```

No se crea ningún componente nuevo de UI específico de esta página. Todo se reutiliza de features existentes.

### 4.2 Diseño

```
┌─────────────────────────────────────────────────────────────────┐
│  bg-primary-navy, py-6 sm:py-8  (ArtesaniasHeroBanner)         │
│                                                                 │
│  [✨] Artesanías de Latinoamérica  (badge)                      │
│  Artesanías de Latinoamérica       (h1)                        │
│  [══════════ "barro" ══ 🔍 ]       (search pre-poblado)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  bg-background, py-10 md:py-14                                  │
│                                                                 │
│  Artesanías > Resultados para "barro"  (Breadcrumb)            │
│  h2: Resultados para "barro"  ·  3 productos encontrados       │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Producto │ │ Producto │ │ Producto │    (ProductGrid)        │
│  └──────────┘ └──────────┘ └──────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Estado vacío (estilo AWS/Amazon):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Artesanías > Resultados para "xyz"  (Breadcrumb)              │
│                                                                 │
│         [🔍 ícono grande]                                       │
│  No se encontraron resultados para "xyz"   (h3)                │
│  Intenta con otras palabras o explora nuestras categorías.     │
│                                                                 │
│  Categorías sugeridas:                                          │
│  [Barro & Cerámica]  [Maderas]  [Textiles]  [Joyería] ...     │
│                                                                 │
│       [  Ver todas las artesanías  ]  (CTA primario)          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Implementación de `SearchResultsPage`

```tsx
// src/pages/SearchResultsPage/SearchResultsPage.tsx

import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';
import { useProducts, ProductGrid } from '@/features/catalog';
import { ArtesaniasHeroBanner, Breadcrumb } from '@/features/artesanias';
import { CATEGORIES } from '@/data/categories';
import { filterProducts } from '@/services/products.service';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Button } from '@/components/ui';
import type { ProductFilters } from '@/types/product';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const navigate = useNavigate();
  const { t } = useTranslation('artesanias');
  const { data: allProducts = [], isLoading, isError, error, refetch } = useProducts();

  // SEO: título dinámico
  useEffect(() => {
    document.title = query ? t('search.meta_title', { query }) : t('search.meta_title_empty');
  }, [query, t]);

  useErrorToast(isError, error, t('search.error'));

  const filters: ProductFilters = useMemo(() => ({ search: query, tags: [] }), [query]);
  const results = useMemo(() => filterProducts(allProducts, filters), [allProducts, filters]);

  const handleSearchChange = (value: string) => {
    // Actualiza el query param mientras el usuario escribe (replace, no push)
    setSearchParams({ q: value }, { replace: true });
  };

  const handleSubmit = (newQuery: string) => {
    navigate(`/buscar?q=${encodeURIComponent(newQuery)}`);
  };

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/artesanias' },
    { label: t('search.breadcrumb_label', { query }) },
  ];

  return (
    <>
      {/* 1. Banner compacto reutilizado — search pre-poblado */}
      <ArtesaniasHeroBanner
        search={query}
        onSearchChange={handleSearchChange}
        onSubmit={handleSubmit}
      />

      {/* 2. Contenido principal */}
      <section
        id="search-results"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14"
      >
        {/* Breadcrumb semántico */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Encabezado de resultados */}
        <div className="mt-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-navy">
            {t('search.heading', { query })}
          </h2>
          {!isLoading && !isError && (
            <p className="mt-1 text-sm text-muted-text">
              {results.length === 1
                ? t('search.count_one', { count: results.length })
                : t('search.count_other', { count: results.length })}
            </p>
          )}
        </div>

        {/* Grid o estado vacío */}
        {!isLoading && !isError && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-soft-lavender/30 flex items-center justify-center text-primary-navy">
              <SearchX className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-primary-navy">
                {t('search.empty_title', { query })}
              </h3>
              <p className="text-sm text-muted-text">{t('search.empty_text')}</p>
            </div>

            {/* Sugerencias de categorías */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary-navy">
                {t('search.suggestions_label')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/artesanias/${cat.slug}`}
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-primary-navy/30 text-primary-navy hover:bg-primary-navy hover:text-white transition-all duration-200"
                  >
                    {t(`categories.${cat.id.replace(/-/g, '_')}`)}
                  </Link>
                ))}
              </div>
            </div>

            <Button variant="primary" size="md" onClick={() => navigate('/artesanias')}>
              {t('search.empty_cta')}
            </Button>
          </div>
        ) : (
          <ProductGrid
            products={results}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onViewProduct={(id) => navigate(`/products/${id}`)}
          />
        )}
      </section>
    </>
  );
}
```

**Reglas de la página:**

- `<h2>` = "Resultados para `{query}`" — el `<h1>` lo hereda de `ArtesaniasHeroBanner` (ya lo implementa internamente con `t('hero.title')`).
- Usa `useSearchParams` de react-router-dom para leer y actualizar `?q=` sin re-montar la página.
- No importa desde `api/` ni `lib/`. Todo a través de `features/catalog` y `services/products.service`.
- Mobile-first: el grid colapsa a 1 columna en móvil, el estado vacío es vertical y centrado.
- El componente tiene máximo ~90 líneas — dentro del límite de 150 de la arquitectura.

---

## 5. Claves i18n — Extensión de `artesanias.json`

Agregar la sección `search` a **ambos** archivos de locale. No se crea un namespace nuevo.

### 5.1 Español (`i18n/locales/es/artesanias.json`)

Agregar en la raíz del JSON:

```json
"search": {
  "meta_title": "Resultados para \"{{query}}\" — Artesanías | Yawi",
  "meta_title_empty": "Búsqueda — Artesanías | Yawi",
  "breadcrumb_label": "Resultados para \"{{query}}\"",
  "heading": "Resultados para \"{{query}}\"",
  "count_one": "{{count}} producto encontrado",
  "count_other": "{{count}} productos encontrados",
  "empty_title": "No se encontraron resultados para \"{{query}}\"",
  "empty_text": "Intenta con otras palabras o explora nuestras categorías de artesanías.",
  "suggestions_label": "Categorías sugeridas",
  "empty_cta": "Ver todas las artesanías",
  "error": "No se pudieron cargar los productos. Por favor intenta de nuevo."
}
```

Agregar dentro de la sección `"hero"` existente:

```json
"search_aria_submit": "Buscar"
```

### 5.2 Inglés (`i18n/locales/en/artesanias.json`)

Agregar en la raíz del JSON:

```json
"search": {
  "meta_title": "Results for \"{{query}}\" — Handicrafts | Yawi",
  "meta_title_empty": "Search — Handicrafts | Yawi",
  "breadcrumb_label": "Results for \"{{query}}\"",
  "heading": "Results for \"{{query}}\"",
  "count_one": "{{count}} product found",
  "count_other": "{{count}} products found",
  "empty_title": "No results found for \"{{query}}\"",
  "empty_text": "Try different words or explore our handicraft categories.",
  "suggestions_label": "Suggested categories",
  "empty_cta": "View all handicrafts",
  "error": "Could not load products. Please try again."
}
```

Agregar dentro de la sección `"hero"` existente:

```json
"search_aria_submit": "Search"
```

---

## 6. Registro de la nueva ruta

### 6.1 `src/routes/index.tsx`

```diff
 const CategoryPage = lazy(() => import('../pages/CategoryPage/CategoryPage'));
+const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage/SearchResultsPage'));

 <Route element={<AppLayout />}>
   <Route path="/" element={<Navigate to="/artesanias" replace />} />
   <Route path="/artesanias" element={<ArtesaniasPage />} />
   <Route path="/artesanias/:slug" element={<CategoryPage />} />
+  <Route path="/buscar" element={<SearchResultsPage />} />
   <Route path="/cultura-yawi" element={<LandingPage />} />
   ...
 </Route>
```

> **Nota:** La ruta `/buscar` va dentro del bloque `<Route element={<AppLayout />}>` — hereda Navbar y Footer. No requiere autenticación.

---

## 7. Cambios en archivos existentes

### 7.1 `ArtesaniasHeroBanner.tsx`

| Cambio                                   | Descripción                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Extender `ArtesaniasHeroBannerProps`     | Agregar `onSubmit?: (query: string) => void`                                                    |
| Envolver input en `<form role="search">` | Captura Enter nativo del navegador                                                              |
| Botón de submit condicional              | `{onSubmit && <button type="submit" ...>}`                                                      |
| Desactivar debounce-navigate             | El `useEffect` de debounce solo llama `onSearchChange`; la navegación ocurre en `form.onSubmit` |
| Backward compatible                      | Sin `onSubmit` el comportamiento actual es idéntico                                             |

### 7.2 `ArtesaniasPage.tsx`

```diff
 <ArtesaniasHeroBanner
   search={filters.search}
   onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
+  onSubmit={(query) => navigate(`/buscar?q=${encodeURIComponent(query)}`)}
 />
```

`useNavigate` ya está importado en `ArtesaniasPage.tsx` (implementación del M9 ✅).

---

## 8. SEO

| Elemento                     | Valor                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| `document.title`             | `Resultados para "{query}" — Artesanías \| Yawi`                   |
| `<h1>`                       | Heredado de `ArtesaniasHeroBanner` ("Artesanías de Latinoamérica") |
| `<h2>`                       | `Resultados para "{query}"` — keyword contextual                   |
| URL canónica                 | `/buscar?q={term}` — compartible, historizable                     |
| Breadcrumb                   | `<nav aria-label="Breadcrumb">` + `<ol>` — semántico               |
| `<form role="search">`       | Marca semántica para crawlers                                      |
| `aria-label` en botón submit | `t('hero.search_aria_submit')`                                     |

---

## 9. Tests

### 9.1 Tests que pueden romperse

| Test                                         | Razón                           | Acción                                                                                     |
| -------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Tests de `ArtesaniasHeroBanner` (si existen) | Firma de props cambió           | `onSubmit` es opcional → backward compatible; actualizar mocks si los tests validan el DOM |
| Tests de rutas (si existen)                  | Nueva ruta `/buscar` registrada | Agregar cobertura si aplica                                                                |
| `useProductsByCategory.test.ts`              | Sin cambios                     | **No tocar**                                                                               |
| `products.service.test.ts`                   | Sin cambios                     | **No tocar**                                                                               |

### 9.2 Test nuevo — Lógica pura de búsqueda en contexto de SearchResultsPage

Crear `src/services/products.service.search.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { filterProducts } from '@/services/products.service';
import type { Product } from '@/types/product';

const mockProducts: Product[] = [
  {
    id: '1',
    businessId: 'b1',
    name: 'Jarrón de barro artesanal',
    tags: ['barro-ceramica'],
    imageUrls: [],
    price: 28,
  },
  {
    id: '2',
    businessId: 'b1',
    name: 'Hamaca de algodón tejida',
    tags: ['textiles-tejidos'],
    imageUrls: [],
    price: 75,
  },
  {
    id: '3',
    businessId: 'b1',
    name: 'Collar de jade guatemalteco',
    tags: ['joyeria', 'barro-ceramica'],
    imageUrls: [],
    price: 85,
  },
];

describe('filterProducts — uso desde SearchResultsPage (sin tags seleccionados)', () => {
  it('retorna todos los productos cuando query está vacía', () => {
    expect(filterProducts(mockProducts, { search: '', tags: [] })).toHaveLength(3);
  });

  it('filtra por coincidencia parcial en nombre (case-insensitive)', () => {
    const results = filterProducts(mockProducts, { search: 'JARRÓN', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('filtra por coincidencia en tag', () => {
    const results = filterProducts(mockProducts, { search: 'joyeria', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });

  it('encuentra productos que coinciden por nombre O por tag', () => {
    // "barro" aparece en nombre de producto '1' y en tag de '3'
    const results = filterProducts(mockProducts, { search: 'barro', tags: [] });
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('retorna lista vacía cuando no hay ninguna coincidencia', () => {
    expect(filterProducts(mockProducts, { search: 'xyznotfound', tags: [] })).toHaveLength(0);
  });

  it('la query con espacios al inicio/fin no rompe el filtrado', () => {
    const results = filterProducts(mockProducts, { search: '  hamaca  ', tags: [] });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });
});
```

> **Nota:** `filterProducts` es lógica pura sin React. El test corre en modo node (Vitest) sin jsdom.

### 9.3 Tabla de tests por fase

| Test                               | Tipo               | Archivo                           | Estado               |
| ---------------------------------- | ------------------ | --------------------------------- | -------------------- |
| `filterProducts` — búsqueda global | Lógica pura Vitest | `products.service.search.test.ts` | **Nuevo**            |
| Rutas (si hay test suite de rutas) | —                  | Existente                         | Actualizar si aplica |

---

## 10. Documentación a actualizar

### 10.1 `src/pages/README.md`

Agregar:

```markdown
- `SearchResultsPage/`: Página de resultados de búsqueda global (`/buscar?q=<term>`).
  Filtra todos los productos client-side con `filterProducts()`. Reutiliza
  `ArtesaniasHeroBanner` (pre-poblado), `ProductGrid` y `Breadcrumb`. No requiere
  autenticación. Sin nuevo endpoint de backend.
```

### 10.2 `src/routes/README.md`

Documentar la nueva ruta `/buscar` y la convención de `?q=` como query param compartible.

---

## 11. Orden de implementación (paso a paso)

### Fase 1: i18n (sin UI)

| #   | Tarea                                                     | Archivo(s) |
| --- | --------------------------------------------------------- | ---------- |
| 1.1 | Agregar sección `"search"` a `es/artesanias.json`         | Modificar  |
| 1.2 | Agregar sección `"search"` a `en/artesanias.json`         | Modificar  |
| 1.3 | Agregar clave `"hero.search_aria_submit"` a ambos locales | Modificar  |
| 1.4 | Verificar: `npx tsc --noEmit` pasa                        | —          |

### Fase 2: Modificar `ArtesaniasHeroBanner`

| #   | Tarea                                                                     | Archivo(s) |
| --- | ------------------------------------------------------------------------- | ---------- |
| 2.1 | Extender interfaz con `onSubmit?: (query: string) => void`                | Modificar  |
| 2.2 | Envolver `<input>` en `<form role="search" onSubmit={...}>`               | Modificar  |
| 2.3 | Agregar botón submit condicional con `aria-label`                         | Modificar  |
| 2.4 | Ajustar lógica de debounce: separar navegación de actualización de estado | Modificar  |
| 2.5 | Verificar: `npx tsc --noEmit` pasa                                        | —          |

### Fase 3: Página y ruta

| #   | Tarea                                                                | Archivo(s) |
| --- | -------------------------------------------------------------------- | ---------- |
| 3.1 | Crear `SearchResultsPage/SearchResultsPage.tsx`                      | Nuevo      |
| 3.2 | Crear `SearchResultsPage/index.ts`                                   | Nuevo      |
| 3.3 | Registrar ruta `/buscar` en `routes/index.tsx` (lazy import + Route) | Modificar  |
| 3.4 | Verificar: `npx tsc --noEmit` pasa                                   | —          |

### Fase 4: Conectar punto de entrada

| #   | Tarea                                                                                  | Archivo(s) |
| --- | -------------------------------------------------------------------------------------- | ---------- |
| 4.1 | Pasar `onSubmit` al `ArtesaniasHeroBanner` en `ArtesaniasPage.tsx`                     | Modificar  |
| 4.2 | Verificar flujo: escribir en banner → Enter → `/buscar?q=...` con resultados correctos | —          |

### Fase 5: Tests y documentación

| #   | Tarea                                                | Archivo(s) |
| --- | ---------------------------------------------------- | ---------- |
| 5.1 | Crear `src/services/products.service.search.test.ts` | Nuevo      |
| 5.2 | Ejecutar `npx vitest run` — corregir cualquier fallo | —          |
| 5.3 | Actualizar `src/pages/README.md`                     | Modificar  |
| 5.4 | Actualizar `src/routes/README.md`                    | Modificar  |

### Fase 6: Validación final

| #   | Tarea                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------- |
| 6.1 | `npx tsc --noEmit` — sin errores de tipos                                                                |
| 6.2 | `npx vitest run` — todos los tests pasan                                                                 |
| 6.3 | `npm run format:check` (y `format` si falla)                                                             |
| 6.4 | Verificar mobile-first: viewport 375px (estado vacío + grid)                                             |
| 6.5 | Flujo completo: `/artesanias` → Enter en search → `/buscar?q=barro` → clic en producto → `/products/:id` |
| 6.6 | Estado vacío: buscar `xyznotfound` → ver estado vacío con categorías sugeridas y CTA                     |
| 6.7 | URL compartible: copiar `/buscar?q=barro`, abrir en nueva pestaña → resultados correctos                 |
| 6.8 | Verificar que `/artesanias/:slug` sigue funcionando (CategoryPage sin cambios)                           |
| 6.9 | Verificar que el carrito / checkout no se rompió                                                         |

---

## 12. Checklist de aceptación

- [ ] `/buscar?q=<term>` muestra resultados filtrados de todos los productos
- [ ] `/buscar?q=` (vacío) muestra todos los productos
- [ ] Enter en el search bar de `/artesanias` navega a `/buscar?q=...`
- [ ] Clic en el ícono de lupa del banner de `/artesanias` navega a `/buscar?q=...`
- [ ] El search bar en `/buscar` se pre-popula con el `?q=` activo
- [ ] Escribir en el search bar de `/buscar` actualiza `?q=` en la URL (replace, no push)
- [ ] Breadcrumb: `Artesanías > Resultados para "query"` visible y funcional
- [ ] `<h2>` dice `Resultados para "query"` con conteo de resultados debajo
- [ ] Estado vacío: ícono + título + texto + chips de categorías + CTA
- [ ] Clic en chip de categoría navega a `/artesanias/:slug`
- [ ] CTA "Ver todas las artesanías" navega a `/artesanias`
- [ ] Estado de carga: skeletons de `ProductGrid` mientras `useProducts()` carga
- [ ] Estado de error: botón de reintento de `ProductGrid`
- [ ] `document.title` dinámico: `Resultados para "barro" — Artesanías | Yawi`
- [ ] Sin hardcoding de strings visibles al usuario (todo en i18n)
- [ ] Mobile-first: responsive en 375px
- [ ] i18n completo: español e inglés para todas las claves nuevas
- [ ] `ArtesaniasHeroBanner` backward compatible (sin `onSubmit` funciona igual que antes)
- [ ] `CategoryPage` y su filtrado interno no se ven afectados
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npx vitest run` todos pasan
- [ ] Carrito, checkout y órdenes no afectados
- [ ] READMEs actualizados

---

## 13. Resumen de archivos afectados

### Archivos nuevos (~3)

| Archivo                                             | Tipo             |
| --------------------------------------------------- | ---------------- |
| `src/pages/SearchResultsPage/SearchResultsPage.tsx` | Página           |
| `src/pages/SearchResultsPage/index.ts`              | Barrel           |
| `src/services/products.service.search.test.ts`      | Test lógica pura |

### Archivos modificados (~6)

| Archivo                                                                            | Cambio                                                             |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/features/artesanias/components/ArtesaniasHeroBanner/ArtesaniasHeroBanner.tsx` | `onSubmit?` prop, `<form role="search">`, botón submit condicional |
| `src/pages/ArtesaniasPage/ArtesaniasPage.tsx`                                      | Pasar `onSubmit` al banner                                         |
| `src/routes/index.tsx`                                                             | Lazy import + `<Route path="/buscar">`                             |
| `src/i18n/locales/es/artesanias.json`                                              | Sección `search` + `hero.search_aria_submit`                       |
| `src/i18n/locales/en/artesanias.json`                                              | Sección `search` + `hero.search_aria_submit`                       |
| `src/pages/README.md`                                                              | Documentar `SearchResultsPage`                                     |
