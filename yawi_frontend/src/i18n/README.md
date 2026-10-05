# Internationalization (`src/i18n`)

## Propósito
Gestiona la configuración del sistema de internacionalización (i18n) de Yawi, permitiendo soporte bilingüe (Español / Inglés) con detección y persistencia de idioma.

## Contenido
- `i18n.ts`: Inicialización de la instancia de `i18next` y `react-i18next` con detección de idioma del navegador.
- `locales/es/`: Archivos JSON de traducción en Español (`common.json`, `landing.json`, `nav.json`, `footer.json`).
- `locales/en/`: Archivos JSON de traducción en Inglés (`common.json`, `landing.json`, `nav.json`, `footer.json`).

## Reglas
- **Estructura idéntica**: Los archivos JSON de cada idioma deben mantener exactamente la misma jerarquía y nombres de claves.
- **Namespaces modulares**: Separar traducciones por dominio/feature (`landing`, `nav`, `footer`, `common`).
- **Cero strings hardcoded**: Todo texto presentado al usuario en la UI debe obtenerse mediante `useTranslation()`.

## Dependencias
- Importa de: `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
- Importado por: `main.tsx` (para inicialización global) y componentes de UI/layout/features.
