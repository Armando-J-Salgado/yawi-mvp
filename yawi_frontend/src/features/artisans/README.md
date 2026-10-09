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
