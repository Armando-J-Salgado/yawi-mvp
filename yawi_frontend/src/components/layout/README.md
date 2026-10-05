# Layout Components (`src/components/layout`)

## Propósito
Aloja la estructura global y los componentes de shell visual de la aplicación web (Navbar, Footer, AppLayout) que enmarcan las diferentes rutas y páginas.

## Contenido
- `AppLayout/`: Envoltorio principal que renderiza la barra de navegación superior, el `<Outlet />` de enrutamiento y el pie de página global.
- `Navbar/`: Barra de navegación responsive con logo, links navegables (`NAV_ITEMS`), control de cambio de idioma, estado de login y menú lateral deslizable (`MobileMenu`).
- `Footer/`: Pie de página con información institucional, enlaces rápidos, contacto, redes sociales y copyright dinámico.
- `index.ts`: Barrel export de los componentes del layout.

## Reglas
- **Estructura persistente**: Los componentes de layout deben mantenerse consistentes entre cambios de rutas.
- **Extensibilidad**: Modificaciones a los enlaces principales deben realizarse en `NAV_ITEMS` dentro de `NavLinks.tsx`.
- **Textos internacionalizados**: Todos los textos consumen traducciones desde los namespaces `nav` y `footer`.

## Dependencias
- Importa de: `components/ui/`, `store/`, `i18n/`, `assets/`, `react-router-dom`.
- Importado por: `routes/index.tsx`.
