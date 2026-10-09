# API Layer (`src/api`)

## Propósito

Contiene las llamadas **crudas** al backend. Es la **única** capa autorizada a usar `fetch` (o el cliente HTTP/Supabase). No contiene React ni lógica de mapeo de dominio: recibe/retorna DTOs del backend y lanza errores tipados.

## Reglas

- **Nadie más hace `fetch`.** Componentes, hooks, páginas, stores y servicios consumen estos archivos.
- **DTOs dentro del archivo de recurso.** Los tipos del contrato del backend (`CustomerDto`, `BusinessDto`, etc.) se definen y exportan en el propio `*.api.ts` (no en `types/`), tal como indica `src/ARCHITECTURE.md`.
- **Un archivo por recurso**, nombrado `<recurso>.api.ts`.
- **Errores tipados.** Las respuestas no-2xx se convierten en `ApiError` (ver `auth.api.ts`) con el `message` del backend.

## Patrón HTTP vigente

```ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const res = await fetch(`${API_BASE}/<recurso>`, {/* ... */});
```

`VITE_API_URL` se define en `.env.local` / `.env.example` (por defecto `http://localhost:3000`).

## Recursos

| Archivo           | Recurso                                                     | Consumido por                  |
| ----------------- | ----------------------------------------------------------- | ------------------------------ |
| `auth.api.ts`     | `POST /customers` (registro real), login mock (`TODO [M4]`) | `services/auth.service.ts`     |
| `artisans.api.ts` | `GET /businesses`, `GET /businesses/:id`                    | `services/artisans.service.ts` |

## Nota sobre el alias `@/`

`vite.config.ts` define el alias `@/` y `vitest.config.ts` lo replica en `resolve.alias`, por lo que tanto el build como los tests resuelven `@/`. Los archivos de `auth` conservan **imports relativos** por historia; los nuevos archivos pueden usar `@/` sin problema.

## Dependencias

- Importa de: env de Vite (`import.meta.env`).
- Importado por: `services/` (nunca por componentes/páginas).
