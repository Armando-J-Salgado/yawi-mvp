# Architectural Decisions Record — Milestone 1

Este documento registra formalmente las decisiones de arquitectura, tecnologías y diseño adoptadas durante la implementación del **Milestone 1 (Landing Page)** para el frontend de Yawi.

---

## Registro de Decisiones

| #     | Decisión                        | Opciones consideradas                            | Elección               | Justificación                                                                                                                                                                                                                              |
| ----- | ------------------------------- | ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1** | **State Management**            | Redux Toolkit, Zustand                           | **Zustand**            | Mayor ligereza, menor boilerplate y curva de aprendizaje más rápida para el desarrollo ágil del MVP. Aunque `ARCHITECTURE.md` sugería Redux Toolkit, el equipo acordó priorizar la velocidad y simplicidad con Zustand.                    |
| **2** | **Path Alias (`@/`)**           | Configurar en M1, Diferir a M2                   | **Diferido a M2**      | El Milestone 1 cuenta con una estructura modular con pocos archivos cruzados. Para evitar fricción con herramientas de linting y compilación en la fase inicial, se utiliza importación relativa limpia y se estandarizará el alias en M2. |
| **3** | **Librería de Iconos**          | Lucide React, React Icons, SVGs manuales         | **Lucide React**       | Soporte nativo de tree-shaking, consistencia estética con estilo _outline_ moderno y peso mínimo en el bundle final.                                                                                                                       |
| **4** | **Carrusel de Productos**       | Swiper.js, Embla Carousel, CSS scroll-snap       | **CSS scroll-snap**    | Proporciona navegación nativa, fluida y con aceleración por hardware tanto en móvil como en escritorio, sin añadir dependencias externas ni sobrecargar el bundle.                                                                         |
| **5** | **Versión de Tailwind CSS**     | Tailwind v3, Tailwind v4                         | **Tailwind CSS v4**    | Configuración nativa en CSS mediante `@theme`, eliminación del archivo `tailwind.config.js`, mejor rendimiento de compilación con `@tailwindcss/vite` y enfoque moderno.                                                                   |
| **6** | **Tipografía Principal**        | Inter, Outfit, Poppins                           | **Inter**              | Excelente legibilidad en pantallas de distintas densidades, soporte completo de pesos (400 a 800) y estilo sobrio que realza los elementos visuales del catálogo artesanal.                                                                |
| **7** | **Internacionalización (i18n)** | react-i18next, Solución propia                   | **react-i18next**      | Estándar maduro de la industria con soporte para namespaces divididos, interpolación segura y detección de idioma en el navegador.                                                                                                         |
| **8** | **Idioma por Defecto**          | Español, Detección automática                    | **Español (`es`)**     | El mercado primario y los artesanos asociados pertenecen a Latinoamérica, manteniendo el soporte inmediato de alternancia hacia inglés (`en`).                                                                                             |
| **9** | **Sección Explorar Latam**      | Mapa interactivo SVG/Leaflet, Tarjetas de países | **Tarjetas de países** | Permite una visualización clara del estado de cobertura regional (activos vs. próximamente) sin la sobrecarga de dependencias cartográficas pesadas en el MVP.                                                                             |

---

## Milestone 2 — Landing Page "Vender con Yawi"

| #      | Decisión                               | Opciones consideradas                                                        | Elección                                                    | Justificación                                                                                                                                                                         |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **10** | **Ubicación del feature**              | Extender `features/landing/`, Crear nuevo `features/seller/`                 | **`features/seller/`**                                      | Cada capacidad de negocio tiene su propio vertical slice según `ARCHITECTURE.md`. Evita acoplar la landing de compradores con el segmento de artesanos/vendedores.                    |
| **11** | **Namespace i18n**                     | Reutilizar `landing.json`, Crear namespace `seller`                          | **`seller` (`es/seller.json` y `en/seller.json`)**          | Separación limpia de dominios de traducción. Evita sobrecargar `landing.json` con textos exclusivos de captación de artesanos.                                                        |
| **12** | **Routing del ítem "Vender con Yawi"** | Scroll hash `#final-cta`, Ruta real `/vender` con `NavLink`                  | **Ruta real `/vender` con `NavLink`**                       | Permite marcado activo basado en `pathname`, navegación real entre páginas y mantiene el layout común (`AppLayout`).                                                                  |
| **13** | **Links del menú desde `/vender`**     | Mantener hash relativo (`#categories`), Rutas absolutas (`/#categories`)     | **Rutas absolutas (`/#categories`, etc.)**                  | Los hash anchors solo son válidos en la página que los contiene. Rutas absolutas garantizan navegación funcional desde cualquier ruta de la app.                                      |
| **14** | **Destino de CTAs en `/vender`**       | Link externo, Formulario modal, Anchor `#registro`                           | **Anchor `#registro`**                                      | Sin backend disponible en M2, los botones de acción principal hacen scroll suave a la sección final `SellerFinalCtaSection` (`id="registro"`).                                        |
| **15** | **Historia de Yawi — diseño visual**   | Card regular, Full-width editorial con gradiente y orbs                      | **Full-width editorial con gradiente y orbs**               | Es el elemento más memorable de la identidad de marca; requiere tratamiento editorial premium alineado al Gradient System de `DESIGN.md`.                                             |
| **16** | **"Cómo funciona" — visualización**    | Lista de tarjetas simples, Timeline horizontal (desktop) / vertical (mobile) | **Timeline horizontal / vertical con números y conectores** | Comunica el flujo lineal de 4 pasos de incorporación de manera intuitiva y visualmente atractiva.                                                                                     |
| **17** | **Manejo de colores y gradientes**     | Hex en CSS, Clases y variables CSS de `@theme`                               | **Variables de `@theme` (cero hex en componentes)**         | Se utilizan clases de Tailwind CSS v4 y variables CSS nativas (`var(--color-primary-navy)`, etc.) en gradientes inline garantizando fidelidad visual y centralización en `index.css`. |

---

## Decisiones Diferidas a Futuros Milestones

- **TanStack Query (React Query)**: Integración en Milestone 3 al conectar los endpoints de `yawi_api`.
- **Supabase Client Setup (`src/lib/supabase.ts`)**: Integración en Milestone 3 con autenticación real de usuarios/vendedores.
- **Formulario interactivo de registro de artesano**: Reemplazar `#registro` por modal/formulario funcional conectado a API/n8n.
- **Route Guards (`RequireAuth`, `RequireRole`)**: Configuración al incorporar paneles privados de usuario y artesano.
- **Pruebas End-to-End con Playwright**: Implementación una vez estabilizados los flujos completos.
- **Soporte de Modo Oscuro (Dark Mode)**: Evaluado para versiones posteriores del producto.
