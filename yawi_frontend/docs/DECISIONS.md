# Architectural Decisions Record — Milestone 1

Este documento registra formalmente las decisiones de arquitectura, tecnologías y diseño adoptadas durante la implementación del **Milestone 1 (Landing Page)** para el frontend de Yawi.

---

## Registro de Decisiones

| # | Decisión | Opciones consideradas | Elección | Justificación |
|---|---|---|---|---|
| **1** | **State Management** | Redux Toolkit, Zustand | **Zustand** | Mayor ligereza, menor boilerplate y curva de aprendizaje más rápida para el desarrollo ágil del MVP. Aunque `ARCHITECTURE.md` sugería Redux Toolkit, el equipo acordó priorizar la velocidad y simplicidad con Zustand. |
| **2** | **Path Alias (`@/`)** | Configurar en M1, Diferir a M2 | **Diferido a M2** | El Milestone 1 cuenta con una estructura modular con pocos archivos cruzados. Para evitar fricción con herramientas de linting y compilación en la fase inicial, se utiliza importación relativa limpia y se estandarizará el alias en M2. |
| **3** | **Librería de Iconos** | Lucide React, React Icons, SVGs manuales | **Lucide React** | Soporte nativo de tree-shaking, consistencia estética con estilo *outline* moderno y peso mínimo en el bundle final. |
| **4** | **Carrusel de Productos** | Swiper.js, Embla Carousel, CSS scroll-snap | **CSS scroll-snap** | Proporciona navegación nativa, fluida y con aceleración por hardware tanto en móvil como en escritorio, sin añadir dependencias externas ni sobrecargar el bundle. |
| **5** | **Versión de Tailwind CSS** | Tailwind v3, Tailwind v4 | **Tailwind CSS v4** | Configuración nativa en CSS mediante `@theme`, eliminación del archivo `tailwind.config.js`, mejor rendimiento de compilación con `@tailwindcss/vite` y enfoque moderno. |
| **6** | **Tipografía Principal** | Inter, Outfit, Poppins | **Inter** | Excelente legibilidad en pantallas de distintas densidades, soporte completo de pesos (400 a 800) y estilo sobrio que realza los elementos visuales del catálogo artesanal. |
| **7** | **Internacionalización (i18n)** | react-i18next, Solución propia | **react-i18next** | Estándar maduro de la industria con soporte para namespaces divididos, interpolación segura y detección de idioma en el navegador. |
| **8** | **Idioma por Defecto** | Español, Detección automática | **Español (`es`)** | El mercado primario y los artesanos asociados pertenecen a Latinoamérica, manteniendo el soporte inmediato de alternancia hacia inglés (`en`). |
| **9** | **Sección Explorar Latam** | Mapa interactivo SVG/Leaflet, Tarjetas de países | **Tarjetas de países** | Permite una visualización clara del estado de cobertura regional (activos vs. próximamente) sin la sobrecarga de dependencias cartográficas pesadas en el MVP. |

---

## Decisiones Diferidas a Futuros Milestones

- **TanStack Query (React Query)**: Integración en Milestone 2 al conectar los endpoints de `yawi_api`.
- **Supabase Client Setup (`src/lib/supabase.ts`)**: Integración en Milestone 2 con autenticación real.
- **Route Guards (`RequireAuth`, `RequireRole`)**: Configuración en Milestone 2+ al incorporar flujos de usuario y compras.
- **Pruebas End-to-End con Playwright**: Implementación en Milestone 3+ una vez estabilizados los flujos completos.
- **Soporte de Modo Oscuro (Dark Mode)**: Evaluado para versiones posteriores del producto.
