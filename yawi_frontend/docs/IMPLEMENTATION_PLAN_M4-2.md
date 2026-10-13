# Plan de Implementación — M4-2: Integración del Login de Customers con la API

> **Para el agente implementador (nivel junior):** este documento es autosuficiente. Sigue los pasos en orden. No improvises estructuras nuevas: cada archivo se ubica donde indica `src/ARCHITECTURE.md`. Si algo contradice este plan, detente y pregunta antes de romper la arquitectura.

---

## 1. Objetivo

Conectar la página de login (`/login`) con el endpoint real `POST /auth/login` de `yawi_api` para autenticar clientes (**Customer**) y habilitar al usuario para operaciones posteriores mediante el JWT devuelto. La página debe:

- Enviar email y contraseña al backend y autenticar la cuenta.
- Mostrar una **notificación de error enviada por el backend** cuando la autenticación falla.
- Persistir la sesión y exponer el token para futuras peticiones autorizadas.
- Restaurar/validar la sesión al cargar la app mediante `GET /auth/me`.

Se **reutiliza** la preparación existente del frontend (`LoginForm`, `Toast`, `authStore`, `auth.service.ts`, `auth.api.ts`), por lo que el número de archivos nuevos/modificados es pequeño.

---

## 2. Contexto actual (verificado, no asumir otra cosa)

### 2.1 Contrato real de `yawi_api` (SOLO LECTURA — no modificar)

| Endpoint           | Auth                          | Request                               | Response OK                      | Errores                                                                                         |
| ------------------ | ----------------------------- | ------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `POST /auth/login` | Público                       | `{ email: string; password: string }` | `200` `LoginResponseDto` (abajo) | `400` validación (`message: string \| string[]`), `401` `{ message: 'Credenciales inválidas' }` |
| `GET /auth/me`     | `Authorization: Bearer <jwt>` | —                                     | `200` `AuthUserDto`              | `401` `{ message: string }`                                                                     |

**`LoginResponseDto`** (de `yawi_api/src/auth/dto/auth-response.dto.ts`):

```jsonc
{
  "access_token": "eyJ...", // JWT
  "token_type": "Bearer",
  "expires_in": "1d",
  "user": {
    "id": "uuid",
    "userType": "customer",
    "email": "cliente@example.com",
    "name": "Ana",
    "lastname": "Pérez",
  },
}
```

**`AuthUserDto`** (mismo archivo): `{ id, userType: 'customer', email, name, lastname }`. **No incluye `country` ni `address`.**

> Nota: el mensaje del backend está en español (`'Credenciales inválidas'`), independientemente del idioma de la UI. Se mostrará tal cual (requisito de "notificación de error enviado desde el backend").

### 2.2 Estado del frontend

| Archivo                                                | Estado actual                                                     | Acción                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/api/auth.api.ts`                                  | `registerApi` real; `loginApi` es **mock** (`TODO [M4]`)          | Reemplazar mock por `fetch` real y añadir `getMeApi`       |
| `src/services/auth.service.ts`                         | `registerUser` real; `loginUser` delega al mock                   | Implementar login real + `fetchCurrentUser`                |
| `src/store/authStore.ts`                               | `login` es mock que siempre autentica; sin token, sin persist     | Integrar servicio, token, persist y bootstrap              |
| `src/types/auth.ts`                                    | `AuthResponse` sin token; `AuthUser.country/address` obligatorios | Ampliar `AuthResponse`; hacer opcionales `country/address` |
| `src/features/auth/components/LoginForm/LoginForm.tsx` | Ignora `result.error` y muestra siempre el genérico               | Mostrar el mensaje del backend con fallback i18n           |
| `src/App.tsx`                                          | Monta `AppRoutes` + `ToastContainer`                              | Añadir bootstrap de sesión                                 |
| `src/components/ui/Toast`                              | `showToast.success/error/info` listo                              | Reutilizar (no modificar)                                  |

Hechos adicionales:

- **No existe** carpeta `src/context/` ni `AuthContext` → no se creará uno (estado de sesión vive en Zustand).
- **No existe** carpeta `src/test/` ni Testing Library. Los tests actuales son colocados y no renderizan DOM (p. ej. `Button.test.tsx` solo verifica el export). Mantén ese patrón.
- `package.json` **no tiene script `test`**. Ejecuta los tests con `npx vitest run`.
- El alias `@/` está configurado en `vite.config.ts` y `vitest.config.ts`. Los archivos nuevos deben usar `@/`.
- Prettier es la herramienta de formato. **Oxlint está configurado pero NO se usa: no ejecutes `npm run lint`.**
- `VITE_API_URL` ya se usa para armar URLs (default `http://localhost:3000`).

---

## 3. Decisiones acordadas (registrar en `docs/DECISIONS.md`)

| #   | Decisión                      | Elección                                                                                                                                                            |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Persistencia de sesión        | `zustand/middleware` **`persist`** en `localStorage` (clave `yawi-auth`). El JWT y el usuario sobreviven a la recarga.                                              |
| B   | Transporte del token a `api/` | Helper `src/lib/authToken.ts` (setter/getter en memoria). El store lo alimenta; `api/` lo lee. Respeta la dirección de dependencias `store → services → api → lib`. |
| C   | Restaurar sesión al cargar    | Implementar `GET /auth/me` como bootstrap (valida el token persistido y limpia si es inválido).                                                                     |
| D   | Modelo `AuthUser`             | `country` y `address` pasan a **opcionales**; se añade `userType?`. El login no los completa.                                                                       |
| E   | Redirección post-login        | Mantener `/` (landing). No existe todavía dashboard de Customer.                                                                                                    |
| F   | `AuthContext`                 | **No crear**. Zustand es la única fuente de sesión (consistente con Decisión #1 de `DECISIONS.md`).                                                                 |
| G   | Mensaje de error de login     | Mostrar el `message` del backend; si no existe (red/inesperado) usar fallback i18n `login.error_invalid_credentials` (mismo patrón que Decisión #35).               |

---

## 4. Arquitectura y ubicación de archivos

Respetando `ARCHITECTURE.md` (flujo `pages → features → components`, y `hooks/store → services → api → lib`):

### Archivos a CREAR

```
yawi_frontend/src/
  lib/
    authToken.ts                 # Helper de token en memoria (setter/getter/headers)
    authToken.test.ts            # Test unitario puro
  features/auth/hooks/
    useSessionBootstrap.ts       # Hook de feature: dispara restoreSession() al montar
  store/
    authStore.test.ts            # Test del slice de sesión (login/logout/restore)
```

### Archivos a MODIFICAR

```
yawi_frontend/src/
  api/auth.api.ts                # loginApi real + getMeApi + DTOs
  api/auth.api.test.ts           # + tests de loginApi/getMeApi
  services/auth.service.ts       # loginUser real + fetchCurrentUser + mapeo
  services/auth.service.test.ts  # actualizar loginUser, añadir fetchCurrentUser
  types/auth.ts                  # AuthResponse con token; AuthUser opcionales
  store/authStore.ts             # token + persist + bootstrap
  features/auth/components/LoginForm/LoginForm.tsx   # mostrar error del backend
  App.tsx                        # useSessionBootstrap()
  api/README.md                  # actualizar tabla/contratos
  services/README.md             # actualizar responsabilidades
  store/README.md                # documentar token/persist/bootstrap
  lib/README.md                  # documentar authToken.ts
  features/auth/README.md        # documentar login real + bootstrap

yawi_frontend/docs/
  DECISIONS.md                   # nueva sección Milestone 4-2
```

> **No se crean carpetas nuevas** (todos los archivos caen en carpetas existentes). El NFR de READMEs se cumple **actualizando** los README de las carpetas tocadas, tal como se hizo en M4-1 (Decisión #39).

---

## 5. Paso a paso de implementación

### Paso 1 — Tipos (`src/types/auth.ts`)

1. En `AuthUser`, hacer opcionales `country` y `address`, y añadir `userType`:

```ts
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastname: string;
  userType?: 'customer';
  country?: string; // opcional: el login no lo devuelve
  address?: string; // opcional: el login no lo devuelve
  avatarUrl?: string;
}
```

2. Ampliar `AuthResponse` con los campos de sesión:

```ts
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
  tokenType?: string;
  expiresIn?: string;
}
```

> No cambies `LoginCredentials`, `CustomerRegistrationData` ni las firmas de validación: eso mantiene intactos los tests de validación (`utils/validation.test.ts`).

### Paso 2 — Helper de token (`src/lib/authToken.ts`)

Crea el módulo. Es la única vía por la que `api/` obtiene el JWT (dirección `api → lib` permitida).

```ts
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/** Headers de autorización listos para `fetch`. Vacío si no hay token. */
export function buildAuthHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}
```

### Paso 3 — API (`src/api/auth.api.ts`)

1. Añade los DTOs del login (junto a `CreateCustomerPayload`/`CustomerDto`):

```ts
export interface AuthUserDto {
  id: string;
  userType: 'customer';
  email: string;
  name: string;
  lastname: string;
}

export interface LoginResponseDto {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: AuthUserDto;
}
```

2. Reemplaza el **cuerpo mock** de `loginApi` por una llamada real (mantén el nombre, la firma y el manejo de `ApiError`). Elimina el `TODO [M4]`:

```ts
export async function loginApi(credentials: LoginCredentials): Promise<LoginResponseDto> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return (await res.json()) as LoginResponseDto;
}
```

3. Añade `getMeApi` usando el helper (no recibe token por parámetro: lo lee de `lib/authToken`):

```ts
import { buildAuthHeaders } from '@/lib/authToken';

export async function getMeApi(): Promise<AuthUserDto> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...buildAuthHeaders() },
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return (await res.json()) as AuthUserDto;
}
```

> Regla dura: `fetch` solo existe en `api/`. El componente/store/servicio **nunca** llaman a `fetch`.

### Paso 4 — Servicio (`src/services/auth.service.ts`)

1. Implementa `loginUser` real y un mapeo compartido:

```ts
import { ApiError, getMeApi, loginApi, registerApi } from '@/api/auth.api';
import type {
  AuthUserDto,
  CreateCustomerPayload,
  CustomerDto,
  LoginResponseDto,
} from '@/api/auth.api';

function mapAuthUserDtoToAuthUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    lastname: dto.lastname,
    userType: dto.userType,
  };
}

function mapLoginResponse(dto: LoginResponseDto): AuthResponse {
  return {
    success: true,
    user: mapAuthUserDtoToAuthUser(dto.user),
    token: dto.access_token,
    tokenType: dto.token_type,
    expiresIn: dto.expires_in,
  };
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    return mapLoginResponse(await loginApi(credentials));
  } catch (error) {
    if (error instanceof ApiError) return { success: false, error: error.message };
    return { success: false }; // red/inesperado → el componente usa fallback i18n
  }
}

/** Valida el token actual (leído por `api/` desde `lib/authToken`) y devuelve el usuario. */
export async function fetchCurrentUser(): Promise<AuthUser> {
  return mapAuthUserDtoToAuthUser(await getMeApi());
}
```

2. Mantén `registerUser` y `mapCustomerToAuthUser` como están (el registro sí completa `country`/`address`).
3. Migra los imports de este archivo a `@/` (los nuevos usan `@/`; es seguro porque el alias resuelve en build y test).

### Paso 5 — Store (`src/store/authStore.ts`)

Estado: añade `token` + acción `restoreSession`; integra el servicio y `persist`.

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, fetchCurrentUser } from '@/services/auth.service';
import { setAuthToken } from '@/lib/authToken';
import type { AuthUser } from '@/types/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const result = await loginUser({ email, password });
        if (result.success && result.user) {
          setAuthToken(result.token ?? null);
          set({ isAuthenticated: true, user: result.user, token: result.token ?? null });
          return { success: true };
        }
        return { success: false, error: result.error };
      },

      logout: () => {
        setAuthToken(null);
        set({ isAuthenticated: false, user: null, token: null });
      },

      restoreSession: async () => {
        const { token } = get();
        if (!token) return;
        setAuthToken(token);
        try {
          const user = await fetchCurrentUser();
          set({ isAuthenticated: true, user });
        } catch {
          setAuthToken(null);
          set({ isAuthenticated: false, user: null, token: null });
        }
      },
    }),
    {
      name: 'yawi-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
```

Puntos clave:

- `login` **no** atrapa excepciones: el servicio ya normaliza errores a `{ success:false, error? }`. Aun así, `LoginForm` mantiene su `try/catch` por seguridad.
- `logout` limpia también el helper de token.
- `restoreSession` reinyecta el token persistido en el helper antes de llamar a la API.

### Paso 6 — Hook de bootstrap (`src/features/auth/hooks/useSessionBootstrap.ts`)

```ts
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

let bootstrapped = false; // evita doble ejecución con React StrictMode en dev

export function useSessionBootstrap(): void {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;
    void restoreSession();
  }, [restoreSession]);
}
```

### Paso 7 — `App.tsx`

Monta el bootstrap dentro de la app (composición, sin lógica extra):

```tsx
import { AppRoutes } from './routes';
import { ToastContainer } from './components/ui';
import { useSessionBootstrap } from './features/auth/hooks/useSessionBootstrap';

function App() {
  useSessionBootstrap();
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
```

> Exporta el hook desde el `index.ts` del feature si otros consumidores lo necesitan; para `App.tsx` puede importarse por ruta directa. Si actualizas `features/auth/index.ts`, añade `export { useSessionBootstrap } from './hooks/useSessionBootstrap';` y ajusta `App.tsx` a `from './features/auth'`.

### Paso 8 — `LoginForm.tsx` (mostrar error del backend)

En el `else` del submit, usa el mensaje del backend con fallback i18n:

```tsx
} else {
  // El backend devuelve 'Credenciales inválidas' y el servicio lo propaga.
  // Si no hay mensaje (red/inesperado), se usa el fallback i18n.
  showToast.error(result.error || t('login.error_invalid_credentials'));
}
```

No cambies:

- La validación previa (`validateLoginForm`) ni el toast genérico de formato inválido.
- El `navigate('/')` y el toast de éxito.
- Los `import` relativos existentes (se mantiene por consistencia con el resto de archivos de `auth`).

### Paso 9 — i18n

No se requieren claves nuevas: `login.error_invalid_credentials` y `login.success` ya existen en `es/auth.json` y `en/auth.json`. El mensaje del backend se muestra de forma literal (limitación conocida del contrato).

---

## 6. Tests (vitest)

> Ejecutar con `npx vitest run`. **No** ejecutar `npm run lint`. Los tests de validación (`src/utils/validation.test.ts`) **no se tocan** y deben seguir pasando.

### 6.1 `src/api/auth.api.test.ts` (modificar — añadir)

- `loginApi` hace `POST` a `/auth/login` con `{ email, password }` en el body y devuelve el `LoginResponseDto` (mock de `fetch` con `vi.stubGlobal`).
- `loginApi` lanza `ApiError` con el `message` del backend ante `401`.
- `getMeApi` envía `Authorization: Bearer <token>` (setea el token con `setAuthToken('t')` y verifica el header) y devuelve el `AuthUserDto`.
- Mantén los tests existentes de `registerApi`.

### 6.2 `src/services/auth.service.test.ts` (modificar — actualizar/añadir)

- **Reemplaza** el test actual `loginUser returns success for mock login` (ya no aplica: el mock se elimina) por:
  - `loginUser` mapea `LoginResponseDto` → `AuthResponse` con `success`, `user`, `token`, `tokenType`, `expiresIn`.
  - `loginUser` ante `401` devuelve `{ success:false, error: 'Credenciales inválidas' }`.
  - `loginUser` ante fallo de red (`fetch` rechaza) devuelve `{ success:false }` sin `error`.
- Añade `fetchCurrentUser`:
  - devuelve `AuthUser` mapeado cuando `GET /auth/me` responde `200`.
  - propaga (`rejects`) cuando el backend responde `401`.
- Mantén intactos los tests de `registerUser`.

### 6.3 `src/lib/authToken.test.ts` (crear)

- `getAuthToken()` inicia en `null`.
- `setAuthToken('abc')` → `getAuthToken()` es `'abc'` y `buildAuthHeaders()` es `{ Authorization: 'Bearer abc' }`.
- `setAuthToken(null)` → `buildAuthHeaders()` es `{}`.
- Restaura el estado a `null` en `afterEach` para aislar tests.

### 6.4 `src/store/authStore.test.ts` (crear)

Usa `vi.stubGlobal('fetch', ...)` (mismo patrón que los tests de servicio) y reinicia el estado del store entre tests (`useAuthStore.setState({ isAuthenticated:false, user:null, token:null })`, `setAuthToken(null)`, y limpiar `localStorage`).

- `login` exitoso: `isAuthenticated === true`, `user` poblado, `token` guardado y `getAuthToken()` seteado.
- `login` fallido (`401`): `isAuthenticated === false`, `error` propagado, `token === null`.
- `logout`: limpia estado y helper.
- `restoreSession` con token válido (mock `GET /auth/me` 200): autentica y actualiza `user`.
- `restoreSession` con token inválido (mock `401`): limpia `token`, `user` y `isAuthenticated`.
- `restoreSession` sin token: no llama a `fetch` (`fetch` no invocado).

### 6.5 Componente (opcional, patrón existente)

`src/features/auth/components/LoginForm/LoginForm.test.tsx` trivial (`expect(LoginForm).toBeDefined()`), consistente con `Button.test.tsx`/`Navbar.test.tsx`. No hay Testing Library instalada, así que **no** se añaden pruebas de interacción ni se instala ninguna dependencia nueva.

---

## 7. NFR de documentación (READMEs + DECISIONS)

Actualiza cada README de forma breve y accionable (evitar que un futuro agente lea el código innecesariamente):

- **`src/api/README.md`**: tabla de recursos → `auth.api.ts` ahora cubre `POST /customers`, `POST /auth/login` y `GET /auth/me`. Documenta `LoginResponseDto`/`AuthUserDto` y que `getMeApi` usa `buildAuthHeaders()` de `lib/authToken`.
- **`src/services/README.md`**: `auth.service.ts` ahora mapea login real y expone `fetchCurrentUser`.
- **`src/store/README.md`**: documenta `token`, persistencia (`localStorage`, clave `yawi-auth`) y `restoreSession`.
- **`src/lib/README.md`**: añade `authToken.ts` (helper en memoria `setAuthToken`/`getAuthToken`/`buildAuthHeaders`).
- **`src/features/auth/README.md`**: actualiza la sección "Conexión con backend": login real (`POST /auth/login`), bootstrap (`GET /auth/me` vía `useSessionBootstrap`), manejo de error del backend.
- **`docs/DECISIONS.md`**: agrega la sección **"Milestone 4-2 — Integración del Login de Customers con la API"** con las decisiones A–G de la sección 3.

---

## 8. Verificación y criterios de aceptación

### Comandos de verificación (desde `yawi_frontend/`)

```powershell
npx vitest run          # todos los tests verdes
npm run build           # tsc -b + vite build sin errores de tipos
npm run format:check    # Prettier sin pendientes (usar npm run format si falla)
```

> NO ejecutar `npm run lint` (Oxlint no está en uso).

### Checklist de aceptación

- [ ] **RF-1** Crear una cuenta de Customer sigue funcionando (`POST /customers`) sin regresiones.
- [ ] **RF-2** Ante credenciales incorrectas, el login muestra en el toast el **mensaje del backend** (`'Credenciales inválidas'`); ante fallo de red usa el fallback i18n.
- [ ] El login exitoso guarda `user` + `token`, marca `isAuthenticated` y redirige a `/`.
- [ ] La sesión persiste en `localStorage` (clave `yawi-auth`) y se restaura/valida con `GET /auth/me` al recargar; si el token es inválido se limpia.
- [ ] `country`/`address` de `AuthUser` son opcionales y no rompen `Navbar`/`MobileMenu`/registro.
- [ ] `fetch` solo aparece en `src/api/` (verifica con una búsqueda de `fetch(` en `src/`).
- [ ] No se creó ningún `AuthContext` ni carpeta nueva en `src/`.
- [ ] No se modificó `yawi_api` (solo lectura).
- [ ] `src/utils/validation.test.ts` sigue pasando sin cambios.
- [ ] READMEs actualizados y sección nueva en `docs/DECISIONS.md`.
- [ ] `npx vitest run`, `npm run build` y `npm run format:check` pasan.

---

## 9. Riesgos y consideraciones

| Riesgo                                                                              | Mitigación                                                                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| React StrictMode ejecuta el efecto 2 veces en dev                                   | Flag módulo `bootstrapped` en `useSessionBootstrap`.                                                         |
| El helper de token se pierde al recargar hasta que corre `restoreSession`           | `restoreSession` reinyecta el token persistido antes de llamar a `GET /auth/me`; se ejecuta al montar `App`. |
| El mensaje del backend está en español aunque la UI esté en inglés                  | Aceptado por requisito (mostrar el error del backend). Documentado como limitación del contrato.             |
| Test existente `loginUser returns success for mock login` fallará al quitar el mock | Se actualiza explícitamente en el Paso 6.2.                                                                  |
| No hay Testing Library                                                              | Pruebas de lógica en servicio/store/helper; componente solo export (patrón vigente).                         |

---

## 10. Fuera de alcance (no implementar)

- Cualquier cambio en `yawi_api` (solo lectura).
- Login de perfiles negocio/artesano/vendor (este login es **solo Customers**).
- Creación de un dashboard/página de cuenta de Customer (el redirect permanece en `/`).
- `AuthContext` o nuevas carpetas en `src/`.
- Instalación de dependencias nuevas.
- Cambios en la infraestructura (Docker, compose, env).

---

## 11. Orden de ejecución sugerido

1. `types/auth.ts`
2. `lib/authToken.ts` (+ test)
3. `api/auth.api.ts` (+ test)
4. `services/auth.service.ts` (+ test)
5. `store/authStore.ts` (+ test)
6. `features/auth/hooks/useSessionBootstrap.ts`
7. `App.tsx`
8. `LoginForm.tsx`
9. READMEs + `docs/DECISIONS.md`
10. Verificación (`npx vitest run`, `npm run build`, `npm run format:check`)
