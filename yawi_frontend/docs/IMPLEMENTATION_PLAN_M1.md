# Plan de Implementación — Milestone 1: Landing Page

## Meta

Entregar la landing page completa de Yawi como punto de entrada de la aplicación web, incluyendo:

- Layout global (Navbar + Footer) responsive y extensible
- Internacionalización (es/en) con `react-i18next`
- Componentes UI reutilizables (botones, skeleton loaders, etc.)
- Todas las secciones de contenido de la landing
- Sistema de estilos con Tailwind CSS v4 y paleta de colores centralizada
- Routing base con `react-router-dom`

> **Alcance limitado a `yawi_frontend/`.** No se modifica `yawi_api/`, `yawi_n8n/` ni la infraestructura Docker.

---

## Índice

1. [Fase 0 — Setup e Infraestructura](#fase-0--setup-e-infraestructura)
2. [Fase 1 — Design System y Componentes UI](#fase-1--design-system-y-componentes-ui)
3. [Fase 2 — Layout Global](#fase-2--layout-global)
4. [Fase 3 — Secciones de la Landing Page](#fase-3--secciones-de-la-landing-page)
5. [Fase 4 — Ensamblaje, Routing y Página](#fase-4--ensamblaje-routing-y-página)
6. [Fase 5 — Pulido, Responsive y QA](#fase-5--pulido-responsive-y-qa)
7. [Fase 6 — Documentación y READMEs](#fase-6--documentación-y-readmes)
8. [Árbol de archivos final](#árbol-de-archivos-final)
9. [Decisiones diferidas](#decisiones-diferidas)
10. [Criterios de aceptación](#criterios-de-aceptación)
11. [Checklist final](#checklist-final)

---

## Fase 0 — Setup e Infraestructura

### 0.1 Instalar dependencias

```bash
# Dentro de yawi_frontend/
npm install react-router-dom react-i18next i18next i18next-browser-languagedetector lucide-react zustand
npm install -D tailwindcss @tailwindcss/vite
```

> **Nota sobre Zustand**: Se reemplaza Redux Toolkit (mencionado en `ARCHITECTURE.md`) por Zustand, por decisión explícita del proyecto. Documentar en `DECISIONS.md`.

### 0.2 Configurar Tailwind CSS v4

Tailwind v4 no usa `tailwind.config.js`. La configuración vive en CSS.

**Archivo:** `vite.config.ts`

```ts
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**Archivo:** `src/index.css` — Reemplazar completamente el contenido actual con:

```css
@import 'tailwindcss';

/* ─── Fuente principal ─── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ─── Tema customizado (Tailwind v4 @theme) ─── */
@theme {
  /* Colores — paleta centralizada (DESIGN.md) */
  --color-primary-navy: #18245B;
  --color-primary-indigo: #6776FF;
  --color-soft-lavender: #B7B1FF;
  --color-peach-accent: #F4A782;

  --color-background: #FAF9F7;
  --color-surface: #FFFFFF;
  --color-border: #ECECEC;
  --color-muted-text: #707070;
  --color-primary-text: #1D1D1D;

  /* Fuentes */
  --font-sans: 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif;
  --font-heading: 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif;

  /* Border radius (DESIGN.md) */
  --radius-card: 24px;
  --radius-button: 999px;
  --radius-widget: 24px;

  /* Sombras */
  --shadow-card: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  --shadow-card-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);

  /* Espaciado de secciones (DESIGN.md: 80px–140px entre secciones) */
  --spacing-section: 100px;
  --spacing-section-mobile: 64px;

  /* Breakpoints (Mobile first) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* ─── Estilos base globales ─── */
body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--color-background);
  color: var(--color-primary-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

> **Regla crítica**: TODOS los colores de la aplicación deben usar variables de `@theme`. Está **prohibido** usar colores hex/rgb/hsl directamente en componentes. Si se necesita un nuevo color, se agrega a `@theme` en `index.css`.

### 0.3 Configurar i18n

**Archivo:** `src/i18n/i18n.ts`

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import esCommon from './locales/es/common.json';
import esLanding from './locales/es/landing.json';
import esNav from './locales/es/nav.json';
import esFooter from './locales/es/footer.json';
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enNav from './locales/en/nav.json';
import enFooter from './locales/en/footer.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        landing: esLanding,
        nav: esNav,
        footer: esFooter,
      },
      en: {
        common: enCommon,
        landing: enLanding,
        nav: enNav,
        footer: enFooter,
      },
    },
    lng: 'es', // Idioma por defecto: español
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });

export default i18n;
```

**Estructura de archivos de traducción:**

```
src/i18n/
  i18n.ts
  locales/
    es/
      common.json      # textos compartidos (botones genéricos, estados)
      landing.json      # textos de la landing page
      nav.json          # textos de la navbar
      footer.json       # textos del footer
    en/
      common.json
      landing.json
      nav.json
      footer.json
```

**Contenido ejemplo de `es/nav.json`:**

```json
{
  "logo_alt": "Yawi logo",
  "home": "Inicio",
  "explore": "Explorar",
  "artisans": "Artesanos",
  "about": "Sobre Yawi",
  "sell": "Vender con Yawi",
  "login": "Iniciar sesión",
  "language": "EN"
}
```

**Contenido ejemplo de `en/nav.json`:**

```json
{
  "logo_alt": "Yawi logo",
  "home": "Home",
  "explore": "Explore",
  "artisans": "Artisans",
  "about": "About Yawi",
  "sell": "Sell with Yawi",
  "login": "Log in",
  "language": "ES"
}
```

**Contenido de `es/landing.json`**: Debe incluir **todas** las claves de texto de cada sección. Estructura sugerida:

```json
{
  "hero": {
    "title": "...",
    "subtitle": "...",
    "cta_primary": "...",
    "cta_secondary": "..."
  },
  "why_yawi": {
    "title": "¿Por qué Yawi?",
    "cards": [
      { "title": "...", "subtitle": "..." },
      { "title": "...", "subtitle": "..." },
      { "title": "...", "subtitle": "..." },
      { "title": "...", "subtitle": "..." }
    ]
  },
  "categories": {
    "title": "Explora por categoría",
    "items": {
      "textiles": "...",
      "ceramics": "...",
      "jewelry": "...",
      "wood": "...",
      "leather": "...",
      "food": "..."
    }
  },
  "story": {
    "title": "Una historia detrás de cada producto",
    "text": "...",
    "image_alt": "..."
  },
  "explore_latam": {
    "title": "Explora Latinoamérica",
    "active_label": "Activo",
    "coming_soon": "Próximamente",
    "countries": {
      "mexico": "México",
      "guatemala": "Guatemala",
      "colombia": "Colombia",
      "peru": "Perú",
      "ecuador": "Ecuador"
    }
  },
  "featured_products": {
    "title": "Productos destacados",
    "view_product": "Ver producto"
  },
  "culture": {
    "title": "Llevar la cultura más lejos",
    "text": "..."
  },
  "testimonials": {
    "title": "Testimonios",
    "buyer_label": "Comprador",
    "artisan_label": "Artesano",
    "buyer": {
      "name": "...",
      "quote": "..."
    },
    "artisan": {
      "name": "...",
      "quote": "..."
    }
  },
  "final_cta": {
    "title": "...",
    "description": "...",
    "button": "..."
  }
}
```

> Los valores `"..."` son **placeholders** intencionales para que el equipo coloque los textos definitivos. Las claves y la estructura deben ser las definitivas.

### 0.4 Configurar el punto de entrada

**Archivo:** `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n/i18n';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

### 0.5 Limpiar boilerplate

- Eliminar el contenido actual de `App.tsx` (el contador de Vite).
- Eliminar `App.css` (todos los estilos vivirán en Tailwind / `index.css`).
- Conservar `assets/yawi-logo.svg`. Los demás assets de boilerplate (`react.svg`, `vite.svg`, `hero.png`) se eliminan.

---

## Fase 1 — Design System y Componentes UI

> Ubicación: `src/components/ui/`
> Regla de `ARCHITECTURE.md`: `ui/` es domain-agnostic. No importa de `api/`, `services/`, `store/`, `i18n`. Recibe texto vía props.

### 1.1 Button

```
src/components/ui/Button/
  Button.tsx
  Button.test.tsx
  index.ts
```

**Props interface:**

```ts
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'cta';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  as?: 'button' | 'a';
  href?: string;
}
```

**Estilos (Tailwind, basados en DESIGN.md):**

| Variante | Fondo | Texto | Borde |
|---|---|---|---|
| `primary` | `bg-primary-navy` | `text-white` | ninguno |
| `secondary` | `bg-transparent` | `text-primary-navy` | `border border-primary-navy` |
| `ghost` | `bg-transparent` | `text-primary-navy` | ninguno |
| `cta` | `bg-peach-accent` | `text-primary-navy` | ninguno |

Todos con `rounded-button` (999px), `font-semibold`, padding `14px 28px`.

Hover del primary: `bg-primary-indigo`. Transición suave.

### 1.2 Skeleton (Loader/Placeholder reutilizable)

```
src/components/ui/Skeleton/
  Skeleton.tsx
  index.ts
```

**Props interface:**

```ts
interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}
```

Componente con animación `pulse` que sirve como placeholder visual. Se usará en `ImagePlaceholder` y en cualquier componente que cargue datos dinámicamente en el futuro.

### 1.3 ImagePlaceholder (Imagen con fallback/loading)

```
src/components/ui/ImagePlaceholder/
  ImagePlaceholder.tsx
  index.ts
```

**Props interface:**

```ts
interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}
```

**Comportamiento:**

1. Si no se pasa `src` o `src` es string vacío → muestra `Skeleton` con un ícono de imagen genérico.
2. Si se pasa `src` → intenta cargar la imagen. Mientras carga, muestra `Skeleton`. Si falla, muestra placeholder con ícono.
3. Esto permite reutilización: cuando la API provea imágenes, solo cambia `src`.

### 1.4 SectionContainer

```
src/components/ui/SectionContainer/
  SectionContainer.tsx
  index.ts
```

**Props interface:**

```ts
interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'default' | 'surface' | 'navy';
}
```

Envuelve secciones de la landing con el espaciado consistente definido en `DESIGN.md` (80–140px entre secciones), max-width y padding horizontal.

### 1.5 Card

```
src/components/ui/Card/
  Card.tsx
  index.ts
```

**Props interface:**

```ts
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}
```

Tarjeta base con `border-radius: 24px`, fondo blanco, borde sutil, y efecto hover opcional (`translateY(-4px)` + sombra, según `DESIGN.md`).

### 1.6 Badge

```
src/components/ui/Badge/
  Badge.tsx
  index.ts
```

**Props interface:**

```ts
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  className?: string;
}
```

### 1.7 Barrel export

**Archivo:** `src/components/ui/index.ts`

```ts
export { Button } from './Button';
export { Skeleton } from './Skeleton';
export { ImagePlaceholder } from './ImagePlaceholder';
export { SectionContainer } from './SectionContainer';
export { Card } from './Card';
export { Badge } from './Badge';
```

---

## Fase 2 — Layout Global

> Ubicación: `src/components/layout/`
> El layout se mantiene constante entre páginas.

### 2.1 Navbar

```
src/components/layout/Navbar/
  Navbar.tsx
  Navbar.test.tsx
  MobileMenu.tsx     # Sidebar/drawer para mobile
  NavLinks.tsx       # Lista de links (extensible)
  index.ts
```

**Estructura de datos para menú (extensible):**

```ts
// Dentro de NavLinks.tsx o en un archivo de configuración del layout
interface NavItem {
  labelKey: string;    // clave i18n (ej: "nav:home")
  href: string;        // ruta destino
  type: 'link' | 'cta-primary' | 'cta-secondary';
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav:home', href: '/', type: 'link' },
  { labelKey: 'nav:explore', href: '/explorar', type: 'cta-primary' },
  { labelKey: 'nav:artisans', href: '/artesanos', type: 'link' },
  { labelKey: 'nav:about', href: '/sobre-yawi', type: 'link' },
  { labelKey: 'nav:sell', href: '/vender', type: 'cta-secondary' },
];
```

> **Extensibilidad**: Para agregar una nueva opción de menú, solo se agrega un objeto al array `NAV_ITEMS`. No se modifica JSX.

**Funcionalidades de la Navbar:**

1. **Logo**: Renderiza `yawi-logo.svg`, clickeable → ruta `/`.
2. **Links de navegación**: Renderizados desde `NAV_ITEMS`. `href` no redirige por ahora (usar `e.preventDefault()` o `#`).
3. **CTA Explorar**: Estilo botón `primary` (distinguido visualmente).
4. **CTA Vender con Yawi**: Estilo botón `secondary`.
5. **Botón Iniciar sesión**: Diseño ghost/outline. Debe prepararse para mutar según estado de autenticación (ver nota abajo).
6. **Selector de idioma**: Botón que alterna entre `ES` ↔ `EN`. Llama a `i18n.changeLanguage()`.
7. **Menú hamburguesa (mobile)**: Visible solo en `< md` (768px). Abre `MobileMenu`.

**Preparación para estado de autenticación:**

Crear un store de Zustand mínimo para el estado de auth:

```
src/store/authStore.ts
```

```ts
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: null; // se tipará cuando exista el modelo User
  // Placeholder actions para cuando se integre el backend
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
```

La Navbar lee `isAuthenticated` del store y renderiza condicionalmente:
- `false` → "Iniciar sesión"
- `true` → avatar/nombre del usuario (placeholder por ahora)

**MobileMenu (Sidebar):**

- Drawer/sidebar que desliza desde la derecha.
- Contiene los mismos links que la navbar desktop.
- Se cierra al hacer click fuera, en un link, o con botón X.
- Overlay semitransparente de fondo.
- Animación de entrada/salida suave con `transition` CSS.

### 2.2 Footer

```
src/components/layout/Footer/
  Footer.tsx
  Footer.test.tsx
  index.ts
```

**Contenido:**

1. **Logo** de Yawi.
2. **Información de contacto** (placeholder con claves i18n).
3. **Links rápidos**: Repetir items del menú principal.
4. **Iconos de redes sociales**: Instagram, Facebook, X/Twitter, TikTok (usar iconos de Lucide React). Links como `href="#"`.
5. **Copyright**: Con año dinámico.

Todos los textos con claves i18n del namespace `footer`.

### 2.3 AppLayout

```
src/components/layout/AppLayout/
  AppLayout.tsx
  index.ts
```

```tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### 2.4 Barrel export del layout

**Archivo:** `src/components/layout/index.ts`

```ts
export { AppLayout } from './AppLayout';
export { Navbar } from './Navbar';
export { Footer } from './Footer';
```

---

## Fase 3 — Secciones de la Landing Page

> Ubicación: `src/features/landing/components/`
> Cada sección es un componente dentro del feature `landing`.
> Los textos se obtienen con `useTranslation('landing')`.
> Las imágenes se obtienen del archivo JSON de configuración (ver 3.0).

### 3.0 Archivo de configuración de imágenes

**Archivo:** `src/features/landing/landing-images.json`

```json
{
  "hero": {
    "collage": [
      { "src": "", "alt": "hero.collage_1_alt" },
      { "src": "", "alt": "hero.collage_2_alt" },
      { "src": "", "alt": "hero.collage_3_alt" },
      { "src": "", "alt": "hero.collage_4_alt" }
    ]
  },
  "categories": [
    { "id": "textiles", "src": "", "titleKey": "categories.items.textiles" },
    { "id": "ceramics", "src": "", "titleKey": "categories.items.ceramics" },
    { "id": "jewelry", "src": "", "titleKey": "categories.items.jewelry" },
    { "id": "wood", "src": "", "titleKey": "categories.items.wood" },
    { "id": "leather", "src": "", "titleKey": "categories.items.leather" },
    { "id": "food", "src": "", "titleKey": "categories.items.food" }
  ],
  "story": {
    "src": "",
    "alt": "story.image_alt"
  },
  "explore_latam": {
    "countries": [
      { "id": "mexico", "src": "", "active": true },
      { "id": "guatemala", "src": "", "active": false },
      { "id": "colombia", "src": "", "active": false },
      { "id": "peru", "src": "", "active": false },
      { "id": "ecuador", "src": "", "active": false }
    ]
  },
  "testimonials": {
    "buyer": { "avatar_src": "" },
    "artisan": { "avatar_src": "" }
  }
}
```

> **Propósito**: Cuando se quieran cambiar las imágenes, se modifica **solo** este archivo. Los componentes lo importan y pasan las rutas a `ImagePlaceholder`. Los valores de `alt` son claves i18n que se resuelven en el componente.

### 3.1 HeroSection

```
src/features/landing/components/HeroSection/
  HeroSection.tsx
  HeroSection.test.tsx
  index.ts
```

**Estructura visual (DESIGN.md: 40% contenido, 60% visual):**

- **Desktop**: Grid de 2 columnas. Izquierda: título (h1), subtítulo, CTA primario (Button primary) + CTA secundario (Button secondary). Derecha: collage de imágenes (grid de 2x2 con `ImagePlaceholder`, bordes redondeados, ligero offset/overlap para efecto editorial).
- **Mobile**: Stack vertical. Texto arriba, collage debajo (2 columnas compactas).

**Reglas:**
- Título: Tipografía `text-4xl md:text-6xl font-extrabold`, `letter-spacing: -0.03em`, `leading-tight`.
- CTAs: Usar componente `Button` del design system.
- Imágenes del collage: Importadas desde `landing-images.json`.

### 3.2 WhyYawiSection

```
src/features/landing/components/WhyYawiSection/
  WhyYawiSection.tsx
  index.ts
```

**Estructura:**

- Título de sección.
- Grid de 4 tarjetas (2x2 en tablet, 1 columna en mobile, 4 columnas en desktop).
- Cada tarjeta: ícono de Lucide (pasado como componente), título, subtítulo.
- Usar componente `Card` del design system.
- Los íconos y textos se mapean desde un array local usando claves i18n.

**Estructura de datos interna:**

```ts
const WHY_YAWI_ICONS = [Globe, ShieldCheck, Heart, Truck]; // Lucide icons
```

Los textos vienen de `landing.json` → `why_yawi.cards[n].title / subtitle`.

### 3.3 CategoriesSection

```
src/features/landing/components/CategoriesSection/
  CategoriesSection.tsx
  CategoryCard.tsx   # Tarjeta clickeable con imagen de fondo y título superpuesto
  index.ts
```

**Estructura:**

- Título de sección.
- Grid responsive de tarjetas clickeables.
- Cada tarjeta: imagen de fondo (vía `ImagePlaceholder`) + título superpuesto en la parte inferior con fondo semi-transparente oscuro + texto blanco.
- Los datos vienen de `landing-images.json` → `categories[]`.

**`CategoryCard` Props:**

```ts
interface CategoryCardProps {
  imageSrc?: string;
  title: string;
  onClick?: () => void;
}
```

### 3.4 StorySection

```
src/features/landing/components/StorySection/
  StorySection.tsx
  index.ts
```

**Estructura (2 columnas en desktop, stack en mobile):**

- Columna izquierda: título (h2), párrafo de texto.
- Columna derecha: fotografía/imagen (vía `ImagePlaceholder`).
- Imagen importada desde `landing-images.json` → `story`.

### 3.5 ExploreLatamSection

```
src/features/landing/components/ExploreLatamSection/
  ExploreLatamSection.tsx
  CountryCard.tsx
  index.ts
```

**Estructura:**

- Título de sección.
- Tarjetas de países con bandera/imagen, nombre del país, y badge "Activo" o "Próximamente".
- El país activo tiene un estilo destacado (borde de color, badge de acento).
- Datos desde `landing-images.json` → `explore_latam.countries[]`.

**Alternativa simple al mapa**: Dado que es un MVP, usar tarjetas de países en un grid horizontal scrollable en lugar de un mapa interactivo. Es más ligero y mantiene la misma comunicación visual.

### 3.6 FeaturedProductsSection (Carrusel)

```
src/features/landing/components/FeaturedProductsSection/
  FeaturedProductsSection.tsx
  ProductCarousel.tsx
  index.ts
```

**Infraestructura para datos estáticos (simulando futura API):**

Crear un archivo de datos estáticos que simule la respuesta de la API:

```
src/features/landing/data/
  featured-products.ts
```

```ts
import type { Product } from '../types';

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bolsa tejida a mano',
    country: 'México',
    artisan: 'María López',
    price: 45.00,
    currency: 'USD',
    imageSrc: '', // placeholder vacío → ImagePlaceholder mostrará skeleton
  },
  // ... 5-8 productos más
];
```

**Tipos (en `src/features/landing/types.ts`):**

```ts
export interface Product {
  id: string;
  name: string;
  country: string;
  artisan: string;
  price: number;
  currency: string;
  imageSrc: string;
}
```

**Hook (preparado para migrar a API):**

```
src/features/landing/hooks/useFeaturedProducts.ts
```

```ts
import { FEATURED_PRODUCTS } from '../data/featured-products';
import type { Product } from '../types';

/**
 * Retorna productos destacados.
 * TODO: Reemplazar con llamada a API via TanStack Query cuando el backend esté listo.
 * El contrato de retorno se mantiene igual.
 */
export function useFeaturedProducts(): {
  data: Product[];
  isLoading: boolean;
  isError: boolean;
} {
  return {
    data: FEATURED_PRODUCTS,
    isLoading: false,
    isError: false,
  };
}
```

**ProductCarousel:**
- Carrusel horizontal con CSS `scroll-snap`.
- Cada tarjeta: `ImagePlaceholder`, nombre, país, artesano, precio, botón "Ver producto".
- Flechas de navegación (prev/next) visibles en desktop.
- Swipe nativo en mobile.
- Maneja estados: loading (muestra skeletons), error (muestra mensaje), vacío.

**ProductCard (dentro de `src/components/common/`):**

> Se ubica en `common/` porque será reutilizado por el feature `catalog` en futuros milestones.

```
src/components/common/ProductCard/
  ProductCard.tsx
  ProductCard.test.tsx
  index.ts
```

```ts
interface ProductCardProps {
  imageSrc?: string;
  name: string;
  country: string;
  artisan: string;
  price: number;
  currency: string;
  ctaLabel: string;
  onCtaClick?: () => void;
}
```

### 3.7 CultureSection

```
src/features/landing/components/CultureSection/
  CultureSection.tsx
  index.ts
```

**Estructura simple:**
- Título (h2).
- Párrafo de texto.
- Fondo con color de acento sutil (lavender) o gradiente suave según `DESIGN.md`.

### 3.8 TestimonialsSection

```
src/features/landing/components/TestimonialsSection/
  TestimonialsSection.tsx
  TestimonialCard.tsx
  index.ts
```

**Estructura:**
- Título de sección.
- Dos tarjetas lado a lado (stack en mobile):
  - **Comprador**: avatar (ImagePlaceholder), nombre, label "Comprador", frase/cita.
  - **Artesano**: avatar (ImagePlaceholder), nombre, label "Artesano", frase/cita.
- Los datos son estáticos y vienen de las traducciones i18n.

### 3.9 FinalCtaSection

```
src/features/landing/components/FinalCtaSection/
  FinalCtaSection.tsx
  index.ts
```

**Estructura:**
- Fondo con gradiente de la paleta (navy → indigo → lavender).
- Título centrado (texto blanco).
- Descripción breve.
- Botón CTA (variante `cta` con peach accent).

### 3.10 Barrel export del feature

**Archivo:** `src/features/landing/index.ts`

```ts
// Componentes públicos del feature
export { HeroSection } from './components/HeroSection';
export { WhyYawiSection } from './components/WhyYawiSection';
export { CategoriesSection } from './components/CategoriesSection';
export { StorySection } from './components/StorySection';
export { ExploreLatamSection } from './components/ExploreLatamSection';
export { FeaturedProductsSection } from './components/FeaturedProductsSection';
export { CultureSection } from './components/CultureSection';
export { TestimonialsSection } from './components/TestimonialsSection';
export { FinalCtaSection } from './components/FinalCtaSection';

// Hooks
export { useFeaturedProducts } from './hooks/useFeaturedProducts';

// Types
export type { Product } from './types';
```

---

## Fase 4 — Ensamblaje, Routing y Página

### 4.1 LandingPage

```
src/pages/LandingPage/
  LandingPage.tsx
  index.ts
```

```tsx
// LandingPage.tsx
// Importar usando rutas relativas (sin @/ alias, decisión diferida)
import {
  HeroSection,
  WhyYawiSection,
  CategoriesSection,
  StorySection,
  ExploreLatamSection,
  FeaturedProductsSection,
  CultureSection,
  TestimonialsSection,
  FinalCtaSection,
} from '../../features/landing';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <WhyYawiSection />
      <CategoriesSection />
      <StorySection />
      <ExploreLatamSection />
      <FeaturedProductsSection />
      <CultureSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}
```

> **Nota sobre path alias**: El path alias `@/` NO se configura en este milestone (decisión diferida). Usar rutas relativas. Documentar en `DECISIONS.md`.

### 4.2 Router

**Archivo:** `src/routes/index.tsx`

```tsx
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import LandingPage from '../pages/LandingPage/LandingPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* Futuras rutas se agregan aquí */}
      </Route>
    </Routes>
  );
}
```

### 4.3 App.tsx

```tsx
import { AppRoutes } from './routes';

function App() {
  return <AppRoutes />;
}

export default App;
```

---

## Fase 5 — Pulido, Responsive y QA

### 5.1 Revisión responsive

Verificar **cada sección** en los siguientes breakpoints:

| Breakpoint | Ancho | Comportamiento esperado |
|---|---|---|
| Mobile | < 640px | 1 columna, sidebar menu, tarjetas apiladas, carrusel horizontal |
| Tablet | 640–1023px | 2 columnas donde aplique, navbar con hamburguesa |
| Desktop | ≥ 1024px | Layout completo, navbar expandida, grids de 3-4 columnas |

### 5.2 Checklist por sección

Para **cada** sección verificar:

- [ ] Textos vienen de i18n (no hay strings hardcoded)
- [ ] Imágenes vienen de `landing-images.json` vía `ImagePlaceholder`
- [ ] Se ve bien en mobile (320px min)
- [ ] Se ve bien en tablet (768px)
- [ ] Se ve bien en desktop (1280px)
- [ ] Colores usan **solo** variables de `@theme` (no hex directos)
- [ ] Espaciado entre secciones es consistente (80–140px)
- [ ] Hover effects funcionan según `DESIGN.md` (translateY, sombra suave)
- [ ] Animaciones son sutiles, no exageradas

### 5.3 Accesibilidad básica

- Todos los `<img>` tienen `alt` descriptivos (vía i18n)
- Navegación por teclado funciona en la Navbar
- Contraste de color cumple WCAG AA
- Sidebar mobile se puede cerrar con Escape
- Focus visible en elementos interactivos

---

## Fase 6 — Documentación y READMEs

### 6.1 READMEs por carpeta

Crear un `README.md` en cada carpeta nueva con la siguiente estructura:

```markdown
# <Nombre de la carpeta>

## Propósito
<Qué contiene y para qué sirve>

## Contenido
<Lista de archivos/subcarpetas con descripción de una línea>

## Reglas
<Qué se puede y qué NO se puede hacer aquí, según ARCHITECTURE.md>

## Dependencias
<De qué carpetas importa y quién puede importar de aquí>
```

**Carpetas que requieren README.md:**

- `src/components/ui/`
- `src/components/layout/`
- `src/components/common/`
- `src/features/landing/`
- `src/features/landing/components/`
- `src/features/landing/data/`
- `src/features/landing/hooks/`
- `src/i18n/`
- `src/pages/`
- `src/routes/`
- `src/store/`

### 6.2 DECISIONS.md

**Archivo:** `docs/DECISIONS.md`

Documentar las siguientes decisiones arquitectónicas tomadas en este milestone:

| # | Decisión | Opciones consideradas | Elección | Razón |
|---|---|---|---|---|
| 1 | State management | Redux Toolkit, Zustand | **Zustand** | Más ligero, menos boilerplate; decisión explícita del equipo. `ARCHITECTURE.md` referencia Redux Toolkit pero se prioriza la velocidad de desarrollo del MVP |
| 2 | Path alias `@/` | Configurar ahora, diferir | **Diferido a M2** | El milestone 1 tiene pocos archivos cruzados; se configurará cuando la complejidad lo requiera |
| 3 | Librería de iconos | Lucide React, React Icons, SVGs manuales | **Lucide React** | Tree-shakeable, estilo outline moderno alineado con DESIGN.md |
| 4 | Carrusel de productos | Swiper.js, Embla, CSS scroll-snap | **CSS scroll-snap** | Sin dependencias externas, suficiente para MVP, mejor rendimiento |
| 5 | Tailwind CSS | v3, v4 | **v4** | Configuración vía CSS (sin config JS), más moderno, mejor DX |
| 6 | Tipografía | Inter, Outfit, Poppins | **Inter** | Excelente legibilidad, amplio soporte de pesos, estándar en diseño moderno |
| 7 | i18n | react-i18next, custom | **react-i18next** | Estándar de la industria, alineado con ARCHITECTURE.md |
| 8 | Idioma por defecto | Español, auto-detect | **Español** | Mercado principal: Latinoamérica |
| 9 | Explorar Latam | Mapa interactivo, Tarjetas | **Tarjetas de países** | Más ligero para MVP, misma información visual |

---

## Árbol de archivos final

```
yawi_frontend/
  docs/
    DESIGN.md                          # (existente)
    DECISIONS.md                       # (nuevo)
    IMPLEMENTATION_PLAN_M1.md          # (este archivo)
  src/
    ARCHITECTURE.md                    # (existente, no modificar)
    index.css                          # (modificado: Tailwind v4 + @theme)
    main.tsx                           # (modificado: BrowserRouter + i18n)
    App.tsx                            # (modificado: solo renderiza AppRoutes)
    i18n/
      README.md
      i18n.ts
      locales/
        es/
          common.json
          landing.json
          nav.json
          footer.json
        en/
          common.json
          landing.json
          nav.json
          footer.json
    store/
      README.md
      authStore.ts
    components/
      ui/
        README.md
        index.ts
        Button/
          Button.tsx
          Button.test.tsx
          index.ts
        Skeleton/
          Skeleton.tsx
          index.ts
        ImagePlaceholder/
          ImagePlaceholder.tsx
          index.ts
        SectionContainer/
          SectionContainer.tsx
          index.ts
        Card/
          Card.tsx
          index.ts
        Badge/
          Badge.tsx
          index.ts
      layout/
        README.md
        index.ts
        AppLayout/
          AppLayout.tsx
          index.ts
        Navbar/
          Navbar.tsx
          Navbar.test.tsx
          MobileMenu.tsx
          NavLinks.tsx
          index.ts
        Footer/
          Footer.tsx
          Footer.test.tsx
          index.ts
      common/
        README.md
        ProductCard/
          ProductCard.tsx
          ProductCard.test.tsx
          index.ts
    features/
      landing/
        README.md
        index.ts
        types.ts
        landing-images.json
        data/
          README.md
          featured-products.ts
        hooks/
          README.md
          useFeaturedProducts.ts
        components/
          README.md
          HeroSection/
            HeroSection.tsx
            HeroSection.test.tsx
            index.ts
          WhyYawiSection/
            WhyYawiSection.tsx
            index.ts
          CategoriesSection/
            CategoriesSection.tsx
            CategoryCard.tsx
            index.ts
          StorySection/
            StorySection.tsx
            index.ts
          ExploreLatamSection/
            ExploreLatamSection.tsx
            CountryCard.tsx
            index.ts
          FeaturedProductsSection/
            FeaturedProductsSection.tsx
            ProductCarousel.tsx
            index.ts
          CultureSection/
            CultureSection.tsx
            index.ts
          TestimonialsSection/
            TestimonialsSection.tsx
            TestimonialCard.tsx
            index.ts
          FinalCtaSection/
            FinalCtaSection.tsx
            index.ts
    pages/
      README.md
      LandingPage/
        LandingPage.tsx
        index.ts
    routes/
      README.md
      index.tsx
    assets/
      yawi-logo.svg                    # (existente, conservar)
```

---

## Decisiones diferidas

Las siguientes decisiones **no se toman** en este milestone:

| Decisión | Razón | Milestone estimado |
|---|---|---|
| Configurar path alias `@/` | Complejidad innecesaria para M1 | M2 |
| Testing E2E con Playwright | No hay flujos críticos aún | M3+ |
| TanStack Query | Sin conexión a API | M2 cuando se integre backend |
| Supabase client setup (`lib/`) | Sin backend aún | M2 |
| Route guards (RequireAuth, RequireRole) | Sin auth real | M2+ |
| Dark mode | No prioritario para MVP landing | Futuro |

---

## Criterios de aceptación

1. La landing page carga en `http://localhost:5173/` sin errores de consola.
2. Todos los textos visibles vienen de archivos i18n (`es/*.json`, `en/*.json`).
3. El botón de idioma alterna entre ES ↔ EN y **toda** la página se actualiza.
4. La Navbar muestra logo, links, CTA explorar, CTA vender, botón login, botón idioma.
5. En mobile (< 768px), la Navbar colapsa a menú hamburguesa que abre sidebar.
6. El Footer muestra logo, info de contacto, links, redes sociales, copyright.
7. Las 9 secciones de la landing se renderizan en orden.
8. El carrusel de productos se puede navegar con flechas (desktop) y swipe (mobile).
9. `ImagePlaceholder` muestra skeleton cuando no tiene `src`.
10. Cambiar una imagen requiere modificar **solo** `landing-images.json`.
11. Cambiar un color de la paleta requiere modificar **solo** `index.css` → `@theme`.
12. Agregar un item al menú requiere **solo** agregar un objeto a `NAV_ITEMS`.
13. No hay colores hex/rgb hardcoded en componentes (solo clases Tailwind que referencian el theme).
14. `npm run build` compila sin errores de TypeScript.
15. Cada carpeta nueva tiene un `README.md`.
16. `DECISIONS.md` está creado y completo.

---

## Checklist final

- [ ] Fase 0: Dependencias instaladas y configuradas
- [ ] Fase 0: Tailwind v4 funciona (verificar con una clase utilitaria simple)
- [ ] Fase 0: i18n funciona (verificar con un texto traducido)
- [ ] Fase 0: Boilerplate eliminado
- [ ] Fase 1: Todos los componentes UI creados y exportados
- [ ] Fase 1: `Button` tiene test unitario
- [ ] Fase 2: Navbar funcional en desktop y mobile
- [ ] Fase 2: Footer completo
- [ ] Fase 2: AppLayout envuelve la página con Navbar + Outlet + Footer
- [ ] Fase 3: Las 9 secciones implementadas
- [ ] Fase 3: `landing-images.json` creado con estructura completa
- [ ] Fase 3: `useFeaturedProducts` hook creado con datos estáticos
- [ ] Fase 3: `ProductCard` en `components/common/`
- [ ] Fase 4: `LandingPage` ensambla todas las secciones
- [ ] Fase 4: Router configurado con ruta `/`
- [ ] Fase 4: `App.tsx` limpio, solo renderiza `AppRoutes`
- [ ] Fase 5: Responsive verificado en mobile, tablet, desktop
- [ ] Fase 5: Colores solo vía theme, sin hardcoded
- [ ] Fase 6: READMEs en todas las carpetas nuevas
- [ ] Fase 6: `DECISIONS.md` completo

---

## Orden de ejecución recomendado para el agente

> Ejecutar las fases **en orden secuencial**. Dentro de cada fase, los archivos pueden crearse en paralelo.

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
```

**No saltar fases.** La Fase 3 depende de los componentes de Fase 1. La Fase 4 depende de Fase 2 y 3. La Fase 5 valida todo lo anterior.
