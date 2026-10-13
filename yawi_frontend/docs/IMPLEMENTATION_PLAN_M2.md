# Plan de Implementación — Milestone 2: Landing Page "Vender con Yawi"

## Meta

Entregar la landing page orientada a artesanos y negocios locales (`/vender`) como una nueva ruta independiente dentro del frontend de Yawi, incluyendo:

- Nuevas secciones de contenido específicas para el segmento vendedor
- Navegación actualizada con routing real entre `/` y `/vender`
- Namespace i18n dedicado (`seller`) con traducciones completas en ES/EN
- Archivo JSON de imágenes colocado junto al feature `seller`
- Señalización de ítem activo en la Navbar ("Vender con Yawi") cuando `pathname === '/vender'`
- Reutilización de todos los componentes del Design System (`Button`, `Card`, `SectionContainer`, `ImagePlaceholder`, `Badge`) y del Layout global (`AppLayout` con Navbar + Footer)
- Cumplimiento estricto de la paleta, tipografía y reglas de diseño de `DESIGN.md`

> **Alcance:** Solo `yawi_frontend/`. No se modifica `yawi_api/`, `yawi_n8n/` ni infraestructura Docker. No se implementan conexiones reales con el backend.

---

## Índice

1. [Contexto y estado actual](#1-contexto-y-estado-actual)
2. [Decisiones tomadas antes del plan](#2-decisiones-tomadas-antes-del-plan)
3. [Fase 0 — Preparación: Routing y Navbar](#fase-0--preparación-routing-y-navbar)
4. [Fase 1 — i18n: Namespace seller](#fase-1--i18n-namespace-seller)
5. [Fase 2 — Configuración de imágenes](#fase-2--configuración-de-imágenes)
6. [Fase 3 — Secciones del feature seller](#fase-3--secciones-del-feature-seller)
7. [Fase 4 — Ensamblaje de la página](#fase-4--ensamblaje-de-la-página)
8. [Fase 5 — Pulido, Responsive y QA](#fase-5--pulido-responsive-y-qa)
9. [Fase 6 — Documentación y READMEs](#fase-6--documentación-y-readmes)
10. [Árbol de archivos final](#árbol-de-archivos-final)
11. [Criterios de aceptación](#criterios-de-aceptación)
12. [Checklist final](#checklist-final)

---

## 1. Contexto y estado actual

El Milestone 1 entregó:

- **Design system completo** en `src/components/ui/`: `Button`, `Card`, `Badge`, `SectionContainer`, `ImagePlaceholder`, `Skeleton`.
- **Layout global** en `src/components/layout/`: `Navbar`, `Footer`, `AppLayout`. La Navbar usa `NavLinks` con `NAV_ITEMS` hardcodeados con hash anchors para la landing `/`.
- **Feature `landing`** en `src/features/landing/` con 9 secciones implementadas.
- **Routing** en `src/routes/index.tsx` con una única ruta `/` envuelta en `AppLayout`.
- **i18n** configurado en `src/i18n/i18n.ts` con namespaces: `common`, `landing`, `nav`, `footer`.
- **`index.css`** con `@theme` centralizado — fuente única de verdad para colores. Ningún color hex debe estar en componentes.

Lo que M2 añade:

- Ruta `/vender` con nueva página `SellerLandingPage`.
- Refactor de `NavLinks.tsx` para usar `react-router-dom` `NavLink` y detectar pathname activo (no solo hash).
- Namespace i18n `seller` (ES + EN).
- Feature `src/features/seller/` con sus 9 componentes de sección.

---

## 2. Decisiones tomadas antes del plan

| #      | Decisión                                            | Elección                                                                                                                                                    | Justificación                                                                                                                                                    |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **10** | **Ubicación del feature**                           | `features/seller/` (nuevo feature independiente)                                                                                                            | Cada capacidad de negocio tiene su propio vertical slice según `ARCHITECTURE.md`. Mezclarlo con `features/landing/` violaría la separación de responsabilidades. |
| **11** | **Namespace i18n**                                  | `seller` → `es/seller.json` y `en/seller.json`                                                                                                              | Separación limpia de namespaces. Evita contaminar `landing.json` con texto de otro segmento de usuarios.                                                         |
| **12** | **Routing del ítem "Vender con Yawi"**              | Ruta real `/vender` con `react-router-dom` `NavLink`                                                                                                        | Permite el marcado activo basado en `pathname`, navegación real entre páginas, y que el layout se mantenga constante (ambas rutas usan `AppLayout`).             |
| **13** | **Links del menú desde `/vender`**                  | Links apuntan a rutas absolutas: `Inicio → /`, `Explorar → /#categories`, `Artesanos → /#testimonials`, `Sobre Yawi → /#story`, `Vender con Yawi → /vender` | Los hash anchors solo son válidos en la página que los contiene. Rutas absolutas garantizan navegación correcta desde cualquier página.                          |
| **14** | **CTA "Quiero vender con Yawi" / "Comenzar ahora"** | Placeholder `href="#registro"` (anchor en la misma página para scroll)                                                                                      | Sin backend disponible en M2. La sección `SellerFinalCtaSection` tiene `id="registro"`. Documentado como pendiente de integración.                               |
| **15** | **Historia de Yawi — diseño visual**                | Full-width con gradiente `navy → indigo → lavender`, texto blanco, blur/orbs decorativos                                                                    | Elemento más memorable de la marca; requiere tratamiento editorial premium alineado con el Gradient System de `DESIGN.md`.                                       |
| **16** | **"Cómo funciona" — visualización**                 | Timeline horizontal (desktop) / vertical (mobile) con iconos y numeración                                                                                   | Comunica el flujo lineal de 4 pasos de forma clara y escalable. Compatible con el sistema de widgets de `DESIGN.md`.                                             |
| **17** | **Colores en el feature seller**                    | Solo clases Tailwind que referencian `@theme`. Cero valores hex directos en componentes.                                                                    | Regla crítica heredada de M1: cambiar la paleta requiere solo editar `index.css`.                                                                                |

> Registrar decisiones 10–17 en `docs/DECISIONS.md` al finalizar la Fase 6.

---

## Fase 0 — Preparación: Routing y Navbar

> **Objetivo**: Conectar las dos páginas mediante routing real y actualizar la Navbar para señalar el ítem activo correctamente en ambas rutas.

### 0.1 Actualizar `NavLinks.tsx`

**Archivo:** `src/components/layout/Navbar/NavLinks.tsx`

**Cambios requeridos:**

1. Agregar campo `type: 'route' | 'hash'` a la interfaz `NavItem`.
2. Actualizar `NAV_ITEMS`: el ítem `sell` apunta a `/vender` con `type: 'route'`; los demás usan rutas absolutas con hash.
3. Para items `type: 'route'`: renderizar `<NavLink>` de `react-router-dom` con su prop `className` como función que recibe `{ isActive }`.
4. Para items `type: 'hash'`: mantener `<a>` con la lógica actual de hash detection.
5. El ítem `home` usa `<NavLink end>` para evitar que esté activo en `/vender`.

**Interface y NAV_ITEMS actualizados:**

```ts
// Agregar import: import { NavLink } from 'react-router-dom';

export interface NavItem {
  labelKey: string;
  href: string;
  type: 'route' | 'hash';
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'home', href: '/', type: 'route' },
  { labelKey: 'explore', href: '/#categories', type: 'hash' },
  { labelKey: 'artisans', href: '/#testimonials', type: 'hash' },
  { labelKey: 'about', href: '/#story', type: 'hash' },
  { labelKey: 'sell', href: '/vender', type: 'route' },
];
```

**Lógica de renderizado por tipo:**

```tsx
// Items type: 'route'
<NavLink
  key={item.labelKey}
  to={item.href}
  end={item.href === '/'}
  onClick={() => onItemClick?.()}
  className={({ isActive }) =>
    direction === 'row'
      ? isActive
        ? activeLink
        : inactiveLink
      : isActive
        ? activeMobile
        : inactiveMobile
  }
>
  {label}
</NavLink>

// Items type: 'hash' — mantener el <a> existente sin cambios
```

> Los estilos `activeLink`, `inactiveLink`, `activeMobile`, `inactiveMobile` no cambian respecto a M1. No tocar `Navbar.tsx` ni `MobileMenu.tsx`.

### 0.2 Actualizar `src/routes/index.tsx`

Agregar la nueva ruta `/vender` dentro del mismo `<Route element={<AppLayout />}>`:

```tsx
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LandingPage } from '../pages/LandingPage';
import { SellerLandingPage } from '../pages/SellerLandingPage'; // nuevo

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vender" element={<SellerLandingPage />} /> {/* nuevo */}
      </Route>
    </Routes>
  );
}
```

> El barrel export de `SellerLandingPage` se crea en Fase 4.

---

## Fase 1 — i18n: Namespace `seller`

> **Objetivo**: Agregar el namespace `seller` con todas las claves de texto de la landing de artesanos en español e inglés. Todo texto visible en la página debe tener su clave aquí.

### 1.1 Actualizar `src/i18n/i18n.ts`

Agregar los imports y registrar el namespace en el objeto `resources`:

```ts
// Agregar estos dos imports:
import esSeller from './locales/es/seller.json';
import enSeller from './locales/en/seller.json';

// En el objeto resources del .init():
resources: {
  es: { common: esCommon, landing: esLanding, nav: esNav, footer: esFooter, seller: esSeller },
  en: { common: enCommon, landing: enLanding, nav: enNav, footer: enFooter, seller: enSeller },
},
```

### 1.2 Crear `src/i18n/locales/es/seller.json`

```json
{
  "meta": {
    "title": "Vender con Yawi — Lleva tu negocio al mundo",
    "description": "Vende internacionalmente sin necesidad de una página web, conocimientos técnicos o sistemas complicados."
  },
  "hero": {
    "title": "Lleva tu negocio local al mundo",
    "subtitle": "Vende internacionalmente sin necesidad de una página web, conocimientos técnicos o sistemas complicados.",
    "cta_primary": "Quiero vender con Yawi",
    "image_alt": "Artesana con sus productos"
  },
  "problem": {
    "title": "Muchos artesanos enfrentan:",
    "image_alt": "Artesano trabajando",
    "cards": [
      { "text": "Clientes limitados a su zona" },
      { "text": "Dificultades para exportar" },
      { "text": "Falta de visibilidad" },
      { "text": "Procesos tecnológicos complejos" },
      { "text": "Dificultades para recibir pagos internacionales" }
    ]
  },
  "how_yawi_helps": {
    "title": "Cómo ayuda Yawi",
    "blocks": [
      {
        "heading": "Más clientes",
        "text": "Acceso a compradores internacionales.",
        "image_alt": "Clientes internacionales"
      },
      {
        "heading": "Más ingresos",
        "text": "Aumenta el alcance de tus productos y mejora tus oportunidades de venta.",
        "image_alt": "Ingresos crecientes"
      },
      {
        "heading": "Más simple",
        "text": "Gestiona tu negocio utilizando canales familiares como WhatsApp.",
        "image_alt": "Gestión sencilla por WhatsApp"
      }
    ]
  },
  "promise": {
    "title": "Crecimiento real para tu negocio.",
    "benefits": [
      "Alcance internacional",
      "Gestión sencilla",
      "Soporte logístico",
      "Recepción de ingresos simplificada",
      "Más visibilidad para tus productos"
    ]
  },
  "early_allies": {
    "title": "Beneficios para los primeros aliados",
    "launch_badge": "Oferta de lanzamiento",
    "tiers": [
      {
        "label": "Primeros 50 emprendedores",
        "benefit": "Prioridad en recomendaciones durante 1 año."
      },
      {
        "label": "Nuevos emprendedores",
        "benefit": "Una semana de prioridad en recomendaciones."
      },
      {
        "label": "Lanzamiento",
        "benefit": "Primer mes con 50% de descuento en comisión."
      }
    ]
  },
  "how_it_works": {
    "title": "Cómo funciona",
    "steps": [
      {
        "number": "01",
        "title": "Regístrate",
        "description": "Crea tu cuenta en minutos. Sin formularios complicados."
      },
      {
        "number": "02",
        "title": "Comparte información de tus productos",
        "description": "Envíanos fotos y detalles de tus productos por WhatsApp."
      },
      {
        "number": "03",
        "title": "Yawi publica y promociona",
        "description": "Nos encargamos de publicar, traducir y promocionar tus productos."
      },
      {
        "number": "04",
        "title": "Recibe pedidos e ingresos",
        "description": "Te notificamos los pedidos y recibes tus ingresos directamente."
      }
    ]
  },
  "markets": {
    "title": "Mercados disponibles",
    "active_label": "Activo",
    "coming_soon_label": "Próximamente",
    "items": [
      { "flag": "🇺🇸", "name": "Estados Unidos", "status": "active" },
      { "flag": "🇪🇸", "name": "España", "status": "coming_soon" },
      { "flag": "🇬🇧", "name": "Reino Unido", "status": "coming_soon" }
    ]
  },
  "story": {
    "title": "¿Qué significa Yawi?",
    "text": "Yawi nace de una palabra de origen náhuat asociada al movimiento y al acto de llevar algo de un lugar a otro. Nuestro propósito es llevar el talento, la cultura y el trabajo de los artesanos latinoamericanos hacia nuevos mercados y nuevas oportunidades.",
    "image_alt": "Artesana trabajando en su taller"
  },
  "final_cta": {
    "title": "Únete a los artesanos que están llevando Latinoamérica al mundo",
    "button": "Comenzar ahora"
  }
}
```

### 1.3 Crear `src/i18n/locales/en/seller.json`

```json
{
  "meta": {
    "title": "Sell with Yawi — Take your business global",
    "description": "Sell internationally without needing a website, technical knowledge, or complicated systems."
  },
  "hero": {
    "title": "Take your local business to the world",
    "subtitle": "Sell internationally without needing a website, technical knowledge, or complicated systems.",
    "cta_primary": "I want to sell with Yawi",
    "image_alt": "Artisan with her products"
  },
  "problem": {
    "title": "Many artisans face:",
    "image_alt": "Artisan at work",
    "cards": [
      { "text": "Customers limited to their area" },
      { "text": "Difficulties exporting" },
      { "text": "Lack of visibility" },
      { "text": "Complex technological processes" },
      { "text": "Difficulties receiving international payments" }
    ]
  },
  "how_yawi_helps": {
    "title": "How Yawi helps",
    "blocks": [
      {
        "heading": "More customers",
        "text": "Access to international buyers.",
        "image_alt": "International customers"
      },
      {
        "heading": "More income",
        "text": "Expand the reach of your products and improve your sales opportunities.",
        "image_alt": "Growing income"
      },
      {
        "heading": "Simpler",
        "text": "Manage your business using familiar channels like WhatsApp.",
        "image_alt": "Simple WhatsApp management"
      }
    ]
  },
  "promise": {
    "title": "Real growth for your business.",
    "benefits": [
      "International reach",
      "Simple management",
      "Logistics support",
      "Simplified income reception",
      "More visibility for your products"
    ]
  },
  "early_allies": {
    "title": "Benefits for early partners",
    "launch_badge": "Launch offer",
    "tiers": [
      {
        "label": "First 50 entrepreneurs",
        "benefit": "Priority in recommendations for 1 year."
      },
      {
        "label": "New entrepreneurs",
        "benefit": "One week of priority in recommendations."
      },
      {
        "label": "Launch",
        "benefit": "First month with 50% discount on commission."
      }
    ]
  },
  "how_it_works": {
    "title": "How it works",
    "steps": [
      {
        "number": "01",
        "title": "Sign up",
        "description": "Create your account in minutes. No complicated forms."
      },
      {
        "number": "02",
        "title": "Share your product information",
        "description": "Send us photos and product details via WhatsApp."
      },
      {
        "number": "03",
        "title": "Yawi publishes and promotes",
        "description": "We handle publishing, translating, and promoting your products."
      },
      {
        "number": "04",
        "title": "Receive orders and income",
        "description": "We notify you of orders and you receive your income directly."
      }
    ]
  },
  "markets": {
    "title": "Available markets",
    "active_label": "Active",
    "coming_soon_label": "Coming soon",
    "items": [
      { "flag": "🇺🇸", "name": "United States", "status": "active" },
      { "flag": "🇪🇸", "name": "Spain", "status": "coming_soon" },
      { "flag": "🇬🇧", "name": "United Kingdom", "status": "coming_soon" }
    ]
  },
  "story": {
    "title": "What does Yawi mean?",
    "text": "Yawi comes from a word of Náhuat origin associated with movement and the act of carrying something from one place to another. Our purpose is to carry the talent, culture, and work of Latin American artisans to new markets and new opportunities.",
    "image_alt": "Artisan working in their workshop"
  },
  "final_cta": {
    "title": "Join the artisans bringing Latin America to the world",
    "button": "Get started now"
  }
}
```

---

## Fase 2 — Configuración de imágenes

> **Objetivo**: Crear el JSON de imágenes del feature `seller` para que los componentes las carguen dinámicamente sin modificar código fuente.

### 2.1 Crear `src/features/seller/seller-images.json`

```json
{
  "hero": {
    "src": "",
    "alt": "hero.image_alt"
  },
  "problem": {
    "src": "",
    "alt": "problem.image_alt"
  },
  "how_yawi_helps": {
    "blocks": [
      { "id": "customers", "src": "", "alt": "how_yawi_helps.blocks.0.image_alt" },
      { "id": "income", "src": "", "alt": "how_yawi_helps.blocks.1.image_alt" },
      { "id": "simple", "src": "", "alt": "how_yawi_helps.blocks.2.image_alt" }
    ]
  },
  "story": {
    "src": "",
    "alt": "story.image_alt"
  }
}
```

> **Convención**: Los valores `alt` son claves i18n del namespace `seller`. Se resuelven con `t(entry.alt)` en cada componente. Los valores `src` vacíos hacen que `ImagePlaceholder` muestre el skeleton automáticamente. Para agregar imágenes reales, solo se modifica este archivo.

---

## Fase 3 — Secciones del feature `seller`

> **Ubicación:** `src/features/seller/components/`
>
> **Reglas críticas de esta fase:**
>
> - Todo texto proviene de `useTranslation('seller')`. Cero strings hardcoded.
> - Los colores usan **solo** clases Tailwind con variables de `@theme`. **Cero hex directos en componentes.**
> - Imágenes vienen de `seller-images.json` importado estáticamente al inicio del componente.
> - Reutilizar `Button`, `Card`, `Badge`, `SectionContainer`, `ImagePlaceholder` del design system (`src/components/ui/`).
> - Componentes con menos de ~150 líneas. Extraer subcomponentes si se excede.
> - Los componentes de sección son autocontenidos: consumen i18n internamente, no reciben texto como props desde la página.

---

### 3.1 `SellerHeroSection`

```
src/features/seller/components/SellerHeroSection/
  SellerHeroSection.tsx
  SellerHeroSection.test.tsx
  index.ts
```

**Diseño visual:**

- Contenedor: `<SectionContainer id="seller-hero">` con `className="relative overflow-hidden min-h-[70vh] flex items-center"`.
- Fondo: `bg-background` con dos orbs decorativos posicionados con `absolute`:
  - Orb 1: `bg-soft-lavender/30 w-96 h-96 blur-3xl rounded-full` — arriba-derecha (`-translate-y-1/2 translate-x-1/2`).
  - Orb 2: `bg-primary-indigo/10 w-64 h-64 blur-3xl rounded-full` — abajo-izquierda (`translate-y-1/2 -translate-x-1/2`).
  - Ambos con `pointer-events-none` para no interferir con el contenido.
- **Desktop (md+):** Grid `grid-cols-1 md:grid-cols-2 gap-12 items-center`.
- **Mobile:** Stack vertical (grids de 1 col).

**Columna izquierda (contenido):**

- `<h1>` con `text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-primary-navy`.
- `<p>` subtítulo con `text-lg md:text-xl text-muted-text leading-relaxed max-w-xl`.
- `<Button variant="primary" size="lg" as="a" href="#registro">` con el texto de `t('hero.cta_primary')`.

**Columna derecha (imagen):**

- `<ImagePlaceholder>` con `className="rounded-card shadow-card-hover w-full h-80 md:h-[420px]"`.
- `src` y `alt` (resuelto con `t(...)`) obtenidos de `seller-images.json → hero`.

**Test mínimo requerido (`SellerHeroSection.test.tsx`):**

- Verifica que el `<h1>` se renderiza con la clave de traducción correcta.
- Verifica que el botón CTA tiene `href="#registro"`.

---

### 3.2 `SellerProblemSection`

```
src/features/seller/components/SellerProblemSection/
  SellerProblemSection.tsx
  index.ts
```

**Diseño visual:**

- `<SectionContainer background="surface">` para contraste con la sección anterior.
- Título centrado: `text-2xl md:text-3xl font-bold text-primary-navy text-center mb-10`.
- Grid de 5 cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
  - En `lg`: distribución 3+2 (la última fila se centra).
- Cada card: `<Card hoverable>` con ícono de Lucide + texto.

**Estructura de cada card:**

```
[Ícono en círculo lavanda]
Texto del problema
```

Íconos Lucide asignados por índice del array `problem.cards`:

| Índice | Texto                                           | Ícono        |
| ------ | ----------------------------------------------- | ------------ |
| 0      | Clientes limitados a su zona                    | `MapPin`     |
| 1      | Dificultades para exportar                      | `Globe`      |
| 2      | Falta de visibilidad                            | `Eye`        |
| 3      | Procesos tecnológicos complejos                 | `Monitor`    |
| 4      | Dificultades para recibir pagos internacionales | `CreditCard` |

Contenedor del ícono: `<div className="p-3 bg-soft-lavender/20 rounded-full">` con el ícono en `text-primary-indigo w-6 h-6`.

---

### 3.3 `SellerHowYawiHelpsSection`

```
src/features/seller/components/SellerHowYawiHelpsSection/
  SellerHowYawiHelpsSection.tsx
  index.ts
```

**Diseño visual:**

- `<SectionContainer background="default">`.
- Título centrado.
- Grid de 3 bloques: `grid-cols-1 md:grid-cols-3 gap-8`.
- Cada bloque: `<Card hoverable>` con `flex flex-col items-center text-center gap-4 p-8`.

**Estructura de cada bloque:**

```
[Ícono en círculo lavanda grande (p-4)]
Heading (text-xl font-bold text-primary-navy)
Texto (text-muted-text leading-relaxed)
```

Íconos Lucide asignados por índice del array `how_yawi_helps.blocks`:

| Índice | Heading      | Ícono           |
| ------ | ------------ | --------------- |
| 0      | Más clientes | `Users`         |
| 1      | Más ingresos | `TrendingUp`    |
| 2      | Más simple   | `MessageCircle` |

Contenedor del ícono: `<div className="p-4 bg-soft-lavender/30 rounded-full">` con ícono en `text-primary-navy w-8 h-8`.

---

### 3.4 `SellerPromiseSection`

```
src/features/seller/components/SellerPromiseSection/
  SellerPromiseSection.tsx
  index.ts
```

**Diseño visual (debe resaltar visualmente — sección destacada):**

- Sección con fondo gradiente. Usar `<SectionContainer>` con `className` que sobreescriba el fondo:
  - Primero intentar clases Tailwind v4: `bg-gradient-to-br from-primary-navy via-primary-indigo to-soft-lavender`.
  - Si Tailwind v4 no resuelve las variables del `@theme` como gradientes, usar inline style: `style={{ background: 'linear-gradient(135deg, var(--color-primary-navy), var(--color-primary-indigo), var(--color-soft-lavender))' }}`.
  - Documentar la solución elegida en `docs/DECISIONS.md`.
- Todo el texto en `text-white`.
- Orb decorativo de calidez: `bg-peach-accent/20 blur-3xl w-64 h-64 absolute` en una esquina con `pointer-events-none`.
- Padding vertical generoso: mínimo `py-24 md:py-32`.

**Estructura de contenido (centrado):**

- Título: `text-3xl md:text-4xl font-extrabold text-white text-center mb-10`.
- Lista de beneficios como pills en `flex flex-wrap justify-center gap-3`:
  - Cada pill: `flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-button px-5 py-2.5 text-white font-medium text-sm`.
  - Ícono izquierdo de cada pill: `<CheckCircle className="w-4 h-4 text-peach-accent flex-shrink-0" />`.
  - Texto: `t('promise.benefits[i]')`.

---

### 3.5 `SellerEarlyAlliesSection`

```
src/features/seller/components/SellerEarlyAlliesSection/
  SellerEarlyAlliesSection.tsx
  index.ts
```

**Diseño visual (sección destacada):**

- `<SectionContainer background="surface">`.
- Banda decorativa superior: `<div className="w-full h-1 bg-peach-accent/40 mb-12" />` dentro del contenedor.
- Encabezado centrado:
  - `<Badge variant="accent" className="mb-4">` con `t('early_allies.launch_badge')`.
  - Título: `text-2xl md:text-3xl font-bold text-primary-navy text-center`.
- Grid de 3 tiers: `grid-cols-1 md:grid-cols-3 gap-6 mt-10`.

**Estilo diferenciado de tiers:**

- **Tier 0** ("Primeros 50 emprendedores"): `<Card className="border-2 border-peach-accent shadow-card-hover">`.
- **Tiers 1 y 2**: `<Card>` estándar sin clases adicionales.

**Estructura de cada card:**

```
[Ícono (text-peach-accent)]
Etiqueta del tier (pill pequeño bg-peach-accent/20)
Texto del beneficio
```

Íconos Lucide por tier:

| Índice | Label                     | Ícono  |
| ------ | ------------------------- | ------ |
| 0      | Primeros 50 emprendedores | `Star` |
| 1      | Nuevos emprendedores      | `Gift` |
| 2      | Lanzamiento               | `Tag`  |

---

### 3.6 `SellerHowItWorksSection`

```
src/features/seller/components/SellerHowItWorksSection/
  SellerHowItWorksSection.tsx
  index.ts
```

**Diseño visual:**

- `<SectionContainer background="default">`.
- Título centrado.
- Contenedor del timeline con `relative mt-12`:
  - **Línea conectora (solo desktop):** `<div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-primary-indigo/20" />`.
  - Grid de pasos: `grid-cols-1 md:grid-cols-4 gap-8`.

**Estructura de cada paso:**

```
[Círculo numerado — fondo navy, texto blanco, z-10 relativo]
[Ícono del paso — text-primary-indigo]
Título del paso (font-bold text-primary-navy)
Descripción (text-sm text-muted-text, max-w restringido para legibilidad)
```

- Círculo numerado: `w-14 h-14 rounded-full bg-primary-navy text-white font-extrabold text-lg flex items-center justify-center shadow-card relative z-10`.
- Layout del paso: `flex flex-col items-center text-center gap-3`.
- Descripción: `max-w-[180px]` para forzar saltos de línea cómodos.

Íconos Lucide por paso:

| Paso | Título                    | Ícono       |
| ---- | ------------------------- | ----------- |
| 01   | Regístrate                | `UserPlus`  |
| 02   | Comparte información      | `Camera`    |
| 03   | Yawi publica y promociona | `Megaphone` |
| 04   | Recibe pedidos e ingresos | `Inbox`     |

---

### 3.7 `SellerMarketsSection`

```
src/features/seller/components/SellerMarketsSection/
  SellerMarketsSection.tsx
  index.ts
```

**Diseño visual:**

- `<SectionContainer background="surface">`.
- Título centrado.
- Grid de 3 mercados: `grid-cols-1 sm:grid-cols-3 gap-6 mt-10`.

**Card por mercado:**

- Mercado `status: 'active'`: `<Card className="border-2 border-primary-indigo shadow-card-hover">` — destacado visualmente.
- Mercado `status: 'coming_soon'`: `<Card className="opacity-80">` — levemente atenuado.

**Estructura de cada card (centrada):**

```
[Emoji de bandera — text-5xl]
Nombre del país (text-xl font-bold text-primary-navy)
Badge de estado:
  - active     → <Badge variant="accent"> con ícono CheckCircle + t('markets.active_label')
  - coming_soon → <Badge variant="outline"> con t('markets.coming_soon_label')
```

Los datos de `markets.items` se obtienen directamente de `t('markets.items', { returnObjects: true })`.

---

### 3.8 `SellerStorySection`

```
src/features/seller/components/SellerStorySection/
  SellerStorySection.tsx
  index.ts
```

**Diseño visual (elemento más memorable — tratamiento editorial premium):**

- Sección full-width. **No** usar `<SectionContainer>` con prop `background`; aplicar el gradiente directamente a un `<section>` manual para tener control total.
- Estructura del elemento `<section>`:
  ```
  <section className="relative overflow-hidden py-24 md:py-32"
           style={{ background: 'linear-gradient(135deg, var(--color-primary-navy) 0%, var(--color-primary-indigo) 55%, var(--color-soft-lavender) 100%)' }}>
  ```
- **Orbs decorativos** (`absolute`, `pointer-events-none`, fuera del flujo):
  - Orb superior-derecha: `bg-soft-lavender/20 blur-[80px] w-[400px] h-[400px]`.
  - Orb inferior-izquierda: `bg-peach-accent/15 blur-[60px] w-[300px] h-[300px]`.
  - Orb central: `bg-primary-indigo/30 blur-[100px] w-[500px] h-[500px] -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2`.
- Contenido principal: `<div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">`.

**Estructura del contenido (de arriba hacia abajo):**

```
[Ícono decorativo — BookOpen, text-soft-lavender, w-10 h-10, mx-auto mb-6]
<h2> Título — text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4
[Línea decorativa — div w-16 h-1 bg-peach-accent mx-auto rounded-full mb-8]
<p> Texto del origen — text-white/85 text-lg md:text-xl leading-relaxed
```

---

### 3.9 `SellerFinalCtaSection`

```
src/features/seller/components/SellerFinalCtaSection/
  SellerFinalCtaSection.tsx
  index.ts
```

**Diseño visual:**

- `<SectionContainer id="registro" background="default">`.
  - El `id="registro"` actúa como anchor de scroll para los CTAs de `SellerHeroSection`.
- Layout centrado, columna única.
- Padding vertical generoso: verificar que `SectionContainer` tenga al menos `py-24`.

**Estructura de contenido (centrada):**

```
[Línea decorativa superior — div w-24 h-1 bg-primary-indigo mx-auto rounded-full mb-6]
<h2> Título — text-3xl md:text-4xl font-extrabold text-primary-navy text-center mb-8 max-w-2xl mx-auto
<Button variant="cta" size="lg" as="a" href="#registro"> — peach accent
```

---

### 3.10 Barrel export del feature `seller`

**Archivo:** `src/features/seller/index.ts`

```ts
export { SellerHeroSection } from './components/SellerHeroSection';
export { SellerProblemSection } from './components/SellerProblemSection';
export { SellerHowYawiHelpsSection } from './components/SellerHowYawiHelpsSection';
export { SellerPromiseSection } from './components/SellerPromiseSection';
export { SellerEarlyAlliesSection } from './components/SellerEarlyAlliesSection';
export { SellerHowItWorksSection } from './components/SellerHowItWorksSection';
export { SellerMarketsSection } from './components/SellerMarketsSection';
export { SellerStorySection } from './components/SellerStorySection';
export { SellerFinalCtaSection } from './components/SellerFinalCtaSection';
```

---

## Fase 4 — Ensamblaje de la página

### 4.1 Crear `src/pages/SellerLandingPage/SellerLandingPage.tsx`

```tsx
import {
  SellerHeroSection,
  SellerProblemSection,
  SellerHowYawiHelpsSection,
  SellerPromiseSection,
  SellerEarlyAlliesSection,
  SellerHowItWorksSection,
  SellerMarketsSection,
  SellerStorySection,
  SellerFinalCtaSection,
} from '../../features/seller';

export default function SellerLandingPage() {
  return (
    <>
      <SellerHeroSection />
      <SellerProblemSection />
      <SellerHowYawiHelpsSection />
      <SellerPromiseSection />
      <SellerEarlyAlliesSection />
      <SellerHowItWorksSection />
      <SellerMarketsSection />
      <SellerStorySection />
      <SellerFinalCtaSection />
    </>
  );
}
```

### 4.2 Crear `src/pages/SellerLandingPage/index.ts`

```ts
export { default as SellerLandingPage } from './SellerLandingPage';
```

> **Regla arquitectónica**: La página es **solo composición**. No tiene lógica propia, no importa de `api/` ni `store/`. Sigue la regla de `ARCHITECTURE.md`: `pages → features → components`.

---

## Fase 5 — Pulido, Responsive y QA

### 5.1 Revisión responsive

Verificar **cada sección** en los siguientes breakpoints:

| Breakpoint | Ancho      | Comportamiento esperado                                                                            |
| ---------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Mobile     | < 640px    | 1 columna en todas las secciones, tipografía reducida, CTAs 100% ancho, timeline en stack vertical |
| Tablet     | 640–1023px | 2 columnas donde aplique, grids adaptativos                                                        |
| Desktop    | ≥ 1024px   | Hero 2 col, timeline horizontal, grids de 3-4 col                                                  |

### 5.2 Checklist por sección

Para **cada** sección del feature `seller` verificar:

- [ ] Textos vienen de `useTranslation('seller')` — cero strings hardcoded
- [ ] Imágenes vienen de `seller-images.json` vía `ImagePlaceholder`
- [ ] Se ve bien en mobile (320px mínimo sin scroll horizontal)
- [ ] Se ve bien en tablet (768px)
- [ ] Se ve bien en desktop (1280px)
- [ ] Colores usan **solo** clases Tailwind que referencian `@theme` — cero hex hardcoded en componentes
- [ ] Espaciado entre secciones es consistente (80–140px según `DESIGN.md`)
- [ ] Hover effects funcionan en cards (`translateY(-4px)` + sombra suave)
- [ ] `ImagePlaceholder` muestra skeleton cuando `src` está vacío

### 5.3 Verificar Navbar activo

- En `/vender`: el ítem "Vender con Yawi" tiene estilo activo (bold + underline indigo en desktop; fondo lavender en mobile).
- En `/`: el ítem "Inicio" tiene estilo activo; "Vender con Yawi" está inactivo.
- Desde `/vender`: click en "Explorar" → navega a `/#categories`.
- Desde `/vender`: click en "Artesanos" → navega a `/#testimonials`.
- Desde `/vender`: click en "Inicio" → navega a `/`.

### 5.4 Accesibilidad básica

- Un único `<h1>` por página — en `SellerHeroSection`. Todos los demás títulos de sección son `<h2>`. Sub-secciones usan `<h3>`.
- Todos los `<img>` tienen `alt` descriptivos obtenidos de las traducciones i18n.
- Contraste texto blanco sobre gradiente `primary-navy`/`primary-indigo` cumple WCAG AA.
- Focus visible en todos los botones CTA.
- `SellerFinalCtaSection` tiene `id="registro"` para el anchor de scroll.

### 5.5 Verificar gradiente en `SellerStorySection` y `SellerPromiseSection`

1. Probar primero con clases Tailwind: `bg-gradient-to-br from-primary-navy via-primary-indigo to-soft-lavender`.
2. Si Tailwind v4 no las resuelve con variables del `@theme`, usar inline style:
   ```tsx
   style={{ background: 'linear-gradient(135deg, var(--color-primary-navy), var(--color-primary-indigo), var(--color-soft-lavender))' }}
   ```
3. Documentar la solución adoptada en `docs/DECISIONS.md`.

---

## Fase 6 — Documentación y READMEs

### 6.1 READMEs por carpeta nueva

Crear un `README.md` en cada carpeta nueva con la estructura estándar del proyecto:

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

**Carpetas que requieren `README.md`:**

- `src/features/seller/`
- `src/features/seller/components/`
- `src/pages/SellerLandingPage/`

### 6.2 Actualizar `docs/DECISIONS.md`

Agregar una nueva sección **"Milestone 2 — Landing Page Vender con Yawi"** con las decisiones 10–17 detalladas en la [sección 2 de este plan](#2-decisiones-tomadas-antes-del-plan).

---

## Árbol de archivos final

```
yawi_frontend/
  docs/
    DECISIONS.md                              (actualizado: decisiones 10–17)
    IMPLEMENTATION_PLAN_M2.md                 (este archivo)
  src/
    i18n/
      i18n.ts                                 (modificado: agrega namespace 'seller')
      locales/
        es/
          seller.json                         (nuevo)
        en/
          seller.json                         (nuevo)
    components/
      layout/
        Navbar/
          NavLinks.tsx                        (modificado: NavLink + campo type)
    routes/
      index.tsx                               (modificado: ruta /vender)
    features/
      seller/                                 (nuevo feature)
        README.md
        index.ts
        seller-images.json
        components/
          README.md
          SellerHeroSection/
            SellerHeroSection.tsx
            SellerHeroSection.test.tsx
            index.ts
          SellerProblemSection/
            SellerProblemSection.tsx
            index.ts
          SellerHowYawiHelpsSection/
            SellerHowYawiHelpsSection.tsx
            index.ts
          SellerPromiseSection/
            SellerPromiseSection.tsx
            index.ts
          SellerEarlyAlliesSection/
            SellerEarlyAlliesSection.tsx
            index.ts
          SellerHowItWorksSection/
            SellerHowItWorksSection.tsx
            index.ts
          SellerMarketsSection/
            SellerMarketsSection.tsx
            index.ts
          SellerStorySection/
            SellerStorySection.tsx
            index.ts
          SellerFinalCtaSection/
            SellerFinalCtaSection.tsx
            index.ts
    pages/
      SellerLandingPage/                      (nuevo)
        README.md
        SellerLandingPage.tsx
        index.ts
```

**Resumen de cambios sobre archivos existentes:**

| Archivo                                     | Tipo de cambio | Descripción                                                                              |
| ------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `src/i18n/i18n.ts`                          | Modificado     | Importar y registrar `esSeller` y `enSeller` en `resources`                              |
| `src/components/layout/Navbar/NavLinks.tsx` | Modificado     | Agregar campo `type` a `NavItem`; usar `NavLink` para ítems `route`; `sell → /vender`    |
| `src/routes/index.tsx`                      | Modificado     | Agregar `<Route path="/vender" element={<SellerLandingPage />} />` dentro de `AppLayout` |
| `docs/DECISIONS.md`                         | Modificado     | Agregar sección M2 con decisiones 10–17                                                  |

**Archivos que NO se modifican en este milestone:**

- `src/index.css` — la paleta en `@theme` ya está completa.
- `src/features/landing/` — feature del landing general intacto.
- `src/components/ui/` y `src/components/common/` — solo se consumen.
- `src/components/layout/AppLayout/`, `Footer/`, `Navbar/Navbar.tsx`, `Navbar/MobileMenu.tsx`.

---

## Criterios de aceptación

1. La ruta `/vender` carga en `http://localhost:5173/vender` sin errores de consola.
2. El Layout global (Navbar + Footer) aparece en `/vender` igual que en `/`.
3. En la Navbar, el ítem "Vender con Yawi" tiene estilo activo al estar en `/vender`.
4. En la Navbar, los ítems de hash anchor navegan correctamente a secciones de `/` desde `/vender`.
5. Todos los textos de la página `/vender` provienen del namespace `seller` — sin strings hardcoded.
6. El botón de idioma (ES ↔ EN) traduce toda la página `/vender` correctamente.
7. Las 9 secciones se renderizan en el orden definido en `SellerLandingPage.tsx`.
8. Los CTAs "Quiero vender con Yawi" y "Comenzar ahora" hacen scroll hasta `#registro`.
9. `ImagePlaceholder` muestra skeleton cuando `src` en `seller-images.json` está vacío.
10. Cambiar una imagen de `/vender` requiere modificar **solo** `seller-images.json`.
11. Cambiar un color de la paleta requiere modificar **solo** `src/index.css → @theme`.
12. No hay valores hex/rgb/hsl hardcoded en ningún componente del feature `seller`.
13. La página es navegable en mobile (320px mínimo) sin scroll horizontal ni elementos cortados.
14. `SellerStorySection` tiene gradiente editorial premium con orbs decorativos y tipografía grande.
15. `SellerPromiseSection` tiene fondo gradiente que la diferencia visualmente del resto de secciones.
16. En `SellerEarlyAlliesSection`, el tier "Primeros 50 emprendedores" tiene borde peach accent destacado.
17. `SellerHowItWorksSection` muestra timeline horizontal en desktop y stack vertical en mobile.
18. `npm run build` compila sin errores de TypeScript.
19. Cada carpeta nueva tiene un `README.md`. `docs/DECISIONS.md` está actualizado con decisiones 10–17.

---

## Checklist final

### Fase 0 — Routing y Navbar

- [ ] `NavLinks.tsx` usa `NavLink` de React Router para ítems con `type: 'route'`
- [ ] El ítem `sell` tiene `href: '/vender'` y se marca activo en esa ruta
- [ ] El ítem `home` usa `<NavLink end>` para no quedar activo en `/vender`
- [ ] Los hash anchors navegan a secciones de `/` desde `/vender`
- [ ] `routes/index.tsx` incluye `/vender` dentro del `<Route element={<AppLayout />}>`

### Fase 1 — i18n

- [ ] `i18n.ts` importa y registra `seller` en ES y EN
- [ ] `es/seller.json` tiene todas las secciones: `hero`, `problem`, `how_yawi_helps`, `promise`, `early_allies`, `how_it_works`, `markets`, `story`, `final_cta`
- [ ] `en/seller.json` tiene las mismas claves con traducción correcta al inglés

### Fase 2 — Imágenes

- [ ] `seller-images.json` creado en `src/features/seller/`
- [ ] Incluye entradas para: `hero`, `problem`, `how_yawi_helps.blocks[]`, `story`

### Fase 3 — Componentes (9 secciones)

- [ ] `SellerHeroSection`: `<h1>` + subtítulo + CTA `href="#registro"` + `ImagePlaceholder` + orbs decorativos
- [ ] `SellerProblemSection`: título + 5 `<Card hoverable>` con íconos Lucide en grid
- [ ] `SellerHowYawiHelpsSection`: título + 3 `<Card hoverable>` con íconos, heading y texto
- [ ] `SellerPromiseSection`: fondo gradiente navy→indigo→lavender + beneficios en pills con `CheckCircle` peach
- [ ] `SellerEarlyAlliesSection`: badge "lanzamiento" + 3 tiers (tier 0 con `border-peach-accent` destacado)
- [ ] `SellerHowItWorksSection`: 4 pasos con timeline horizontal (desktop) / vertical (mobile) + línea conectora
- [ ] `SellerMarketsSection`: 3 mercados con emoji bandera + badge `active`/`coming_soon`
- [ ] `SellerStorySection`: full-width gradiente editorial + 3 orbs + `<h2>` grande + línea peach + texto origen
- [ ] `SellerFinalCtaSection`: `id="registro"` + línea decorativa + `<h2>` + `<Button variant="cta">`
- [ ] `src/features/seller/index.ts` exporta los 9 componentes

### Fase 4 — Página

- [ ] `SellerLandingPage.tsx` compone las 9 secciones en el orden correcto
- [ ] `src/pages/SellerLandingPage/index.ts` barrel export creado

### Fase 5 — QA

- [ ] Responsive verificado: 320px, 768px, 1280px para cada sección
- [ ] Navbar activo verificado en `/vender` y en `/`
- [ ] Gradiente de `SellerStorySection` y `SellerPromiseSection` renderiza correctamente
- [ ] Cero colores hex hardcoded en componentes del feature `seller`
- [ ] Un solo `<h1>` en `SellerHeroSection`; demás títulos son `<h2>` o `<h3>`
- [ ] Contraste WCAG AA verificado en secciones con texto blanco sobre fondo oscuro
- [ ] `npm run build` sin errores TypeScript

### Fase 6 — Documentación

- [ ] `README.md` en `src/features/seller/`
- [ ] `README.md` en `src/features/seller/components/`
- [ ] `README.md` en `src/pages/SellerLandingPage/`
- [ ] `docs/DECISIONS.md` actualizado con las decisiones 10–17

---

## Orden de ejecución para el agente implementador

> Ejecutar las fases **en orden secuencial**. Dentro de cada fase los archivos pueden crearse en paralelo salvo que se indique dependencia explícita.

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
```

**Dependencias críticas entre fases:**

- La Fase 3 depende de la Fase 1 (el namespace `seller` debe estar disponible) y de la Fase 2 (`seller-images.json` debe existir).
- La Fase 4 depende de la Fase 3 completa (todos los componentes deben estar exportados en `features/seller/index.ts`).
- La Fase 5 depende de la Fase 4 (la página debe estar ensamblada para hacer QA visual).
- La Fase 6 puede ejecutarse en paralelo con la Fase 5.
