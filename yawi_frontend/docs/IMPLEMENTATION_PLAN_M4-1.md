# Plan de Implementación — M4-1: Integración del registro de Customers con la API

> **Estado:** Implementado (M4-1). Validado con `format:check`, `vitest` (38 tests) y `build`. `lint` (oxlint) omitido por indicación del equipo.
> **Alcance:** Solo `yawi_frontend/`. `yawi_api/` se consulta en modo solo lectura. No se modifican `yawi_api/`, `yawi_n8n/` ni la infraestructura Docker.
> **Milestone:** M4-1 (continuación de M3 — Login y Registro de Customers).
> **Documentos base:** `src/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/DECISIONS.md`, `docs/IMPLEMENTATION_PLAN_M3.md`.

---

## 1. Meta

Conectar el formulario de registro de Customers (`/register`) con el endpoint real `POST /customers` de `yawi_api`, de modo que:

1. Se pueda **crear una cuenta de Customer** correctamente (petición real al backend).
2. Se muestre una **notificación de error enviada desde el backend** (p. ej. email duplicado `409`) mediante el sistema de toasts existente.
3. Se respete estrictamente `ARCHITECTURE.md` (capas `api → services`, ubicación de tipos, uso de toasts y componentes existentes).
4. Se mantenga el comportamiento actual del frontend (la UI no cambia; solo se reemplaza el mock por la llamada real).
5. El cambio sea **pequeño**: no se crean carpetas nuevas ni patrones paralelos.

### Resultado observable esperado

- Registro exitoso → toast de éxito + redirección a `/login` (comportamiento actual, ahora con backend real).
- Registro con email existente → toast rojo con el mensaje devuelto por el backend.
- Error de red / 5xx → toast con el mensaje genérico i18n (`register.error_generic`).

---

## 2. Contexto actual (verificado)

### 2.1 Frontend (`yawi_frontend`)

- El formulario `RegisterForm` **ya está cableado** para integración: valida, llama a `registerUser(...)`, muestra `showToast.success/error` y navega a `/login` (`src/features/auth/components/RegisterForm/RegisterForm.tsx`).
- `auth.api.ts` y `auth.service.ts` existen y están **mockeados** (comentarios `TODO [M4]`). Los archivos de `auth` usan **imports relativos** (no `@/`).
- `authStore` (`zustand`) solo implementa `login` (mock) y `logout`. El registro **no** pasa por el store: el componente llama al servicio directamente.
- Existe un `context/` vacío (solo `.gitkeep`): **no hay Context que actualizar**.
- El sistema de toasts (`showToast`, `ToastContainer`) ya está montado en `App.tsx` y listo para usarse.
- `useCountries()` entrega opciones `{ value: ISO alpha-2, label: nombre traducido }`; el formulario guarda el **código ISO** (p. ej. `"SV"`).
- `src/api/artisans.api.ts` establece el patrón HTTP vigente: `fetch` inline + `const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'`.

### 2.2 Backend (`yawi_api`, solo lectura)

- Endpoint real: `POST /customers` (sin prefijo global; la base es `http://localhost:3000`).
- Entidad `Customer`: `id, email, password (oculto), name, lastname, country, personal_address, createdAt, updatedAt, deletedAt`.
- DTO `CreateCustomerDto` (validación `whitelist: true` + `forbidNonWhitelisted: true`):
  `email, password (min 8), name, lastname, country, personal_address`. **Todos requeridos.**
- La respuesta `201` **no incluye `password`**.
- El backend almacena `country` como **nombre completo** (`"El Salvador"`, `"Guatemala"`), nunca como código ISO.
- Errores NestJS con forma `{ statusCode, message, error }`:
  - `409 Conflict` → `message` string: `"Ya existe un cliente con el mismo correo electrónico."`
  - `400 Bad Request` (ValidationPipe) → `message` suele ser **array de strings**.

> ⚠️ **Discrepancias críticas** entre dominio frontend y contrato backend:
>
> - Frontend `address` → backend `personal_address`.
> - Frontend `country` (ISO `"SV"`) → backend `country` (nombre `"El Salvador"`).
> - `confirmPassword` jamás debe enviarse (`forbidNonWhitelisted` devolvería `400`).

### 2.3 Baseline de tests (verificado con `npx vitest run`)

- `src/utils/validation.test.ts` → **pasa**.
- `src/services/auth.service.test.ts` → **pasa contra el mock actual**. Se actualizará para la integración real.
- `src/services/artisans.service.test.ts` → **falla preexistente**: `vitest.config.ts` no define el alias `@/`, por lo que `@/utils/formatAddress` no resuelve. **No es causado por este milestone** (ver §11).
- `vitest.config.ts` solo define `globals: true`; el alias `@/` existe en `vite.config.ts` pero no en la config de test. Por eso los archivos de `auth` usan imports relativos y deben seguir haciéndolo.

---

## 3. Decisiones tomadas (a registrar en `DECISIONS.md`)

| #      | Decisión                           | Elección                                                                                | Justificación                                                                                                                          |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **34** | Formato de `country` enviado       | **Convertir ISO alpha-2 → nombre oficial en el servicio**                               | La API persiste nombres completos (`"El Salvador"`). El formulario conserva el código ISO (no cambia UI ni tests de validación).       |
| **35** | Mensajes de error del backend      | **Mensaje del backend + fallback i18n**                                                 | Cumple "notificación de error enviado desde el backend". Si no hay mensaje (error de red/inesperado), se usa `register.error_generic`. |
| **36** | Estrategia de mocking de tests     | **`vi.stubGlobal('fetch', ...)`**                                                       | Sin dependencias nuevas; valida el contrato HTTP real del servicio.                                                                    |
| **37** | Ubicación de la acción de registro | **Servicio directo desde el componente**                                                | El registro no persiste estado de sesión; no requiere store. Mantiene el comportamiento actual y minimiza archivos.                    |
| **38** | Capa HTTP                          | **Mismo patrón inline que `artisans.api.ts`**                                           | Cada archivo `api/*` define su `API_BASE` y usa `fetch`. Cero estructuras nuevas.                                                      |
| **39** | Documentación                      | **Nuevos README en `api/`, `services/`, `types/`** + actualización de `DECISIONS.md`    | Cubre el NFR de autonomía para futuros agentes sin crear carpetas nuevas.                                                              |
| **40** | Mapeo DTO ↔ dominio                | **DTO del backend y payload en `api/auth.api.ts`; mapeo en `services/auth.service.ts`** | Sigue el ejemplo trabajado de `ARCHITECTURE.md` (api devuelve DTO, el servicio mapea a dominio).                                       |

---

## 4. Contrato real de la API y mapeo

### 4.1 Request — `POST /customers`

```jsonc
{
  "email": "cliente@example.com", // CustomerRegistrationData.email
  "password": "CustomerPass123!", // CustomerRegistrationData.password
  "name": "Ana", // CustomerRegistrationData.name
  "lastname": "Pérez", // CustomerRegistrationData.lastname
  "country": "El Salvador", // resolveCountryName(form.country /* "SV" */)
  "personal_address": "Colonia Escalón…", // CustomerRegistrationData.address
}
```

### 4.2 Response — `201 Created`

```jsonc
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "cliente@example.com",
  "name": "Ana",
  "lastname": "Pérez",
  "country": "El Salvador",
  "personal_address": "Colonia Escalón…",
  "createdAt": "2026-09-23T15:30:00.000Z",
  "updatedAt": "2026-09-23T15:30:00.000Z",
  "deletedAt": null,
}
```

### 4.3 Errores

| Status      | Body (resumen)                         | Resultado en el frontend                                              |
| ----------- | -------------------------------------- | --------------------------------------------------------------------- |
| `400`       | `{ message: string[] }`                | `AuthResponse.error = message.join(' ')` → toast de error             |
| `409`       | `{ message: "Ya existe un cliente…" }` | `AuthResponse.error = message` → toast de error                       |
| `5xx` / red | fetch rechaza o body sin `message`     | `AuthResponse.error = undefined` → toast con `register.error_generic` |

### 4.4 Tabla de mapeo

| Dominio frontend (`CustomerRegistrationData`) | Backend (`CreateCustomerPayload`) | Transformación            |
| --------------------------------------------- | --------------------------------- | ------------------------- |
| `email`                                       | `email`                           | directo                   |
| `password`                                    | `password`                        | directo                   |
| `name`                                        | `name`                            | directo                   |
| `lastname`                                    | `lastname`                        | directo                   |
| `country` (ISO `"SV"`)                        | `country` (`"El Salvador"`)       | `resolveCountryName()`    |
| `address`                                     | `personal_address`                | renombrado en el servicio |
| `confirmPassword`                             | —                                 | **excluido**              |

| Backend (`CustomerDto`)             | Dominio (`AuthUser`) |
| ----------------------------------- | -------------------- |
| `id`                                | `id`                 |
| `email`                             | `email`              |
| `name`                              | `name`               |
| `lastname`                          | `lastname`           |
| `country`                           | `country`            |
| `personal_address`                  | `address`            |
| `createdAt`/`updatedAt`/`deletedAt` | (no usado por la UI) |

---

## 5. Ubicación arquitectónica (según `ARCHITECTURE.md`)

```
components/pages (RegisterForm)
        │  llama al servicio (no a la API)
        ▼
services/auth.service.ts ── mapea DTO ↔ dominio, normaliza errores
        │
        ▼
api/auth.api.ts ── fetch real, devuelve CustomerDto, lanza ApiError
        │
        ▼
lib / env (VITE_API_URL)

utils/countryName.ts ── helper puro (ISO → nombre) usado por el servicio
```

Reglas que **no** se rompen:

- Ningún componente/page importa de `api/`.
- Solo `api/` ejecuta `fetch`.
- Tipos de dominio en `types/`; DTOs de la API dentro de `api/` (igual que `ShipmentDto` en el ejemplo de `ARCHITECTURE.md`).
- Sin carpetas nuevas ni estructuras paralelas.

---

## 6. Archivos a crear / modificar

| Acción                  | Archivo                             | Propósito                                                                                                            |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Modificar**           | `src/api/auth.api.ts`               | Reemplazar el mock de `registerApi` por `fetch` real + `ApiError`. `loginApi` permanece mockeado (fuera de alcance). |
| **Modificar**           | `src/services/auth.service.ts`      | Mapear dominio → payload, excluir `confirmPassword`, convertir país, mapear respuesta, normalizar errores.           |
| **Crear**               | `src/utils/countryName.ts`          | Helper puro `resolveCountryName(code, locale?)`.                                                                     |
| **Crear**               | `src/utils/countryName.test.ts`     | Tests del helper.                                                                                                    |
| **Modificar**           | `src/services/auth.service.test.ts` | Reemplazar tests de mock por `vi.stubGlobal('fetch')` + verificar mapeo/errores.                                     |
| **Crear (recomendado)** | `src/api/auth.api.test.ts`          | Tests de `registerApi` (éxito, 409, 400, red).                                                                       |
| **Crear**               | `src/api/README.md`                 | NFR: guía de la capa API.                                                                                            |
| **Crear**               | `src/services/README.md`            | NFR: guía de la capa de servicios.                                                                                   |
| **Crear**               | `src/types/README.md`               | NFR: guía de tipos compartidos.                                                                                      |
| **Modificar**           | `src/features/auth/README.md`       | Corregir "backend no conectado" y quitar `TODO [M4]`.                                                                |
| **Modificar**           | `docs/DECISIONS.md`                 | Registrar decisiones #34–#40.                                                                                        |
| **Crear**               | `docs/IMPLEMENTATION_PLAN_M4-1.md`  | Este plan.                                                                                                           |

> `src/features/auth/components/RegisterForm/RegisterForm.tsx` **no requiere cambios funcionales**: ya maneja `result.success`, muestra `result.error || t('register.error_generic')` y navega. Solo se verifica en QA.
> `src/store/authStore.ts` y `src/context/` **no se modifican** (Decisión #37; no hay Context).

---

## 7. Implementación detallada

> **Nota de estilo:** Todos los archivos de `auth` usan **imports relativos**. Mantener ese estilo para que los tests resuelvan sin depender del alias `@/` (ver §11).

### Fase 0 — Verificación previa

1. Confirmar que `yawi_api` corre en `http://localhost:3000` y que `POST /customers` responde (`/api/docs`).
2. Confirmar `VITE_API_URL=http://localhost:3000` en `yawi_frontend/.env.local`.
3. Confirmar que `POST /customers` está alcanzable desde el navegador (CORS del backend permite `http://localhost:5173`).
4. Ejecutar el baseline de tests: `npx vitest run src/utils/validation.test.ts src/services/auth.service.test.ts`.

### Fase 1 — Helper puro `resolveCountryName`

**Crear** `src/utils/countryName.ts`:

```ts
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';

// Registro idempotente de locales (mismo patrón que features/auth/hooks/useCountries.ts).
countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

/**
 * Convierte un código ISO alpha-2 (p. ej. 'SV') al nombre oficial del país.
 *
 * La API `yawi_api` persiste nombres completos (p. ej. 'El Salvador'), no códigos.
 * Se usa locale 'es' por defecto para producir un valor canónico y estable,
 * independiente del idioma de la UI y consistente con los datos existentes del backend.
 * Si el código no se reconoce, se devuelve el valor original (fallback seguro).
 */
export function resolveCountryName(code: string, locale: 'es' | 'en' = 'es'): string {
  if (!code) return code;
  return countries.getName(code.toUpperCase(), locale) ?? code;
}
```

**Crear** `src/utils/countryName.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveCountryName } from './countryName';

describe('resolveCountryName', () => {
  it('converts ISO alpha-2 to official country name (es)', () => {
    expect(resolveCountryName('SV')).toBe('El Salvador');
    expect(resolveCountryName('GT')).toBe('Guatemala');
  });

  it('is case-insensitive', () => {
    expect(resolveCountryName('sv')).toBe('El Salvador');
  });

  it('supports en locale', () => {
    expect(resolveCountryName('DE', 'en')).toBe('Germany');
  });

  it('returns the original value when the code is unknown', () => {
    expect(resolveCountryName('ZZ')).toBe('ZZ');
  });

  it('returns empty string unchanged', () => {
    expect(resolveCountryName('')).toBe('');
  });
});
```

### Fase 2 — Capa API real

**Modificar** `src/api/auth.api.ts`. Mantener `loginApi` como está (fuera de alcance) y reemplazar `registerApi`.

```ts
import type { AuthResponse, CustomerRegistrationData, LoginCredentials } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Payload que espera `POST /customers` (contrato real de yawi_api). */
export interface CreateCustomerPayload {
  email: string;
  password: string;
  name: string;
  lastname: string;
  country: string; // nombre completo, no ISO
  personal_address: string;
}

/** Respuesta pública de `POST /customers` (sin `password`). */
export interface CustomerDto {
  id: string;
  email: string;
  name: string;
  lastname: string;
  country: string;
  personal_address: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Error tipado de la API NestJS. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Extrae el mensaje del body de error NestJS ({ message: string | string[] }). */
async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(' ');
    if (typeof body.message === 'string' && body.message.length > 0) return body.message;
  } catch {
    // Respuesta sin JSON
  }
  return `Error ${res.status}`;
}

// loginApi(...) SIN CAMBIOS (mock, fuera de alcance M4-1).

/**
 * Crea un Customer real en el backend.
 * @throws {ApiError} si el backend responde con status != 2xx.
 * @throws {TypeError} si falla la red (fetch rechaza); el servicio lo trata como error genérico.
 */
export async function registerApi(payload: CreateCustomerPayload): Promise<CustomerDto> {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return (await res.json()) as CustomerDto;
}
```

> Se elimina el `console.log(data)` y el `TODO [M4]` (código de mock).

### Fase 3 — Servicio con mapeo y normalización de errores

**Modificar** `src/services/auth.service.ts`:

```ts
import { ApiError, registerApi } from '../api/auth.api';
import type { CreateCustomerPayload, CustomerDto } from '../api/auth.api';
import { resolveCountryName } from '../utils/countryName';
import type {
  AuthResponse,
  AuthUser,
  CustomerRegistrationData,
  LoginCredentials,
} from '../types/auth';

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  return loginApi(credentials); // sin cambios (mock)
}

/** Mapea la respuesta pública del backend al modelo de sesión del frontend. */
function mapCustomerToAuthUser(dto: CustomerDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    lastname: dto.lastname,
    country: dto.country,
    address: dto.personal_address,
  };
}

/** Construye el payload del backend a partir del formulario (dominio → DTO). */
function mapRegistrationToPayload(data: CustomerRegistrationData): CreateCustomerPayload {
  return {
    email: data.email,
    password: data.password,
    name: data.name,
    lastname: data.lastname,
    country: resolveCountryName(data.country),
    personal_address: data.address,
  };
}

export async function registerUser(data: CustomerRegistrationData): Promise<AuthResponse> {
  try {
    const dto = await registerApi(mapRegistrationToPayload(data));
    return { success: true, user: mapCustomerToAuthUser(dto) };
  } catch (error) {
    // Mensaje del backend si es un ApiError; si no (red/inesperado), sin mensaje
    // para que el componente aplique el fallback i18n `register.error_generic`.
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false };
  }
}
```

> `loginUser` debe importar `loginApi` (ya lo hacía). Mantener ese import.
> `confirmPassword` **no se incluye** en el payload (se ignora al construir el DTO), cumpliendo `forbidNonWhitelisted`.
> El `AuthResponse` y los toasts existentes no cambian: el componente ya sabe consumirlos.

### Fase 4 — Formulario

**Sin cambios.** Verificación manual:

- `result.success === true` → `showToast.success(t('register.success'))` + `navigate('/login')`.
- `result.success === false` → `showToast.error(result.error || t('register.error_generic'))`.
- Excepción no controlada → `catch` → `showToast.error(t('register.error_generic'))`.

Si se desea, se puede subir la duración del toast de error para mensajes largos del backend:
`showToast.error(result.error || t('register.error_generic'), 6000)`. **Opcional**, no altera la lógica.

### Fase 5 — Tests

**Modificar** `src/services/auth.service.test.ts` (reemplazo integral). Usa `vi.stubGlobal('fetch')`, sin dependencias nuevas:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerUser } from './auth.service';
import type { CustomerRegistrationData } from '../types/auth';
import type { CustomerDto } from '../api/auth.api';

function buildFormData(
  overrides: Partial<CustomerRegistrationData> = {},
): CustomerRegistrationData {
  return {
    email: 'new@test.com',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'Juan',
    lastname: 'Pérez',
    country: 'SV',
    address: 'Avenida Central #123, San Salvador',
    ...overrides,
  };
}

function buildCustomerDto(overrides: Partial<CustomerDto> = {}): CustomerDto {
  return {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'new@test.com',
    name: 'Juan',
    lastname: 'Pérez',
    country: 'El Salvador',
    personal_address: 'Avenida Central #123, San Salvador',
    createdAt: '2026-09-23T15:30:00.000Z',
    updatedAt: '2026-09-23T15:30:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('auth.service.registerUser', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('creates the customer and maps the response to AuthUser', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(buildCustomerDto(), 201));

    const result = await registerUser(buildFormData());

    expect(result.success).toBe(true);
    expect(result.user?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(result.user?.address).toBe('Avenida Central #123, San Salvador');
  });

  it('sends personal_address, country name and excludes confirmPassword', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(buildCustomerDto(), 201));

    await registerUser(buildFormData());

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain('/customers');
    expect(init?.method).toBe('POST');
    const body = JSON.parse(String(init?.body));
    expect(body.personal_address).toBe('Avenida Central #123, San Salvador');
    expect(body.country).toBe('El Salvador');
    expect(body.address).toBeUndefined();
    expect(body.confirmPassword).toBeUndefined();
  });

  it('returns the backend error message on 409 conflict', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          statusCode: 409,
          message: 'Ya existe un cliente con el mismo correo electrónico.',
          error: 'Conflict',
        },
        409,
      ),
    );

    const result = await registerUser(buildFormData());

    expect(result.success).toBe(false);
    expect(result.error).toBe('Ya existe un cliente con el mismo correo electrónico.');
  });

  it('joins array messages on 400 validation error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ statusCode: 400, message: ['email inválido', 'país requerido'] }, 400),
    );

    const result = await registerUser(buildFormData());

    expect(result.success).toBe(false);
    expect(result.error).toBe('email inválido país requerido');
  });

  it('falls back to no error message on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await registerUser(buildFormData());

    expect(result.success).toBe(false);
    expect(result.error).toBeUndefined();
  });
});
```

> El test de `loginUser` del archivo actual puede conservarse aparte (login sigue mockeado) o eliminarse si se prefiere enfocar el archivo solo en registro. **Recomendado:** conservar un test mínimo de `loginUser` para no perder cobertura.

**Crear (recomendado)** `src/api/auth.api.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerApi, ApiError } from './auth.api';

const payload = {
  email: 'a@b.com',
  password: 'password123',
  name: 'Ana',
  lastname: 'Pérez',
  country: 'El Salvador',
  personal_address: 'San Salvador',
};

function jsonResponse(body: unknown, status: number) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('auth.api.registerApi', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('POSTs to /customers and returns the DTO', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 'x' }, 201));
    const dto = await registerApi(payload);
    expect(dto.id).toBe('x');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/customers');
  });

  it('throws ApiError with backend message on failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ statusCode: 409, message: 'Duplicado' }, 409),
    );
    await expect(registerApi(payload)).rejects.toBeInstanceOf(ApiError);
  });
});
```

### Fase 6 — Documentación (NFR)

**Crear** `src/api/README.md` con: propósito de la capa, la regla "solo `api/` hace `fetch`", el patrón `API_BASE = import.meta.env.VITE_API_URL`, lista de recursos (`auth.api.ts`, `artisans.api.ts`), política de DTOs (van en el propio archivo `*.api.ts`) y manejo de errores (`ApiError`). Incluir la advertencia de que `vitest.config.ts` no resuelve el alias `@/`.

**Crear** `src/services/README.md` con: propósito (orquestación + mapeo DTO→dominio, sin React), lista de servicios, y la nota de que `imports` relativos vs `@/` deben respetar lo que resuelva el test runner.

**Crear** `src/types/README.md` con: propósito (tipos de dominio compartidos), inventario (`auth.ts`, `artisan.ts`), y la distinción entre tipos de dominio (aquí) y DTOs de API (en `api/*.api.ts`).

**Modificar** `src/features/auth/README.md`: reemplazar la sección "Conexión con backend" (que dice que no está conectado y menciona `TODO [M4]`) por el estado real: registro integrado a `POST /customers` vía `auth.service` → `auth.api`; login sigue mockeado (fuera de alcance).

**Modificar** `docs/DECISIONS.md`: agregar la tabla "Milestone 4 — Integración de registro de Customers" con las decisiones #34–#40 de §3.

### Fase 7 — Validación

Desde `yawi_frontend`:

```powershell
npm run format:check   # debe pasar
npm run format         # aplica formato
npm run lint           # oxlint
npx vitest run src/utils/validation.test.ts src/utils/countryName.test.ts src/services/auth.service.test.ts src/api/auth.api.test.ts
npm run build          # tsc -b && vite build
```

Prueba manual (backend `yawi_api` encendido):

1. `/register` → completar los 2 pasos con un email nuevo → toast de éxito + redirección a `/login`.
2. Repetir con el **mismo email** → toast de error con el mensaje del backend (409).
3. Detener el backend y enviar → toast con `register.error_generic` (fallback i18n).

---

## 8. Criterios de aceptación

- [ ] El registro llama realmente a `POST /customers` (no hay mock ni `console.log`).
- [ ] El payload envía `personal_address` (no `address`), `country` como nombre y **sin** `confirmPassword`.
- [ ] Un registro válido crea la cuenta y muestra el toast de éxito.
- [ ] Un email duplicado muestra el mensaje de error del backend en un toast.
- [ ] Un error de red/5xx muestra el fallback i18n.
- [ ] Ningún componente/page importa de `api/`; solo `api/` usa `fetch`.
- [ ] `types/auth.ts` conserva sus contratos y no se añaden tipos inline en componentes.
- [ ] No se crean carpetas nuevas ni patrones fuera de `ARCHITECTURE.md`.
- [ ] `validation.test.ts` sigue pasando.
- [ ] Nuevos tests de `countryName`, `auth.service` (y `auth.api` opcional) pasan.
- [ ] `npm run format:check`, `npm run lint` y `npm run build` pasan.
- [ ] READMEs de `api/`, `services/`, `types/` creados; `features/auth/README.md` actualizado; `DECISIONS.md` actualizado.
- [ ] `ARCHITECTURE.md` marcado como leído/consultado (checkbox de §7 de arquitectura).

---

## 9. Fuera de alcance (confirmado)

- Integración de **login/autenticación** (`loginApi`, `authStore.login` siguen mock).
- Cualquier modificación de `yawi_api` (solo lectura) o `yawi_n8n`.
- Cambios en `RegisterForm` (salvo el ajuste opcional de duración del toast).
- Rediseño visual: se reutilizan componentes y toasts existentes (estilo `DESIGN.md` ya aplicado).
- Modificar infraestructura (Docker, CORS, `vite.config.ts`).

---

## 10. Riesgos y notas

1. **Alias `@/` en Vitest (preexistente):** `vitest.config.ts` no resuelve `@/`, por lo que `artisans.service.test.ts` falla hoy. **Este plan no lo toca.** Mitigación: usar imports relativos en los archivos de `auth`. _Mejora opcional sujeta a aprobación:_ añadir `resolve.alias` a `vitest.config.ts` (arreglaría también el test de artisans). No incluido por defecto (regla de no alterar infraestructura sin permiso).
2. **Idioma del `country` persistido:** se guarda el nombre en español (`"El Salvador"`) como valor canónico, consistente con el seed del backend. Si el producto requiere nombres en inglés, basta cambiar el locale por defecto en `resolveCountryName` (registrado en `DECISIONS.md`).
3. **Mensajes del backend en español:** al usuario en inglés se le mostrará el mensaje del backend (español). Es consecuencia directa de la Decisión #35; si se prefiere i18n completa, revisar Decisión #35.
4. **`forbidNonWhitelisted`:** cualquier campo extra produce `400`. El servicio garantiza el payload exacto; los tests lo verifican.
5. **Login mock intacto:** no confundir el registro real con el login que aún no autentica.

---

## 11. Checklist de ejecución para el agente junior

1. Ejecutar Fase 0 (verificar backend/env/baseline).
2. Crear `src/utils/countryName.ts` + test.
3. Modificar `src/api/auth.api.ts` (Fase 2).
4. Modificar `src/services/auth.service.ts` (Fase 3).
5. Actualizar/crear tests (Fase 5).
6. Crear/actualizar READMEs y `DECISIONS.md` (Fase 6).
7. Actualizar `features/auth/README.md`.
8. Ejecutar Fase 7 (format, lint, tests, build) y la prueba manual.
9. Marcar criterios de aceptación y entregar evidencia (salida de comandos + resultado manual).
