# IMPLEMENTATION PLAN — Milestone 5: Artisans Page

> **Redactado por**: Arquitecto Senior (rol de planificación)  
> **Implementador objetivo**: Agente IA nivel junior  
> **Fecha**: 2026-10-08  
> **Rama sugerida**: `feature/m5-artisans-page`

---

## 0. Prerequisitos — Leer antes de tocar cualquier archivo

1. Leer `src/ARCHITECTURE.md` completo. Si algún paso del plan contradice algo de ese archivo, **el archivo de arquitectura manda y debes pausar para consultar**.
2. Leer `docs/DESIGN.md` completo.
3. Leer `docs/DECISIONS.md` completo para entender decisiones previas.
4. **Nunca** escribir hexadecimales de color directamente en componentes. Usar siempre tokens de Tailwind (`text-primary-navy`, `bg-soft-lavender`, etc.) o variables CSS (`var(--color-primary-navy)`).
5. Después de completar la implementación ejecutar `npm run format:check` y si falla ejecutar `npm run format`. **No ejecutar** `npm run lint`.
6. El `@/` alias **ya está activo** desde M2. Usarlo en todos los imports nuevos (ej. `@/components/ui`, `@/features/artisans`).

---

## 1. Contexto y objetivos

### Qué se construye

Una página pública `/artisans` que permite a compradores internacionales explorar los negocios registrados en Yawi, conocer a los artesanos detrás de ellos, y navegar al perfil de detalle de cada negocio (`/artisans/:id`).

### API disponible (solo lectura)

| Endpoint              | Método | Descripción                                                                                         |
| --------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `GET /businesses`     | GET    | Lista todos los negocios. Soporta `?name=`, `?owner_id=`. Incluye `owner` (Vendor) en la respuesta. |
| `GET /businesses/:id` | GET    | Detalle de un negocio con su `owner`.                                                               |

**URL base de la API**: `http://localhost:3000` (o la que esté definida en `VITE_API_URL`).

### Entidades relevantes de la API

```ts
// Business (lo que retorna la API)
{
  id: string;             // UUID
  name: string;
  description: string;
  address: string;        // dirección completa del negocio
  imagesUrls: string[] | null;  // máximo 4 imágenes
  owner_id: string;
  owner: Vendor;          // incluido en GET /businesses y GET /businesses/:id
  createdAt: Date;
  updatedAt: Date;
}

// Vendor (owner, dentro del Business)
{
  id: string;
  name: string;           // primer nombre
  surname: string;        // primer apellido
  lastname?: string;      // segundo nombre (opcional)
  second_lastname?: string;
  country: string;
  // SENSIBLES — NUNCA exponer: username, password, DUI, NIT, birthdate, personal_address, phone_numbers
}
```

### Datos NO disponibles en la API (no inventar ni asumir)

- Valoraciones / ratings
- Categorías del negocio
- Número de ventas / métricas comerciales
- Productos individuales
- Dirección personal del artesano

---

## 2. Decisiones arquitectónicas de este Milestone

Documentar en `docs/DECISIONS.md` al final (sección M5):

| #   | Decisión                            | Opciones                                       | Elección                                     | Justificación                                                                                                     |
| --- | ----------------------------------- | ---------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 26  | Librería de server state            | useState+fetch, TanStack Query, mock           | **TanStack Query** (`@tanstack/react-query`) | Primer milestone con API real. Arquitectura lo requiere explícitamente.                                           |
| 27  | Búsqueda y filtrado por país/nombre | Filtrado en API, filtrado en cliente           | **Filtrado en cliente**                      | La API no soporta búsqueda por nombre de artesano ni filtro por país directamente. Toda la lista cabe en memoria. |
| 28  | Exposición de datos del Vendor      | Pasar objeto completo, tipo `PublicVendor`     | **`PublicVendor`** en el servicio            | Evitar filtros ad-hoc por componente. El servicio es la única fuente que conoce qué campos son públicos.          |
| 29  | Parámetro de ruta de detalle        | UUID, slug                                     | **UUID** del business                        | Directo al endpoint existente `GET /businesses/:id`, sin resolver slugs.                                          |
| 30  | Ruta URL                            | `/artisanos`, `/artisans`                      | **`/artisans`**                              | Consistente con la clave `artisans` del `nav.json`.                                                               |
| 31  | Namespace i18n                      | `landing.json`, nuevo `artisans.json`          | **`artisans.json`** (en/es)                  | Separación limpia de dominios. Consistente con decisión #11.                                                      |
| 32  | Ubicación resumida del negocio      | Dir. completa, solo país, truncar primera coma | **Truncar en primera coma**                  | Muestra parte útil sin revelar dirección completa. Lógica en `utils/formatAddress.ts`.                            |
| 33  | Enlace "Artisans" en Navbar         | Hash link, ruta real                           | **Ruta real `/artisans`**                    | Página real requiere `NavLink` con `type: 'route'` para marcar activo correctamente.                              |

---

## 3. Estructura de archivos a crear

```
src/
├── lib/
│   └── queryClient.ts                    ← NUEVO: configuración de TanStack Query
│
├── types/
│   └── artisan.ts                        ← NUEVO: BusinessDto, Business (dominio), PublicVendor
│
├── api/
│   └── artisans.api.ts                   ← NUEVO: getBusinesses(), getBusinessById()
│
├── services/
│   ├── artisans.service.ts               ← NUEVO: mapeo DTO→dominio, sanitización de datos
│   └── artisans.service.test.ts          ← NUEVO: tests del servicio
│
├── utils/
│   └── formatAddress.ts                  ← NUEVO: truncar dirección por primera coma
│
├── features/
│   └── artisans/                         ← NUEVO: vertical slice completo
│       ├── components/
│       │   ├── ArtisansHero/
│       │   │   ├── ArtisansHero.tsx
│       │   │   └── index.ts
│       │   ├── ArtisansSearchBar/
│       │   │   ├── ArtisansSearchBar.tsx
│       │   │   └── index.ts
│       │   ├── ArtisansFilters/
│       │   │   ├── ArtisansFilters.tsx
│       │   │   └── index.ts
│       │   ├── BusinessCard/
│       │   │   ├── BusinessCard.tsx
│       │   │   ├── BusinessCard.test.tsx
│       │   │   └── index.ts
│       │   ├── BusinessGrid/
│       │   │   ├── BusinessGrid.tsx
│       │   │   └── index.ts
│       │   ├── FeaturedArtisansSection/
│       │   │   ├── FeaturedArtisansSection.tsx
│       │   │   └── index.ts
│       │   ├── ArtisansCultureSection/
│       │   │   ├── ArtisansCultureSection.tsx
│       │   │   └── index.ts
│       │   ├── BusinessDetailHero/
│       │   │   ├── BusinessDetailHero.tsx
│       │   │   └── index.ts
│       │   ├── BusinessGallery/
│       │   │   ├── BusinessGallery.tsx
│       │   │   └── index.ts
│       │   ├── ArtisanProfile/
│       │   │   ├── ArtisanProfile.tsx
│       │   │   └── index.ts
│       │   └── BusinessImpact/
│       │       ├── BusinessImpact.tsx
│       │       └── index.ts
│       ├── hooks/
│       │   ├── useBusinesses.ts          ← TanStack Query: lista completa
│       │   └── useBusinessDetail.ts      ← TanStack Query: detalle por ID
│       ├── types.ts                      ← tipos locales del feature (filtros UI, etc.)
│       ├── index.ts                      ← API pública del feature
│       └── README.md                     ← obligatorio
│
├── pages/
│   ├── ArtisansPage/
│   │   ├── ArtisansPage.tsx             ← NUEVO: composición de secciones
│   │   └── index.ts
│   └── BusinessDetailPage/
│       ├── BusinessDetailPage.tsx        ← NUEVO: detalle por UUID
│       └── index.ts
│
├── i18n/
│   └── locales/
│       ├── en/
│       │   └── artisans.json            ← NUEVO
│       └── es/
│           └── artisans.json            ← NUEVO
```

### Archivos a modificar (nunca reemplazar, solo editar puntualmente)

| Archivo                                     | Cambio                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/main.tsx`                              | Envolver `<App>` en `<QueryClientProvider>`                                             |
| `src/i18n/i18n.ts`                          | Importar y registrar `artisans.json` (en y es)                                          |
| `src/routes/index.tsx`                      | Agregar rutas `/artisans` y `/artisans/:id` dentro de `<Route element={<AppLayout />}>` |
| `src/components/layout/Navbar/NavLinks.tsx` | Cambiar el item `artisans` de `type: 'hash'` a `type: 'route'` con `href: '/artisans'`  |

---

## 4. Pasos de implementación (orden estricto)

> **Regla**: Completar cada paso y verificar que compila antes de avanzar al siguiente.

---

### Paso 1 — Instalar TanStack Query

```bash
npm install @tanstack/react-query
```

Verificar que se agregó a `dependencies` en `package.json`.

---

### Paso 2 — Configurar QueryClient (`src/lib/queryClient.ts`)

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
    },
  },
});
```

> **Nota**: `src/lib/` solo contenía un `.gitkeep`. Ahora tiene contenido real.

---

### Paso 3 — Envolver App en QueryClientProvider (`src/main.tsx`)

Modificar `src/main.tsx` para importar `QueryClientProvider` y `queryClient`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Envolver <App /> con <QueryClientProvider client={queryClient}>
```

**Importante**: No eliminar el `BrowserRouter`, `I18nextProvider` ni ningún otro provider existente. Solo agregar el nuevo envolviendo o dentro de la jerarquía existente.

---

### Paso 4 — Tipos de dominio (`src/types/artisan.ts`)

Crear los tipos que representan los datos tal como vienen de la API (DTO) y el modelo seguro para la UI:

```ts
/**
 * Datos del Vendor expuestos públicamente.
 * NUNCA incluir: username, password, DUI, NIT, birthdate, personal_address.
 */
export interface PublicVendor {
  id: string;
  name: string;
  surname: string;
  lastname?: string;
  second_lastname?: string;
  country: string;
}

/**
 * Modelo de dominio del Business para la UI.
 */
export interface Business {
  id: string;
  name: string;
  description: string;
  address: string; // dirección completa del negocio
  locationSummary: string; // dirección truncada (primera parte antes de la coma)
  imagesUrls: string[]; // nunca null en el modelo UI (array vacío si no tiene)
  owner: PublicVendor;
  joinedAt: Date; // derivado de createdAt
}

/**
 * DTO crudo que retorna la API (NO usar directamente en componentes).
 */
export interface BusinessDto {
  id: string;
  name: string;
  description: string;
  address: string;
  imagesUrls: string[] | null;
  owner_id: string;
  owner: {
    id: string;
    username: string; // sensible — ignorar
    password: string; // sensible — ignorar
    name: string;
    surname: string;
    lastname?: string;
    second_lastname?: string;
    birthdate: string; // sensible — ignorar
    country: string;
    personal_address: string; // sensible — ignorar
    DUI: string; // sensible — ignorar
    NIT: string; // sensible — ignorar
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

### Paso 5 — API layer (`src/api/artisans.api.ts`)

Regla: **Solo llamadas HTTP aquí. Sin React. Sin mapping. Sin lógica.**

```ts
import type { BusinessDto } from '@/types/artisan';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function getBusinesses(): Promise<BusinessDto[]> {
  const res = await fetch(`${API_BASE}/businesses`);
  if (!res.ok) throw new Error(`Error fetching businesses: ${res.status}`);
  return res.json() as Promise<BusinessDto[]>;
}

export async function getBusinessById(id: string): Promise<BusinessDto> {
  const res = await fetch(`${API_BASE}/businesses/${id}`);
  if (!res.ok) throw new Error(`Error fetching business ${id}: ${res.status}`);
  return res.json() as Promise<BusinessDto>;
}
```

> **Nota sobre env**: La variable `VITE_API_URL` debe añadirse a `.env.example` con el valor `http://localhost:3000`. No agregarla a `.env.local` directamente (ese archivo está en `.gitignore`).

---

### Paso 6 — Utilidad de formato de dirección (`src/utils/formatAddress.ts`)

```ts
/**
 * Retorna el primer segmento de la dirección hasta la primera coma.
 * Si no hay coma, retorna la dirección completa.
 *
 * @example
 * formatAddress('Av. Independencia #456, Centro Histórico, San Salvador')
 * // → 'Av. Independencia #456'
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  const firstComma = address.indexOf(',');
  if (firstComma === -1) return address.trim();
  return address.slice(0, firstComma).trim();
}
```

Crear también `src/utils/formatAddress.test.ts` con casos:

- Dirección con múltiples comas → retorna solo primer segmento.
- Dirección sin comas → retorna la dirección completa.
- Cadena vacía → retorna cadena vacía.

---

### Paso 7 — Servicio de dominio (`src/services/artisans.service.ts`)

Aquí se mapea el DTO al modelo de dominio y se sanean los datos sensibles.

```ts
import { getBusinesses, getBusinessById } from '@/api/artisans.api';
import { formatAddress } from '@/utils/formatAddress';
import type { Business, BusinessDto, PublicVendor } from '@/types/artisan';

function mapVendorToPublic(raw: BusinessDto['owner']): PublicVendor {
  return {
    id: raw.id,
    name: raw.name,
    surname: raw.surname,
    lastname: raw.lastname,
    second_lastname: raw.second_lastname,
    country: raw.country,
    // Los campos sensibles (username, password, DUI, NIT, birthdate, personal_address) son omitidos aquí.
  };
}

function mapBusinessDtoToDomain(dto: BusinessDto): Business {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    address: dto.address,
    locationSummary: formatAddress(dto.address),
    imagesUrls: dto.imagesUrls ?? [],
    owner: mapVendorToPublic(dto.owner),
    joinedAt: new Date(dto.createdAt),
  };
}

export async function fetchBusinesses(): Promise<Business[]> {
  const dtos = await getBusinesses();
  return dtos.map(mapBusinessDtoToDomain);
}

export async function fetchBusinessById(id: string): Promise<Business> {
  const dto = await getBusinessById(id);
  return mapBusinessDtoToDomain(dto);
}
```

---

### Paso 8 — Tests del servicio (`src/services/artisans.service.test.ts`)

Escribir tests unitarios en Vitest para el servicio. Mockear las funciones de `@/api/artisans.api`.

**Casos a cubrir obligatoriamente**:

1. `fetchBusinesses` retorna array vacío cuando la API retorna `[]`.
2. `fetchBusinesses` mapea correctamente un DTO completo a un `Business` válido:
   - `imagesUrls: null` en el DTO → `imagesUrls: []` en el dominio.
   - `createdAt` se convierte correctamente a `Date`.
   - `locationSummary` es el primer segmento antes de la primera coma.
3. `fetchBusinessById` mapea un DTO individual correctamente.
4. Los campos sensibles del vendor (`username`, `password`, `DUI`, `NIT`, `birthdate`, `personal_address`) **no aparecen** en el resultado del servicio.

**Estructura sugerida**:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock('@/api/artisans.api', () => ({ getBusinesses: vi.fn(), getBusinessById: vi.fn() }));

function buildBusinessDto(overrides = {}): BusinessDto {
  return {
    id: 'test-uuid',
    name: 'Test Business',
    description: 'A description',
    address: 'Calle 1, Colonia 2, San Salvador',
    imagesUrls: null,
    owner_id: 'vendor-uuid',
    owner: {
      id: 'vendor-uuid',
      username: 'secret_user',
      password: 'hashed_pass',
      name: 'Carlos',
      surname: 'Martínez',
      birthdate: '1988-04-12',
      country: 'El Salvador',
      personal_address: 'Dirección privada',
      DUI: '01234567-8',
      NIT: '0614-120488-101-5',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}
```

---

### Paso 9 — Traducciones i18n

#### `src/i18n/locales/en/artisans.json`

```json
{
  "hero": {
    "badge": "Meet the Artisans",
    "title": "Handcrafted with Purpose",
    "subtitle": "Discover the entrepreneurs and artisans behind each piece. Every business has a story worth knowing.",
    "cta_primary": "Explore artisans",
    "cta_secondary": "Learn about Yawi"
  },
  "search": {
    "placeholder": "Search by business or artisan name...",
    "label": "Search artisans"
  },
  "filters": {
    "title": "Filter by country",
    "all": "All countries",
    "el_salvador": "El Salvador",
    "guatemala": "Guatemala (coming soon)",
    "honduras": "Honduras (coming soon)"
  },
  "grid": {
    "loading": "Loading artisans...",
    "empty": "No artisans found with those criteria.",
    "error": "We couldn't load the artisans. Please try again.",
    "retry": "Retry"
  },
  "card": {
    "joined": "Member since",
    "view_profile": "View profile",
    "artisan_label": "Artisan",
    "location_label": "Location"
  },
  "featured": {
    "title": "Featured Artisans",
    "subtitle": "A selection of inspiring creators who represent the best of Latin American craftsmanship."
  },
  "culture": {
    "title": "Countries in Yawi",
    "subtitle": "We are building a community of artisans across Latin America.",
    "active_label": "Active",
    "coming_soon": "Coming soon"
  },
  "detail": {
    "back": "Back to artisans",
    "gallery_title": "Gallery",
    "meet_artisan": "Meet the artisan",
    "country_label": "Country",
    "member_since": "Member since",
    "impact_title": "Why supporting this business matters",
    "impact_text": "By purchasing from {{name}}, you directly support a Latin American artisan, helping preserve cultural traditions and creating fair economic opportunities for their community.",
    "no_images": "This business has not uploaded images yet.",
    "loading": "Loading business details...",
    "error": "We couldn't load the business information.",
    "not_found": "Business not found."
  }
}
```

#### `src/i18n/locales/es/artisans.json`

```json
{
  "hero": {
    "badge": "Conoce a los Artesanos",
    "title": "Hecho a Mano con Propósito",
    "subtitle": "Descubre los emprendedores y artesanos detrás de cada pieza. Cada negocio tiene una historia que vale la pena conocer.",
    "cta_primary": "Explorar artesanos",
    "cta_secondary": "Conocer Yawi"
  },
  "search": {
    "placeholder": "Buscar por nombre del negocio o artesano...",
    "label": "Buscar artesanos"
  },
  "filters": {
    "title": "Filtrar por país",
    "all": "Todos los países",
    "el_salvador": "El Salvador",
    "guatemala": "Guatemala (próximamente)",
    "honduras": "Honduras (próximamente)"
  },
  "grid": {
    "loading": "Cargando artesanos...",
    "empty": "No se encontraron artesanos con esos criterios.",
    "error": "No pudimos cargar los artesanos. Por favor intenta de nuevo.",
    "retry": "Reintentar"
  },
  "card": {
    "joined": "Miembro desde",
    "view_profile": "Ver perfil",
    "artisan_label": "Artesano",
    "location_label": "Ubicación"
  },
  "featured": {
    "title": "Artesanos Destacados",
    "subtitle": "Una selección de creadores inspiradores que representan lo mejor de la artesanía latinoamericana."
  },
  "culture": {
    "title": "Países en Yawi",
    "subtitle": "Estamos construyendo una comunidad de artesanos en toda Latinoamérica.",
    "active_label": "Activo",
    "coming_soon": "Próximamente"
  },
  "detail": {
    "back": "Volver a artesanos",
    "gallery_title": "Galería",
    "meet_artisan": "Conoce al artesano",
    "country_label": "País",
    "member_since": "Miembro desde",
    "impact_title": "Por qué importa apoyar este negocio",
    "impact_text": "Al comprar en {{name}}, apoyas directamente a un artesano latinoamericano, ayudando a preservar tradiciones culturales y creando oportunidades económicas justas para su comunidad.",
    "no_images": "Este negocio aún no ha subido imágenes.",
    "loading": "Cargando detalles del negocio...",
    "error": "No pudimos cargar la información del negocio.",
    "not_found": "Negocio no encontrado."
  }
}
```

---

### Paso 10 — Registrar traducciones en i18n (`src/i18n/i18n.ts`)

Agregar al archivo existente (sin modificar las importaciones ya existentes):

```ts
// Agregar imports:
import esArtisans from './locales/es/artisans.json';
import enArtisans from './locales/en/artisans.json';

// Dentro del objeto resources, agregar la clave artisans:
// es: { ..., artisans: esArtisans }
// en: { ..., artisans: enArtisans }
```

---

### Paso 11 — Hooks de TanStack Query

#### `src/features/artisans/hooks/useBusinesses.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchBusinesses } from '@/services/artisans.service';

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  });
}
```

#### `src/features/artisans/hooks/useBusinessDetail.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchBusinessById } from '@/services/artisans.service';

export function useBusinessDetail(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => fetchBusinessById(id),
    enabled: Boolean(id),
  });
}
```

---

### Paso 12 — Tipos locales del feature (`src/features/artisans/types.ts`)

```ts
/**
 * Estado de los filtros activos en la página de artesanos.
 */
export interface ArtisanFilters {
  search: string;
  country: string; // '' = todos
}

/**
 * Países disponibles con su estado.
 */
export interface CountryFilterOption {
  value: string;
  labelKey: string; // clave i18n en namespace 'artisans'
  available: boolean; // false = "próximamente"
}

/**
 * Datos estáticos de los filtros de país disponibles.
 */
export const COUNTRY_FILTERS: CountryFilterOption[] = [
  { value: '', labelKey: 'filters.all', available: true },
  { value: 'El Salvador', labelKey: 'filters.el_salvador', available: true },
  { value: 'Guatemala', labelKey: 'filters.guatemala', available: false },
  { value: 'Honduras', labelKey: 'filters.honduras', available: false },
];
```

---

### Paso 13 — Componentes del feature

> **Regla de componentes**: Máximo ~150 líneas por archivo. Si un componente crece, extraer subcomponentes.  
> **Regla de imports**: Nunca importar desde `api/` o `lib/`. Solo recibir datos por props o usar hooks del propio feature.

#### 13.1 — `ArtisansHero`

**Props**: ninguna (obtiene traducciones de i18n internamente)

**Diseño** (según `DESIGN.md`):

- Fondo con gradiente navy → indigo con orbs decorativos de blur (igual estilo que `SellerLandingPage`).
- Lado izquierdo (40%): `Badge` variant `accent` con texto del badge, `<h1>` grande (el componente es un hero), subtítulo, dos `Button` (primary y secondary).
- Lado derecho (60%, solo desktop): composición visual decorativa (gradiente, formas suaves, o patrón de imágenes placeholder).
- Mobile: layout en columna única. El visual se muestra después del texto.
- CTA primario: hace scroll a la sección de discovery (`#artisans-discovery`).
- CTA secundario: navega a `/#story` (Acerca de Yawi en la landing).
- **No hardcodear colores hex**. Usar clases de Tailwind del `@theme`.

```tsx
// Imports sugeridos:
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { SectionContainer } from '@/components/ui';
```

#### 13.2 — `ArtisansSearchBar`

**Props**:

```ts
interface ArtisansSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}
```

- Reutilizar el componente `Input` existente (`src/components/ui/Input`).
- Tipo `search`, icono `Search` de Lucide React en el área del input (wrapper con posición relativa, icono absolutamente posicionado a la izquierda, `pl` extra en el input).
- Debounce de 300ms interno para no disparar filtros en cada tecla. Usar `useState` + `useEffect`.
- Placeholder y label desde i18n namespace `artisans`.

#### 13.3 — `ArtisansFilters`

**Props**:

```ts
interface ArtisansFiltersProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}
```

- Usar `COUNTRY_FILTERS` de `types.ts` del feature.
- Guatemala y Honduras: botón pill desactivado visualmente (`cursor-not-allowed`, `opacity-50`).
- Los botones activos del país seleccionado usan `bg-primary-navy text-white`.
- Los botones inactivos (disponibles): `border border-primary-navy/30 text-primary-navy`.
- Scroll horizontal en mobile si los chips no caben.
- **No usar el componente `Select`**; los filtros de esta feature son chips/pills visuales.

#### 13.4 — `BusinessCard` ⚠️ Componente más importante

**Props**:

```ts
interface BusinessCardProps {
  business: Business;
  ctaLabel: string;
  joinedLabel: string;
  artisanLabel: string;
  locationLabel: string;
  onViewProfile: (id: string) => void;
}
```

**Diseño de la tarjeta**:

1. **Área de imágenes** (arriba, ratio 16:9 o 4:3):
   - 0 imágenes: `ImagePlaceholder` ocupando todo el área.
   - 1 imagen: imagen única a pantalla completa del área.
   - 2 imágenes: dos columnas iguales lado a lado.
   - 3 imágenes: imagen grande a la izquierda (2/3 del ancho) + columna con 2 imágenes apiladas (1/3).
   - 4 imágenes: grid 2x2.
   - Cada imagen usa `ImagePlaceholder`.
   - Hover sobre el contenedor: escalar suavemente la(s) imagen(es) (`group-hover:scale-105`).

2. **Badge de país** (absoluto, arriba-izquierda sobre la imagen): `Badge` variant `default` con `MapPin` icon + `owner.country`.

3. **Contenido** (abajo):
   - Nombre del artesano: `UserIcon` + `owner.name + ' ' + owner.surname`.
   - Nombre del negocio: `<h3>` bold, hover a `text-primary-indigo`.
   - Ubicación: `MapPin` icon + `locationSummary`.
   - Descripción: `line-clamp-2`.
   - Fecha de incorporación: icono de calendario + `joinedAt` formateado como `MMM YYYY` usando `Intl.DateTimeFormat`.
   - **CTA**: `Button` variant `secondary` size `sm` que llama a `onViewProfile(business.id)`.

4. **Contenedor**: `Card` con `hoverable={true}`, `p-0`, `overflow-hidden`.

**Test requerido** (`BusinessCard.test.tsx`):

- Renderiza el nombre del negocio.
- Renderiza el nombre del artesano.
- Renderiza el país.
- Llama `onViewProfile` con el ID correcto al hacer click en el CTA.
- Muestra `ImagePlaceholder` cuando `imagesUrls` está vacío.

#### 13.5 — `BusinessGrid`

**Props**:

```ts
interface BusinessGridProps {
  businesses: Business[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewProfile: (id: string) => void;
}
```

- **Loading**: mostrar 6 elementos `Skeleton` con las mismas dimensiones que una `BusinessCard`.
- **Error**: ícono de alerta (`AlertTriangle` de Lucide), mensaje de error, botón "Reintentar".
- **Empty**: ícono (`SearchX` o similar), mensaje vacío traducido.
- **Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
- Las i18n labels para el `BusinessCard` se traducen en este componente (o en la página) y se pasan como props.

#### 13.6 — `FeaturedArtisansSection`

**Props**:

```ts
interface FeaturedArtisansSectionProps {
  businesses: Business[];
}
```

- Mostrar los primeros 3 negocios (o los que tenga si hay menos).
- Diseño editorial: 3 tarjetas en fila en desktop, columna en mobile.
- `SectionContainer` con `background="surface"`.
- Título e instrucción desde i18n.

#### 13.7 — `ArtisansCultureSection`

**Props**: ninguna

- Mostrar los 3 países: El Salvador (activo), Guatemala (próximamente), Honduras (próximamente).
- Tarjetas o chips de países con su estado visual.
- El Salvador: badge `variant="accent"` verde o con color activo.
- Guatemala/Honduras: badge gris o lavender con texto "Próximamente".
- `SectionContainer` con `background="default"`.
- Inspirado en `ExploreLatamSection` de landing pero más compacto y enfocado en estados.

#### 13.8 — Componentes de la página de detalle

##### `BusinessDetailHero`

```ts
interface BusinessDetailHeroProps {
  business: Business;
  backLabel: string;
}
```

- Imagen destacada a ancho completo (primera de `imagesUrls`, o `ImagePlaceholder` si está vacío).
- Overlay con gradiente de abajo hacia arriba (`from-black/70 via-black/30 to-transparent`).
- Sobre el overlay (abajo-izquierda): nombre del negocio en `text-white`, artesano, país.
- Botón de volver (arriba-izquierda): `←` + `backLabel`, estilo ghost oscuro.
- Altura mínima: `h-64 md:h-96 lg:h-[70vh]`.

##### `BusinessGallery`

```ts
interface BusinessGalleryProps {
  images: string[];
  businessName: string;
  galleryTitle: string;
  noImagesMessage: string;
}
```

- 0 imágenes: mensaje `noImagesMessage` con ícono.
- 1 imagen: una sola imagen grande centrada.
- 2-4 imágenes: grid responsivo `grid-cols-2 md:grid-cols-4`.
- Cada imagen usa `ImagePlaceholder`.

##### `ArtisanProfile`

```ts
interface ArtisanProfileProps {
  vendor: PublicVendor;
  joinedAt: Date;
  meetArtisanTitle: string;
  countryLabel: string;
  memberSinceLabel: string;
}
```

- Sección "Conoce al artesano".
- Avatar placeholder con iniciales: `vendor.name[0] + vendor.surname[0]` en un círculo con fondo gradiente.
- Nombre completo del artesano.
- País con `MapPin` icon.
- Fecha de incorporación formateada.
- Diseño de tarjeta editorial (`bg-surface`, `rounded-card`, `border-border`).

##### `BusinessImpact`

```ts
interface BusinessImpactProps {
  businessName: string;
  impactTitle: string;
  impactText: string;
}
```

- Fondo con gradiente del `@theme` (navy → indigo → lavender suave).
- `impactText` ya viene interpolado desde la página (no interpolar aquí).
- Ícono decorativo de estrella/sparkle.
- Diseño similar a `CultureSection` de la landing.

---

### Paso 14 — Archivo index del feature (`src/features/artisans/index.ts`)

```ts
// Hooks
export { useBusinesses } from './hooks/useBusinesses';
export { useBusinessDetail } from './hooks/useBusinessDetail';

// Componentes de lista
export { ArtisansHero } from './components/ArtisansHero';
export { ArtisansSearchBar } from './components/ArtisansSearchBar';
export { ArtisansFilters } from './components/ArtisansFilters';
export { BusinessCard } from './components/BusinessCard';
export { BusinessGrid } from './components/BusinessGrid';
export { FeaturedArtisansSection } from './components/FeaturedArtisansSection';
export { ArtisansCultureSection } from './components/ArtisansCultureSection';

// Componentes de detalle
export { BusinessDetailHero } from './components/BusinessDetailHero';
export { BusinessGallery } from './components/BusinessGallery';
export { ArtisanProfile } from './components/ArtisanProfile';
export { BusinessImpact } from './components/BusinessImpact';

// Types (solo públicos)
export type { ArtisanFilters, CountryFilterOption } from './types';
```

---

### Paso 15 — Página principal: ArtisansPage (`src/pages/ArtisansPage/ArtisansPage.tsx`)

Esta página es **solo composición**. No tiene lógica de negocio propia.

```tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useBusinesses,
  ArtisansHero,
  ArtisansSearchBar,
  ArtisansFilters,
  BusinessGrid,
  FeaturedArtisansSection,
  ArtisansCultureSection,
} from '@/features/artisans';
import type { ArtisanFilters } from '@/features/artisans';

export default function ArtisansPage() {
  const { t } = useTranslation('artisans');
  const navigate = useNavigate();
  const { data: businesses = [], isLoading, isError, refetch } = useBusinesses();

  const [filters, setFilters] = useState<ArtisanFilters>({ search: '', country: '' });

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const searchTerm = filters.search.toLowerCase();
      const matchSearch =
        searchTerm === '' ||
        b.name.toLowerCase().includes(searchTerm) ||
        `${b.owner.name} ${b.owner.surname}`.toLowerCase().includes(searchTerm);
      const matchCountry = filters.country === '' || b.owner.country === filters.country;
      return matchSearch && matchCountry;
    });
  }, [businesses, filters]);

  const handleViewProfile = (id: string) => navigate(`/artisans/${id}`);

  return (
    <>
      <ArtisansHero />

      {!isLoading && !isError && businesses.length > 0 && (
        <FeaturedArtisansSection businesses={businesses.slice(0, 3)} />
      )}

      <section id="artisans-discovery" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 mb-10">
            <ArtisansSearchBar
              value={filters.search}
              onChange={(search) => setFilters((f) => ({ ...f, search }))}
            />
            <ArtisansFilters
              selectedCountry={filters.country}
              onCountryChange={(country) => setFilters((f) => ({ ...f, country }))}
            />
          </div>

          <BusinessGrid
            businesses={filteredBusinesses}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onViewProfile={handleViewProfile}
          />
        </div>
      </section>

      <ArtisansCultureSection />
    </>
  );
}
```

Crear también `src/pages/ArtisansPage/index.ts`:

```ts
export { default as ArtisansPage } from './ArtisansPage';
```

---

### Paso 16 — Página de detalle: BusinessDetailPage (`src/pages/BusinessDetailPage/BusinessDetailPage.tsx`)

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useBusinessDetail,
  BusinessDetailHero,
  BusinessGallery,
  ArtisanProfile,
  BusinessImpact,
} from '@/features/artisans';
import { Skeleton } from '@/components/ui';

export default function BusinessDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation('artisans');
  const navigate = useNavigate();
  const { data: business, isLoading, isError } = useBusinessDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <Skeleton height="400px" className="w-full rounded-card" />
        <Skeleton height="32px" className="w-1/2" />
        <Skeleton height="120px" className="w-full" />
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-muted-text">{t('detail.error')}</p>
        <button onClick={() => navigate('/artisans')}>{t('detail.back')}</button>
      </div>
    );
  }

  return (
    <>
      <BusinessDetailHero business={business} backLabel={t('detail.back')} />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="text-3xl font-extrabold text-primary-navy tracking-tight mb-4">
              {business.name}
            </h2>
            <p className="text-base sm:text-lg text-muted-text leading-relaxed">
              {business.description}
            </p>
          </div>

          <BusinessGallery
            images={business.imagesUrls}
            businessName={business.name}
            galleryTitle={t('detail.gallery_title')}
            noImagesMessage={t('detail.no_images')}
          />

          <ArtisanProfile
            vendor={business.owner}
            joinedAt={business.joinedAt}
            meetArtisanTitle={t('detail.meet_artisan')}
            countryLabel={t('detail.country_label')}
            memberSinceLabel={t('detail.member_since')}
          />

          <BusinessImpact
            businessName={business.name}
            impactTitle={t('detail.impact_title')}
            impactText={t('detail.impact_text', { name: business.name })}
          />
        </div>
      </section>
    </>
  );
}
```

---

### Paso 17 — Actualizar rutas (`src/routes/index.tsx`)

1. Agregar lazy imports:

```tsx
import { lazy, Suspense } from 'react';
const ArtisansPage = lazy(() => import('../pages/ArtisansPage/ArtisansPage'));
const BusinessDetailPage = lazy(() => import('../pages/BusinessDetailPage/BusinessDetailPage'));
```

2. Agregar dentro del bloque `<Route element={<AppLayout />}>`:

```tsx
<Route path="/artisans" element={<ArtisansPage />} />
<Route path="/artisans/:id" element={<BusinessDetailPage />} />
```

3. Si no existe `<Suspense>` envolviendo el `<Routes>`, agregarlo con un fallback mínimo (spinner o skeleton).

---

### Paso 18 — Actualizar NavLinks (`src/components/layout/Navbar/NavLinks.tsx`)

Cambiar en el array `NAV_ITEMS`:

```ts
// ANTES:
{ labelKey: 'artisans', href: '/#testimonials', type: 'hash' },

// DESPUÉS:
{ labelKey: 'artisans', href: '/artisans', type: 'route' },
```

---

### Paso 19 — README de la nueva feature (`src/features/artisans/README.md`)

```markdown
# Feature: Artisans

## Propósito

Página pública de exploración de artesanos y negocios de Yawi.
Rutas: `/artisans` (lista) y `/artisans/:id` (detalle).

## Estructura

- `components/` — Componentes exclusivos de esta feature.
- `hooks/` — `useBusinesses` (lista) y `useBusinessDetail` (detalle por UUID). Usan TanStack Query.
- `types.ts` — `ArtisanFilters`, `CountryFilterOption`, `COUNTRY_FILTERS`.
- `index.ts` — API pública del feature. Solo importar desde aquí.

## Dependencias clave

- `@/types/artisan` — `Business`, `PublicVendor`, `BusinessDto`.
- `@/services/artisans.service` — Mapping DTO → dominio y sanitización de datos sensibles.
- `@/api/artisans.api` — Llamadas HTTP a `GET /businesses` y `GET /businesses/:id`.
- `@tanstack/react-query` — Server state management.

## Integración con la API

- Endpoint base: `VITE_API_URL` (default `http://localhost:3000`)
- `GET /businesses` — retorna lista completa con `owner` (Vendor) incluido.
- `GET /businesses/:id` — retorna detalle con `owner` incluido.
- Filtrado por nombre y país: **en cliente** (no en la API).

## Seguridad de datos

Los campos sensibles del Vendor (DUI, NIT, password, personal_address, birthdate) son
eliminados en `artisans.service.ts` al mapear a `PublicVendor`. Nunca llegan a los componentes.

## Reglas importantes

- No importar desde `@/api/` en componentes ni hooks directamente.
- No mostrar: balance del negocio, DUI, NIT, teléfonos, dirección personal del artesano.
- Usar siempre el tipo `Business` (dominio), nunca `BusinessDto` (crudo) en la UI.
```

---

### Paso 20 — Verificación final

```bash
# 1. TypeScript sin errores
npx tsc --noEmit

# 2. Tests
npx vitest run

# 3. Formato
npm run format:check
# Si falla:
npm run format

# 4. Servidor de desarrollo
npm run dev
```

**Checklist de verificación manual**:

- [ ] Navbar muestra "Artesanos"/"Artisans" con estado activo al estar en `/artisans`.
- [ ] La página `/artisans` carga negocios desde la API real (backend corriendo).
- [ ] La búsqueda filtra en tiempo real (debounce visible al escribir rápido).
- [ ] Filtro "El Salvador" activo funciona. Guatemala/Honduras visualmente desactivados.
- [ ] Click en "Ver perfil" navega a `/artisans/<uuid>`.
- [ ] La página `/artisans/:id` muestra el detalle correcto.
- [ ] Estado loading: skeletons visibles mientras carga.
- [ ] Estado error: mensaje de error con opción de reintentar/volver.
- [ ] Estado vacío: mensaje cuando no hay resultados con los filtros aplicados.
- [ ] Mobile (320-767px): sin overflow horizontal, 1 columna, CTAs visibles.
- [ ] Tablet (768-1023px): 2 columnas.
- [ ] Desktop (≥1024px): 3 columnas.
- [ ] Cambio de idioma EN/ES funciona en toda la página de Artesanos.
- [ ] **No se muestra**: username, DUI, NIT, balance, birthdate, dirección personal.
- [ ] Todos los colores vienen de clases de Tailwind (ningún hex en componentes).

---

## 5. Reglas de diseño (resumen desde DESIGN.md)

| Elemento          | Regla                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Colores           | Solo tokens de Tailwind del `@theme`. Ningún hex en componentes.             |
| Gradientes inline | Usar `var(--color-primary-navy)`, `var(--color-primary-indigo)`, etc.        |
| Hero              | 40% texto / 60% visual (desktop). Columna única en mobile.                   |
| Cards             | `rounded-card` (24px), `bg-surface`, `border-border`.                        |
| Hover             | `hover:-translate-y-1 hover:shadow-card-hover`. Nunca rebotes ni rotaciones. |
| Headings          | `font-extrabold tracking-tight leading-tight`.                               |
| Secciones         | `py-16 md:py-24`. Usar `SectionContainer` cuando sea posible.                |
| Background        | `bg-background` (`#FAF9F7`). Cards: `bg-surface` (`#FFFFFF`).                |
| Animaciones       | `transition-all duration-200/300`. Suaves y precisas.                        |

---

## 6. Notas adicionales para el agente

### Sobre el Spinner

No existe un componente `Spinner` en `components/ui/`. Usar `Skeleton` para estados de loading. No crear un Spinner nuevo; si se necesita, documentar la decisión en `DECISIONS.md`.

### Sobre la fecha "Miembro desde"

```ts
new Intl.DateTimeFormat(i18n.language, { month: 'short', year: 'numeric' }).format(joinedAt);
```

Obtener `i18n.language` con `useTranslation()` dentro del componente.

### Sobre el ambiente de API

Si el backend no está corriendo, el hook retornará `isError: true`. El frontend debe mostrar el estado de error correctamente. Esto no bloquea el desarrollo.

### Sobre datos de prueba del seed

El seed contiene 3 negocios sin imágenes:

- "Tienda El Buen Precio" y "Café Don Carlos" (Carlos Martínez, El Salvador)
- "Florería María" (María Flores, El Salvador)

Usar `ImagePlaceholder` adecuadamente para el estado sin imágenes.

### Sobre la variable de entorno

Agregar a `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

---

## 7. Documentación a actualizar/crear

| Archivo                           | Acción                                                                  |
| --------------------------------- | ----------------------------------------------------------------------- |
| `docs/DECISIONS.md`               | Agregar sección **Milestone 5** con decisiones #26–#33 (ver sección 2). |
| `src/features/artisans/README.md` | Crear (contenido en Paso 19).                                           |
| `src/pages/README.md`             | Agregar `ArtisansPage` y `BusinessDetailPage`.                          |
| `src/lib/README.md`               | Crear si no existe; documentar `queryClient.ts`.                        |
| `src/utils/` README o comentario  | Documentar `formatAddress.ts`.                                          |

---

## 8. Fuera del alcance

- ❌ No crear formularios de compra, carrito ni checkout.
- ❌ No modificar ningún endpoint de `yawi_api`.
- ❌ No agregar valoraciones, comentarios ni métricas comerciales reales.
- ❌ No crear pantallas de gestión de productos ni subida de imágenes.
- ❌ No modificar el design system (`index.css`) sin aprobación.
- ❌ No crear carpetas nuevas en `src/` fuera de las definidas por la arquitectura.
- ❌ No usar Tailwind v3 syntax. El proyecto usa v4 con `@theme` en `index.css`.
- ❌ No modificar la lógica de negocio ni los contratos existentes de `yawi_api`.

---

_Plan listo para revisión y aprobación antes de implementar._
