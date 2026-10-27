# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Arquitectura de Rutas y SEO Transaccional

- `/` → Redirección a `/artesanias` (nueva landing transaccional por defecto).
- `/artesanias` → Catálogo principal con banner compacto, categorías visibles y productos destacados (diseño orientado a conversión y acceso directo a productos).
- `/artesanias/:slug` → Vista filtrada por categoría canónica (`barro-ceramica`, `maderas`, `textiles-tejidos`, `joyeria`, `pinturas-arte`, `accesorios`).
- `/cultura-yawi` → Landing cultural original con la narrativa de marca y filosofía comunitaria.
- `/products` → Catálogo general (ruta de compatibilidad legacy).
- `/products/:id` → Detalle de producto.
