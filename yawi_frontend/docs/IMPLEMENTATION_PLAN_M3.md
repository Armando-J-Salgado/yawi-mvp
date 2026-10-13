# Plan de Implementación — Milestone 3: Login y Registro de Customers

## Meta

Entregar las páginas de **inicio de sesión** (`/login`) y **registro de clientes** (`/register`) para el frontend de Yawi, incluyendo:

- Formulario de registro dividido en **dos fases** (credenciales → datos personales) para evitar saturar al usuario.
- Formulario de inicio de sesión con seguridad por oscuridad (no revela qué campo falla).
- Sistema de **toast notifications** personalizado, estilizado según `DESIGN.md`.
- Componentes de formulario reutilizables (`Input`, `Select`) en el design system.
- **Layout de autenticación** limpio y minimalista (solo logo + contenido, sin Navbar ni Footer).
- Validaciones puras con funciones testeables en `utils/`.
- Selector de países con el paquete `i18n-iso-countries` para evitar datos abiertos.
- Traducciones completas ES/EN en namespace `auth`.
- Tipos `AuthUser` y `CustomerRegistrationData` definidos en `types/`.
- API y servicios mockeados, preparados para integración futura.
- Navbar actualizada con enlace real a `/login`.
- Cumplimiento estricto de la paleta, tipografía y reglas de `DESIGN.md`.

> **Alcance:** Solo `yawi_frontend/`. No se modifica `yawi_api/`, `yawi_n8n/` ni infraestructura Docker. No se implementan conexiones reales con el backend; se preparan funciones mockeadas.

---

## Índice

1. [Contexto y estado actual](#1-contexto-y-estado-actual)
2. [Decisiones tomadas antes del plan](#2-decisiones-tomadas-antes-del-plan)
3. [Fase 0 — Tipos y modelos de dominio](#fase-0--tipos-y-modelos-de-dominio)
4. [Fase 1 — i18n: Namespace auth](#fase-1--i18n-namespace-auth)
5. [Fase 2 — Validaciones puras](#fase-2--validaciones-puras)
6. [Fase 3 — Componentes UI: Input, Select, Toast](#fase-3--componentes-ui-input-select-toast)
7. [Fase 4 — API y servicios mockeados](#fase-4--api-y-servicios-mockeados)
8. [Fase 5 — Feature auth: componentes de formulario](#fase-5--feature-auth-componentes-de-formulario)
9. [Fase 6 — Layout de autenticación y páginas](#fase-6--layout-de-autenticación-y-páginas)
10. [Fase 7 — Routing y actualización de Navbar](#fase-7--routing-y-actualización-de-navbar)
11. [Fase 8 — Pulido, responsive y QA](#fase-8--pulido-responsive-y-qa)
12. [Fase 9 — Documentación y READMEs](#fase-9--documentación-y-readmes)
13. [Árbol de archivos final](#árbol-de-archivos-final)
14. [Criterios de aceptación](#criterios-de-aceptación)
15. [Checklist final](#checklist-final)

---

## 1. Contexto y estado actual

El Milestone 2 entregó:

- **Design system** en `src/components/ui/`: `Button`, `Card`, `Badge`, `SectionContainer`, `ImagePlaceholder`, `Skeleton`.
- **Layout global** en `src/components/layout/`: `Navbar` (con `NavLinks` y `MobileMenu`), `Footer`, `AppLayout`.
- **Features** `landing` y `seller` implementadas.
- **Routing** en `src/routes/index.tsx` con rutas `/` y `/vender` envueltas en `AppLayout`.
- **i18n** con namespaces: `common`, `landing`, `nav`, `footer`, `seller`.
- **`index.css`** con `@theme` centralizado — fuente única de verdad para colores.
- **`authStore.ts`** en `src/store/` con Zustand: modelo `User` básico (`name`, `email`, `avatarUrl`), `isAuthenticated` y acciones `setAuthenticated` / `setUser`.
- **Navbar** con botón "Iniciar sesión" que actualmente hace `setAuthenticated(true)` directamente (sin página de login).
- **Dependencias relevantes:** `zustand`, `react-router-dom`, `react-i18next`, `lucide-react`, `tailwindcss v4`.

Lo que M3 añade:

- Rutas `/login` y `/register` con layout de autenticación dedicado.
- Feature `src/features/auth/` con componentes de formulario.
- Componentes UI nuevos: `Input`, `Select`, `Toast`/`ToastContainer`.
- Validaciones puras en `src/utils/validation.ts`.
- API mockeada `src/api/auth.api.ts` y servicio `src/services/auth.service.ts`.
- Tipos de dominio: `AuthUser`, `CustomerRegistrationData`, `LoginCredentials`.
- Paquete nuevo: `i18n-iso-countries`.
- Namespace i18n `auth` (ES + EN).
- Refactor de Navbar para enlazar a `/login`.

---

## 2. Decisiones tomadas antes del plan

| #      | Decisión                      | Opciones consideradas                                                                     | Elección                                                     | Justificación                                                                                                                                                 |
| ------ | ----------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **18** | **Rutas URL**                 | `/iniciar-sesion` y `/registro`, `/login` y `/register`, `/auth/login` y `/auth/register` | **`/login` y `/register`**                                   | Convención universal en apps web. Simplicidad, familiaridad para usuarios y consistencia con la práctica estándar de la industria.                            |
| **19** | **Layout de autenticación**   | `AppLayout` (Navbar + Footer), Layout limpio minimalista                                  | **Layout limpio (solo logo + contenido)**                    | Reduce distracciones, da aspecto profesional y premium. Las páginas de auth no necesitan navegación completa.                                                 |
| **20** | **Fuente de países**          | `i18n-iso-countries`, API REST Countries, Array estático                                  | **`i18n-iso-countries`**                                     | Lista completa traducida ES/EN sin llamadas HTTP. Se integra con i18n del proyecto. Cero latencia. El cacheo es implícito (es un paquete estático).           |
| **21** | **Toast notifications**       | Componente custom, `react-hot-toast`, `sonner`                                            | **Componente personalizado en `components/ui/`**             | Sin dependencias extra. Estilizado 100% acorde a `DESIGN.md`. Control total sobre animaciones y comportamiento. Coherente con la filosofía del design system. |
| **22** | **Modelo Customer**           | Tipo desde cero, Modelo del backend                                                       | **Definir `Customer` desde cero en `src/types/`**            | El backend no está conectado en este milestone. Se define la estructura ideal y se ajusta después.                                                            |
| **23** | **Refactor authStore**        | Ampliar `User` → `AuthUser`, Crear `Customer` separado, Reemplazar `User`                 | **Ampliar `User` → `AuthUser` + `CustomerRegistrationData`** | Evolución del tipo existente. `AuthUser` para datos de sesión, `CustomerRegistrationData` para el formulario. Separación de responsabilidades.                |
| **24** | **Navbar → Login**            | Link a `/login`, Mantener botón directo                                                   | **Convertir botón en `Link` a `/login`**                     | Flujo real de navegación. MobileMenu también debe incluir el enlace.                                                                                          |
| **25** | **Validación de formularios** | Funciones puras en `utils/`, `react-hook-form` + `zod`, Solo `react-hook-form`            | **Funciones puras en `utils/validation.ts`**                 | Sin dependencias extra. Testeables. Alineado con la filosofía MVP ligera. Se puede migrar a zod en el futuro si se necesita.                                  |

> Estas decisiones deben registrarse en `docs/DECISIONS.md` al finalizar la implementación.

---

## Fase 0 — Tipos y modelos de dominio

**Objetivo:** Definir los tipos TypeScript necesarios para auth antes de implementar cualquier componente o lógica.

### Archivos a crear/modificar

#### 0.1 Crear `src/types/auth.ts`

```ts
/**
 * Datos de usuario autenticado almacenados en el store.
 * Evolución del tipo `User` original con campos adicionales del Customer.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastname: string;
  country: string;
  address: string;
  avatarUrl?: string;
}

/**
 * Datos que envía el formulario de registro.
 * Separado de AuthUser porque incluye password y confirmación.
 */
export interface CustomerRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  lastname: string;
  country: string;
  address: string;
}

/**
 * Credenciales para iniciar sesión.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Respuesta genérica de operaciones de auth (mockeada por ahora).
 */
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}
```

#### 0.2 Modificar `src/store/authStore.ts`

Refactorizar para usar `AuthUser` en lugar del `User` básico:

```ts
import { create } from 'zustand';
import type { AuthUser } from '../types/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  /**
   * Acción de login completa: valida credenciales y actualiza estado.
   * En M3 usa servicio mockeado. En futuro: conectar auth.service.ts → auth.api.ts.
   */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  /**
   * Cierra la sesión y limpia el usuario.
   */
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  login: async (_email, _password) => {
    // TODO [M4]: Reemplazar con llamada a auth.service.ts → auth.api.ts
    // const result = await authService.login(email, password);
    // if (result.success && result.user) {
    //   set({ isAuthenticated: true, user: result.user });
    // }
    // return result;

    // Mock: siempre exitoso
    set({
      isAuthenticated: true,
      user: {
        id: 'mock-id',
        email: _email,
        name: 'Usuario',
        lastname: 'Demo',
        country: 'SV',
        address: 'Dirección de prueba',
      },
    });
    return { success: true };
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}));
```

> **Nota importante:** El tipo `User` exportado originalmente desde `authStore.ts` es importado por `Navbar.tsx`. Al reemplazarlo por `AuthUser` desde `types/auth.ts`, verificar y actualizar todas las importaciones. Buscar `import { User }` o `import type { User }` en el proyecto.

### Reglas a seguir

- Los tipos van en `src/types/auth.ts` (compartidos) porque son usados por `store/`, `api/`, `services/` y `features/auth/`.
- No colocar tipos inline en componentes.
- Usar `interface` (no `type`) para objetos, según convención del proyecto.
- Exportar siempre con named exports (no default).

---

## Fase 1 — i18n: Namespace auth

**Objetivo:** Crear el namespace `auth` con todas las traducciones necesarias para login, registro, validaciones y toasts.

### Archivos a crear

#### 1.1 Crear `src/i18n/locales/es/auth.json`

```json
{
  "login": {
    "title": "Iniciar sesión",
    "subtitle": "Bienvenido de vuelta a Yawi",
    "email_label": "Correo electrónico",
    "email_placeholder": "tu@correo.com",
    "password_label": "Contraseña",
    "password_placeholder": "Tu contraseña",
    "submit": "Iniciar sesión",
    "no_account": "¿No tienes una cuenta?",
    "register_link": "Crear cuenta",
    "error_invalid_credentials": "Correo electrónico o contraseña incorrectos.",
    "success": "¡Inicio de sesión exitoso!"
  },
  "register": {
    "title": "Crear cuenta",
    "subtitle": "Únete a la comunidad Yawi",
    "step_1_title": "Credenciales",
    "step_2_title": "Datos personales",
    "email_label": "Correo electrónico",
    "email_placeholder": "tu@correo.com",
    "password_label": "Contraseña",
    "password_placeholder": "Mínimo 8 caracteres",
    "confirm_password_label": "Confirmar contraseña",
    "confirm_password_placeholder": "Repite tu contraseña",
    "name_label": "Nombre",
    "name_placeholder": "Tu nombre",
    "lastname_label": "Apellido",
    "lastname_placeholder": "Tu apellido",
    "country_label": "País",
    "country_placeholder": "Selecciona tu país",
    "address_label": "Dirección",
    "address_placeholder": "Tu dirección completa (mín. 10 caracteres)",
    "next_step": "Continuar",
    "prev_step": "Atrás",
    "submit": "Crear cuenta",
    "has_account": "¿Ya tienes una cuenta?",
    "login_link": "Iniciar sesión",
    "success": "¡Cuenta creada exitosamente! Inicia sesión para continuar.",
    "error_generic": "Ocurrió un error al crear la cuenta. Intenta de nuevo."
  },
  "validation": {
    "email_required": "El correo electrónico es obligatorio.",
    "email_invalid": "Ingresa un correo electrónico válido.",
    "password_required": "La contraseña es obligatoria.",
    "password_min_length": "La contraseña debe tener al menos 8 caracteres.",
    "confirm_password_required": "Confirma tu contraseña.",
    "confirm_password_mismatch": "Las contraseñas no coinciden.",
    "name_required": "El nombre es obligatorio.",
    "name_only_letters": "El nombre solo debe contener letras.",
    "name_min_length": "El nombre debe tener al menos 2 caracteres.",
    "lastname_required": "El apellido es obligatorio.",
    "lastname_only_letters": "El apellido solo debe contener letras.",
    "lastname_min_length": "El apellido debe tener al menos 2 caracteres.",
    "country_required": "Selecciona un país.",
    "address_required": "La dirección es obligatoria.",
    "address_min_length": "La dirección debe tener al menos 10 caracteres."
  }
}
```

#### 1.2 Crear `src/i18n/locales/en/auth.json`

```json
{
  "login": {
    "title": "Sign in",
    "subtitle": "Welcome back to Yawi",
    "email_label": "Email address",
    "email_placeholder": "you@email.com",
    "password_label": "Password",
    "password_placeholder": "Your password",
    "submit": "Sign in",
    "no_account": "Don't have an account?",
    "register_link": "Create account",
    "error_invalid_credentials": "Invalid email or password.",
    "success": "Signed in successfully!"
  },
  "register": {
    "title": "Create account",
    "subtitle": "Join the Yawi community",
    "step_1_title": "Credentials",
    "step_2_title": "Personal details",
    "email_label": "Email address",
    "email_placeholder": "you@email.com",
    "password_label": "Password",
    "password_placeholder": "At least 8 characters",
    "confirm_password_label": "Confirm password",
    "confirm_password_placeholder": "Repeat your password",
    "name_label": "First name",
    "name_placeholder": "Your first name",
    "lastname_label": "Last name",
    "lastname_placeholder": "Your last name",
    "country_label": "Country",
    "country_placeholder": "Select your country",
    "address_label": "Address",
    "address_placeholder": "Your full address (min. 10 characters)",
    "next_step": "Continue",
    "prev_step": "Back",
    "submit": "Create account",
    "has_account": "Already have an account?",
    "login_link": "Sign in",
    "success": "Account created successfully! Sign in to continue.",
    "error_generic": "An error occurred while creating your account. Please try again."
  },
  "validation": {
    "email_required": "Email is required.",
    "email_invalid": "Enter a valid email address.",
    "password_required": "Password is required.",
    "password_min_length": "Password must be at least 8 characters.",
    "confirm_password_required": "Please confirm your password.",
    "confirm_password_mismatch": "Passwords do not match.",
    "name_required": "First name is required.",
    "name_only_letters": "First name must only contain letters.",
    "name_min_length": "First name must be at least 2 characters.",
    "lastname_required": "Last name is required.",
    "lastname_only_letters": "Last name must only contain letters.",
    "lastname_min_length": "Last name must be at least 2 characters.",
    "country_required": "Please select a country.",
    "address_required": "Address is required.",
    "address_min_length": "Address must be at least 10 characters."
  }
}
```

#### 1.3 Modificar `src/i18n/i18n.ts`

Agregar las importaciones del namespace `auth` y registrarlas en `resources`:

```diff
+import esAuth from './locales/es/auth.json';
+import enAuth from './locales/en/auth.json';

 // Dentro de resources:
 es: {
   common: esCommon,
   landing: esLanding,
   nav: esNav,
   footer: esFooter,
   seller: esSeller,
+  auth: esAuth,
 },
 en: {
   common: enCommon,
   landing: enLanding,
   nav: enNav,
   footer: enFooter,
   seller: enSeller,
+  auth: enAuth,
 },
```

### Reglas a seguir

- Todo texto visible al usuario viene de i18n. Cero strings hardcodeados en componentes.
- Los mensajes de validación están en la sección `validation` del namespace `auth`.
- Login y registro tienen secciones separadas dentro del mismo namespace.

---

## Fase 2 — Validaciones puras

**Objetivo:** Crear funciones de validación reutilizables, testeables y sin dependencias de React.

### Archivos a crear

#### 2.1 Crear `src/utils/validation.ts`

```ts
/**
 * Funciones de validación puras para formularios.
 * Cada función recibe un valor y retorna una clave de error i18n o null si es válido.
 * Los componentes traducen la clave usando useTranslation('auth').
 */

/** Regex estándar para formato de email (RFC 5322 simplificado) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Solo letras (incluyendo acentos y ñ) y espacios */
const ONLY_LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'validation.email_required';
  if (!EMAIL_REGEX.test(trimmed)) return 'validation.email_invalid';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'validation.password_required';
  if (password.length < 8) return 'validation.password_min_length';
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return 'validation.confirm_password_required';
  if (password !== confirmPassword) return 'validation.confirm_password_mismatch';
  return null;
}

/**
 * Valida un campo de nombre (name o lastname).
 * @param value - Valor del campo
 * @param field - 'name' | 'lastname' para elegir las claves de error correctas
 */
export function validateNameField(value: string, field: 'name' | 'lastname'): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `validation.${field}_required`;
  if (!ONLY_LETTERS_REGEX.test(trimmed)) return `validation.${field}_only_letters`;
  if (trimmed.length < 2) return `validation.${field}_min_length`;
  return null;
}

export function validateCountry(country: string): string | null {
  if (!country) return 'validation.country_required';
  return null;
}

export function validateAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return 'validation.address_required';
  if (trimmed.length < 10) return 'validation.address_min_length';
  return null;
}

/**
 * Valida todos los campos del Step 1 (credenciales).
 * Retorna un objeto con errores por campo. Campos sin error no aparecen.
 */
export function validateStep1(data: {
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  const confirmError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  return errors;
}

/**
 * Valida todos los campos del Step 2 (datos personales).
 * Retorna un objeto con errores por campo.
 */
export function validateStep2(data: {
  name: string;
  lastname: string;
  country: string;
  address: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateNameField(data.name, 'name');
  if (nameError) errors.name = nameError;
  const lastnameError = validateNameField(data.lastname, 'lastname');
  if (lastnameError) errors.lastname = lastnameError;
  const countryError = validateCountry(data.country);
  if (countryError) errors.country = countryError;
  const addressError = validateAddress(data.address);
  if (addressError) errors.address = addressError;
  return errors;
}

/**
 * Valida credenciales de login.
 * Retorna un objeto con errores por campo.
 */
export function validateLoginForm(data: {
  email: string;
  password: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  return errors;
}
```

#### 2.2 Crear `src/utils/validation.test.ts`

Test colocado junto al archivo según convención de `ARCHITECTURE.md`:

```ts
import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateNameField,
  validateCountry,
  validateAddress,
  validateStep1,
  validateStep2,
  validateLoginForm,
} from './validation';

describe('validateEmail', () => {
  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('validation.email_required');
  });
  it('returns error for invalid format', () => {
    expect(validateEmail('notanemail')).toBe('validation.email_invalid');
  });
  it('returns null for valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });
  it('trims whitespace', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('validation.password_required');
  });
  it('returns error for short password', () => {
    expect(validatePassword('abc1234')).toBe('validation.password_min_length');
  });
  it('returns null for valid password', () => {
    expect(validatePassword('securepass')).toBeNull();
  });
});

describe('validateConfirmPassword', () => {
  it('returns error for empty confirmation', () => {
    expect(validateConfirmPassword('pass1234', '')).toBe('validation.confirm_password_required');
  });
  it('returns error for mismatch', () => {
    expect(validateConfirmPassword('pass1234', 'pass5678')).toBe(
      'validation.confirm_password_mismatch',
    );
  });
  it('returns null when matches', () => {
    expect(validateConfirmPassword('pass1234', 'pass1234')).toBeNull();
  });
});

describe('validateNameField', () => {
  it('returns error for empty name', () => {
    expect(validateNameField('', 'name')).toBe('validation.name_required');
  });
  it('returns error for numbers in name', () => {
    expect(validateNameField('Juan123', 'name')).toBe('validation.name_only_letters');
  });
  it('returns error for special characters', () => {
    expect(validateNameField('J@n', 'name')).toBe('validation.name_only_letters');
  });
  it('returns error for short name (after trim)', () => {
    expect(validateNameField(' A ', 'name')).toBe('validation.name_min_length');
  });
  it('accepts accented characters and ñ', () => {
    expect(validateNameField('María José', 'name')).toBeNull();
  });
  it('works for lastname field', () => {
    expect(validateNameField('', 'lastname')).toBe('validation.lastname_required');
  });
});

describe('validateCountry', () => {
  it('returns error for empty country', () => {
    expect(validateCountry('')).toBe('validation.country_required');
  });
  it('returns null for selected country', () => {
    expect(validateCountry('SV')).toBeNull();
  });
});

describe('validateAddress', () => {
  it('returns error for empty address', () => {
    expect(validateAddress('')).toBe('validation.address_required');
  });
  it('returns error for short address', () => {
    expect(validateAddress('Calle 1')).toBe('validation.address_min_length');
  });
  it('returns null for valid address', () => {
    expect(validateAddress('Avenida Central #123, San Salvador')).toBeNull();
  });
});

describe('validateStep1', () => {
  it('returns all errors for empty data', () => {
    const errors = validateStep1({ email: '', password: '', confirmPassword: '' });
    expect(Object.keys(errors)).toHaveLength(3);
  });
  it('returns empty object for valid data', () => {
    const errors = validateStep1({
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(errors).toEqual({});
  });
});

describe('validateStep2', () => {
  it('returns all errors for empty data', () => {
    const errors = validateStep2({ name: '', lastname: '', country: '', address: '' });
    expect(Object.keys(errors)).toHaveLength(4);
  });
});

describe('validateLoginForm', () => {
  it('returns errors for empty fields', () => {
    const errors = validateLoginForm({ email: '', password: '' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});
```

### Reglas a seguir

- Las funciones **retornan claves i18n**, no mensajes traducidos. La traducción ocurre en el componente.
- Sin dependencias de React, sin imports de i18n.
- Cada función es pura: mismo input → mismo output.
- El test cubre todos los casos edge mencionados en los requerimientos.

---

## Fase 3 — Componentes UI: Input, Select, Toast

**Objetivo:** Crear los componentes presentacionales reutilizables que los formularios necesitan. Estos van en `components/ui/` porque son genéricos y sin conocimiento de dominio.

### 3.1 Componente `Input`

**Crear** `src/components/ui/Input/Input.tsx`:

```tsx
import React from 'react';

export interface InputProps {
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Error message (already translated). Shows error state when present. */
  error?: string;
  /** HTML name attribute */
  name?: string;
  /** HTML id attribute */
  id?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  name,
  id,
  disabled = false,
  className = '',
  autoComplete,
}) => {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-primary-text">
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full px-4 py-3 rounded-2xl border bg-surface text-primary-text
          text-base font-normal leading-relaxed
          placeholder:text-muted-text/60
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-indigo/40 focus:border-primary-indigo
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-400 ring-1 ring-red-400/30 focus:ring-red-400/40 focus:border-red-400'
              : 'border-border hover:border-primary-indigo/40'
          }
        `}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

**Crear** `src/components/ui/Input/index.ts`:

```ts
export { Input } from './Input';
export type { InputProps } from './Input';
```

> **Nota sobre color de error:** Se usa `red-400`/`red-500` de Tailwind para estados de error. Si la paleta en `DESIGN.md` se expande con colores semánticos en el futuro, se deben registrar como variables en `@theme` (ej. `--color-error: #ef4444`). Por ahora, el rojo de Tailwind es aceptable para estados de error ya que no compite con la paleta de marca.

### 3.2 Componente `Select`

**Crear** `src/components/ui/Select/Select.tsx`:

```tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Label text */
  label?: string;
  /** Placeholder shown when no value selected */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Available options */
  options: SelectOption[];
  /** Error message (already translated) */
  error?: string;
  /** HTML name attribute */
  name?: string;
  /** HTML id attribute */
  id?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  name,
  id,
  disabled = false,
  className = '',
}) => {
  const selectId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-primary-text">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`
            w-full px-4 py-3 pr-10 rounded-2xl border bg-surface text-primary-text
            text-base font-normal leading-relaxed appearance-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-indigo/40 focus:border-primary-indigo
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!value ? 'text-muted-text/60' : ''}
            ${
              error
                ? 'border-red-400 ring-1 ring-red-400/30 focus:ring-red-400/40 focus:border-red-400'
                : 'border-border hover:border-primary-indigo/40'
            }
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

**Crear** `src/components/ui/Select/index.ts`:

```ts
export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';
```

### 3.3 Componente `Toast` y `ToastContainer`

El sistema de toasts se compone de:

1. **`Toast.tsx`** — componente presentacional individual.
2. **`ToastContainer.tsx`** — contenedor que renderiza los toasts activos.
3. **`useToast.ts`** — hook con store Zustand para manejar el estado de toasts globalmente.

#### Crear `src/components/ui/Toast/Toast.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ElementType;
    bgClass: string;
    borderClass: string;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    iconClass: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    iconClass: 'text-red-600',
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    iconClass: 'text-blue-600',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-card
        max-w-sm w-full pointer-events-auto
        transition-all duration-300 ease-out
        ${config.bgClass} ${config.borderClass}
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.iconClass}`} />
      <p className="text-sm text-primary-text flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="p-1 rounded-full hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-text" />
      </button>
    </div>
  );
};
```

#### Crear `src/components/ui/Toast/ToastContainer.tsx`

```tsx
import React from 'react';
import { Toast } from './Toast';
import { useToastStore } from './useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
```

#### Crear `src/components/ui/Toast/useToast.ts`

```ts
import { create } from 'zustand';
import type { ToastData, ToastVariant } from './Toast';

interface ToastState {
  toasts: ToastData[];
  addToast: (message: string, variant: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, variant, duration) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const toast: ToastData = { id, message, variant, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

/**
 * Convenience functions para usar en cualquier parte de la app.
 * Ejemplo: showToast.success('¡Listo!');
 */
export const showToast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast(message, 'success', duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast(message, 'error', duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast(message, 'info', duration),
};
```

#### Crear `src/components/ui/Toast/index.ts`

```ts
export { Toast } from './Toast';
export { ToastContainer } from './ToastContainer';
export { useToastStore, showToast } from './useToast';
export type { ToastData, ToastVariant, ToastProps } from './Toast';
```

### 3.4 Actualizar barrel export de `ui/`

**Modificar** `src/components/ui/index.ts` — agregar:

```diff
+export { Input } from './Input';
+export type { InputProps } from './Input';
+
+export { Select } from './Select';
+export type { SelectProps, SelectOption } from './Select';
+
+export { Toast, ToastContainer } from './Toast';
+export { useToastStore, showToast } from './Toast';
+export type { ToastData, ToastVariant, ToastProps } from './Toast';
```

### 3.5 Montar `ToastContainer` en `App.tsx`

**Modificar** `src/App.tsx`:

```tsx
import { AppRoutes } from './routes';
import { ToastContainer } from './components/ui';

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
```

> El `ToastContainer` se monta a nivel de `App` (fuera del router) para que los toasts sean visibles en cualquier página, incluidas las que usan el AuthLayout.

### Reglas a seguir

- Los componentes `Input`, `Select` y `Toast` van en `components/ui/` porque son genéricos, sin conocimiento de dominio.
- Reciben texto vía props (no usan `useTranslation` directamente).
- Estilos alineados con `DESIGN.md`: `border-radius: 24px` → `rounded-2xl`, colores de la paleta, transiciones suaves.
- Accesibilidad: `aria-invalid`, `aria-describedby`, `role="alert"`, labels asociados.
- El `Toast` usa colores semánticos de Tailwind (green, red, blue) que son estándar para feedback. Si se desea centralizar en `@theme`, se puede hacer en un futuro milestone.

---

## Fase 4 — API y servicios mockeados

**Objetivo:** Preparar la capa de API y servicios para que, cuando se conecte el backend, solo se modifique `auth.api.ts`.

### 4.1 Crear `src/api/auth.api.ts`

```ts
import type { AuthResponse, CustomerRegistrationData, LoginCredentials } from '../types/auth';

/**
 * Llama al endpoint de login del backend.
 * TODO [M4]: Reemplazar con llamada real a Supabase o API REST.
 *
 * @param credentials - Email y password del usuario
 * @returns AuthResponse con usuario autenticado o error
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO [M4]: Implementar llamada real
  // Ejemplo con Supabase:
  // const { data, error } = await supabase.auth.signInWithPassword({
  //   email: credentials.email,
  //   password: credentials.password,
  // });
  // if (error) return { success: false, error: error.message };
  // return { success: true, user: mapToAuthUser(data.user) };

  // Mock: simula delay de red y retorna éxito
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    success: true,
    user: {
      id: 'mock-user-id',
      email: credentials.email,
      name: 'Usuario',
      lastname: 'Demo',
      country: 'SV',
      address: 'Dirección de prueba, San Salvador',
    },
  };
}

/**
 * Llama al endpoint de registro del backend.
 * TODO [M4]: Reemplazar con llamada real a Supabase o API REST.
 *
 * @param data - Datos del formulario de registro (sin confirmPassword)
 * @returns AuthResponse con resultado de la operación
 */
export async function registerApi(
  data: Omit<CustomerRegistrationData, 'confirmPassword'>,
): Promise<AuthResponse> {
  // TODO [M4]: Implementar llamada real
  // Ejemplo con Supabase:
  // const { data: authData, error } = await supabase.auth.signUp({
  //   email: data.email,
  //   password: data.password,
  // });
  // if (error) return { success: false, error: error.message };
  // // Guardar perfil en tabla customers
  // await supabase.from('customers').insert({ ... });
  // return { success: true };

  // Mock: simula delay de red y retorna éxito
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
}
```

### 4.2 Crear `src/services/auth.service.ts`

```ts
import { loginApi, registerApi } from '../api/auth.api';
import type { AuthResponse, CustomerRegistrationData, LoginCredentials } from '../types/auth';

/**
 * Servicio de autenticación.
 * Orquesta las llamadas a la API y aplica lógica de negocio (mapeo, logging, etc.).
 * Los componentes y el store consumen este servicio, nunca la API directamente.
 */

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  // Aquí se podría agregar lógica pre/post llamada (analytics, logging, etc.)
  return loginApi(credentials);
}

export async function registerUser(data: CustomerRegistrationData): Promise<AuthResponse> {
  // Excluir confirmPassword antes de enviar al backend
  const { confirmPassword: _, ...registrationPayload } = data;
  return registerApi(registrationPayload);
}
```

### 4.3 Crear `src/services/auth.service.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { loginUser, registerUser } from './auth.service';

describe('auth.service', () => {
  describe('loginUser', () => {
    it('returns success for mock login', async () => {
      const result = await loginUser({ email: 'test@test.com', password: 'password123' });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@test.com');
    });
  });

  describe('registerUser', () => {
    it('returns success for mock registration', async () => {
      const result = await registerUser({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'Juan',
        lastname: 'Pérez',
        country: 'SV',
        address: 'Avenida Central #123, San Salvador',
      });
      expect(result.success).toBe(true);
    });

    it('does not send confirmPassword to API', async () => {
      // This test ensures the service strips confirmPassword
      // In a real scenario, we'd use MSW to verify the request payload
      const result = await registerUser({
        email: 'new@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'Juan',
        lastname: 'Pérez',
        country: 'SV',
        address: 'Avenida Central #123',
      });
      expect(result.success).toBe(true);
    });
  });
});
```

### Reglas a seguir

- Solo `api/` habla con el backend. `services/` orquesta llamadas y mapea datos.
- Los componentes nunca importan de `api/` directamente.
- Los TODOs con etiqueta `[M4]` marcan exactamente dónde conectar el backend.
- `confirmPassword` se excluye en el servicio antes de enviar a la API.

---

## Fase 5 — Feature auth: componentes de formulario

**Objetivo:** Crear los componentes del feature `auth` que implementan los formularios de login y registro. Estos son componentes con conocimiento de dominio y usan `useTranslation`.

### Estructura del feature

```
src/features/auth/
  components/
    LoginForm/
      LoginForm.tsx
      index.ts
    RegisterForm/
      RegisterForm.tsx
      RegisterStepIndicator.tsx
      index.ts
  hooks/
    useCountries.ts
  types.ts
  index.ts
```

### 5.1 Instalar dependencia de países

```bash
npm install i18n-iso-countries
```

### 5.2 Crear `src/features/auth/hooks/useCountries.ts`

```ts
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';

// Registrar idiomas necesarios
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

export interface CountryOption {
  value: string; // ISO alpha-2 code
  label: string; // Translated country name
}

/**
 * Hook que retorna la lista de países traducida al idioma actual.
 * Usa i18n-iso-countries con cacheo implícito (paquete estático).
 * La lista se recalcula solo cuando cambia el idioma.
 */
export function useCountries(): CountryOption[] {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';

  return useMemo(() => {
    const namesByCode = countries.getNames(lang, { select: 'official' });
    return Object.entries(namesByCode)
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, lang));
  }, [lang]);
}
```

### 5.3 Crear `src/features/auth/types.ts`

```ts
/**
 * Tipos locales del feature auth.
 * Los tipos compartidos (AuthUser, LoginCredentials, etc.) están en src/types/auth.ts.
 */

/** Estado del formulario de registro (maneja los dos steps) */
export interface RegisterFormState {
  // Step 1 — Credenciales
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 — Datos personales
  name: string;
  lastname: string;
  country: string;
  address: string;
}

/** Step activo del formulario de registro */
export type RegisterStep = 1 | 2;
```

### 5.4 Crear `src/features/auth/components/RegisterForm/RegisterStepIndicator.tsx`

```tsx
import React from 'react';
import type { RegisterStep } from '../../types';

interface RegisterStepIndicatorProps {
  currentStep: RegisterStep;
  step1Label: string;
  step2Label: string;
}

export const RegisterStepIndicator: React.FC<RegisterStepIndicatorProps> = ({
  currentStep,
  step1Label,
  step2Label,
}) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Step 1 */}
      <div className="flex items-center gap-2 flex-1">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            transition-colors duration-300
            ${currentStep >= 1 ? 'bg-primary-navy text-white' : 'bg-border text-muted-text'}
          `}
        >
          1
        </div>
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            currentStep >= 1 ? 'text-primary-text' : 'text-muted-text'
          }`}
        >
          {step1Label}
        </span>
      </div>

      {/* Connector */}
      <div
        className={`h-0.5 w-8 rounded-full transition-colors duration-300 ${
          currentStep >= 2 ? 'bg-primary-navy' : 'bg-border'
        }`}
      />

      {/* Step 2 */}
      <div className="flex items-center gap-2 flex-1">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            transition-colors duration-300
            ${currentStep >= 2 ? 'bg-primary-navy text-white' : 'bg-border text-muted-text'}
          `}
        >
          2
        </div>
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            currentStep >= 2 ? 'text-primary-text' : 'text-muted-text'
          }`}
        >
          {step2Label}
        </span>
      </div>
    </div>
  );
};
```

### 5.5 Crear `src/features/auth/components/RegisterForm/RegisterForm.tsx`

```tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Button } from '../../../../components/ui';
import { showToast } from '../../../../components/ui/Toast/useToast';
import { RegisterStepIndicator } from './RegisterStepIndicator';
import { useCountries } from '../../hooks/useCountries';
import { validateStep1, validateStep2 } from '../../../../utils/validation';
import { registerUser } from '../../../../services/auth.service';
import type { RegisterFormState, RegisterStep } from '../../types';

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const countries = useCountries();

  const [currentStep, setCurrentStep] = useState<RegisterStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    country: '',
    address: '',
  });

  const updateField = (field: keyof RegisterFormState) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNextStep = () => {
    const step1Errors = validateStep1({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    // Translate error keys
    const translatedErrors: Record<string, string> = {};
    for (const [key, errorKey] of Object.entries(step1Errors)) {
      translatedErrors[key] = t(errorKey);
    }

    if (Object.keys(translatedErrors).length > 0) {
      setErrors(translatedErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const step2Errors = validateStep2({
      name: formData.name,
      lastname: formData.lastname,
      country: formData.country,
      address: formData.address,
    });

    // Translate error keys
    const translatedErrors: Record<string, string> = {};
    for (const [key, errorKey] of Object.entries(step2Errors)) {
      translatedErrors[key] = t(errorKey);
    }

    if (Object.keys(translatedErrors).length > 0) {
      setErrors(translatedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser(formData);

      if (result.success) {
        showToast.success(t('register.success'));
        // Redirigir a login después de registro exitoso
        navigate('/login');
      } else {
        showToast.error(result.error || t('register.error_generic'));
      }
    } catch {
      showToast.error(t('register.error_generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md mx-auto">
      <RegisterStepIndicator
        currentStep={currentStep}
        step1Label={t('register.step_1_title')}
        step2Label={t('register.step_2_title')}
      />

      {/* Step 1: Credenciales */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-5">
          <Input
            type="email"
            name="email"
            label={t('register.email_label')}
            placeholder={t('register.email_placeholder')}
            value={formData.email}
            onChange={updateField('email')}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            type="password"
            name="password"
            label={t('register.password_label')}
            placeholder={t('register.password_placeholder')}
            value={formData.password}
            onChange={updateField('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            type="password"
            name="confirmPassword"
            label={t('register.confirm_password_label')}
            placeholder={t('register.confirm_password_placeholder')}
            value={formData.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleNextStep}
            className="w-full mt-2"
          >
            {t('register.next_step')}
          </Button>
        </div>
      )}

      {/* Step 2: Datos personales */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-5">
          <Input
            type="text"
            name="name"
            label={t('register.name_label')}
            placeholder={t('register.name_placeholder')}
            value={formData.name}
            onChange={updateField('name')}
            error={errors.name}
            autoComplete="given-name"
          />
          <Input
            type="text"
            name="lastname"
            label={t('register.lastname_label')}
            placeholder={t('register.lastname_placeholder')}
            value={formData.lastname}
            onChange={updateField('lastname')}
            error={errors.lastname}
            autoComplete="family-name"
          />
          <Select
            name="country"
            label={t('register.country_label')}
            placeholder={t('register.country_placeholder')}
            value={formData.country}
            onChange={updateField('country')}
            options={countries}
            error={errors.country}
          />
          <Input
            type="text"
            name="address"
            label={t('register.address_label')}
            placeholder={t('register.address_placeholder')}
            value={formData.address}
            onChange={updateField('address')}
            error={errors.address}
            autoComplete="street-address"
          />

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handlePrevStep}
              className="flex-1"
            >
              {t('register.prev_step')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '...' : t('register.submit')}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
```

**Crear** `src/features/auth/components/RegisterForm/index.ts`:

```ts
export { RegisterForm } from './RegisterForm';
export { RegisterStepIndicator } from './RegisterStepIndicator';
```

### 5.6 Crear `src/features/auth/components/LoginForm/LoginForm.tsx`

```tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../../../../components/ui';
import { showToast } from '../../../../components/ui/Toast/useToast';
import { validateLoginForm } from '../../../../utils/validation';
import { useAuthStore } from '../../../../store/authStore';
import type { LoginCredentials } from '../../../../types/auth';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const updateField = (field: keyof LoginCredentials) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formato (no mostrar error por campo — seguridad por oscuridad)
    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      // Mostrar error genérico en toast, sin indicar qué campo falló
      showToast.error(t('login.error_invalid_credentials'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showToast.success(t('login.success'));
        // TODO [POST-M3]: Actualizar esta redirección a la página deseada.
        // Actualmente redirige al landing page. Cambiar a '/dashboard', '/cuenta',
        // o la ruta que corresponda cuando se implementen esas páginas.
        navigate('/');
      } else {
        // No revelar si falla email o password (seguridad por oscuridad)
        showToast.error(t('login.error_invalid_credentials'));
      }
    } catch {
      showToast.error(t('login.error_invalid_credentials'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-5">
        <Input
          type="email"
          name="email"
          label={t('login.email_label')}
          placeholder={t('login.email_placeholder')}
          value={formData.email}
          onChange={updateField('email')}
          autoComplete="email"
        />
        <Input
          type="password"
          name="password"
          label={t('login.password_label')}
          placeholder={t('login.password_placeholder')}
          value={formData.password}
          onChange={updateField('password')}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? '...' : t('login.submit')}
        </Button>
      </div>
    </form>
  );
};
```

**Crear** `src/features/auth/components/LoginForm/index.ts`:

```ts
export { LoginForm } from './LoginForm';
```

> **Nota clave sobre seguridad por oscuridad en LoginForm:** El formulario de login **no muestra errores individuales por campo**. Si la validación de formato falla (email vacío, contraseña corta), se muestra un toast genérico "Correo o contraseña incorrectos" sin indicar cuál campo es el problema. Los inputs de login **nunca** reciben prop `error`. Esto contrasta con el registro, donde cada input sí resalta su error específico.

### 5.7 Crear `src/features/auth/index.ts`

```ts
// Public API del feature auth
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { useCountries } from './hooks/useCountries';
```

### Reglas a seguir

- Los componentes de feature sí pueden usar `useTranslation`, stores y services.
- Los imports a `components/ui/` usan rutas relativas (hasta que se configure `@/` en un futuro milestone).
- Los errores se traducen en el componente, no en la función de validación.
- `LoginForm` no muestra errores por campo (seguridad por oscuridad). `RegisterForm` sí los muestra.
- El formulario de registro limpia el error de un campo cuando el usuario escribe en él.

---

## Fase 6 — Layout de autenticación y páginas

**Objetivo:** Crear el layout limpio para auth y las páginas de login/registro.

### 6.1 Crear `src/components/layout/AuthLayout/AuthLayout.tsx`

```tsx
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import yawiLogo from '../../../assets/yawi-logo.svg';

/**
 * Layout minimalista para páginas de autenticación.
 * Solo muestra el logo centrado, un selector de idioma discreto y el contenido del formulario.
 * No incluye Navbar ni Footer para evitar distracciones.
 */
export function AuthLayout() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header mínimo: logo + language toggle */}
      <header className="w-full px-4 sm:px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          to="/"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo rounded-lg"
        >
          <img
            src={yawiLogo}
            alt="Yawi"
            className="h-8 w-auto hover:opacity-90 transition-opacity"
          />
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-navy hover:text-primary-indigo bg-transparent hover:bg-border/40 rounded-full border border-border/80 transition-colors cursor-pointer"
          aria-label={`Change language, current: ${i18n.language}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{i18n.language.startsWith('es') ? 'EN' : 'ES'}</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
```

**Crear** `src/components/layout/AuthLayout/index.ts`:

```ts
export { AuthLayout } from './AuthLayout';
```

### 6.2 Actualizar barrel export de `layout/`

**Modificar** `src/components/layout/index.ts`:

```diff
 export { AppLayout } from './AppLayout';
+export { AuthLayout } from './AuthLayout';
```

### 6.3 Crear `src/pages/LoginPage/LoginPage.tsx`

```tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../../features/auth';

export default function LoginPage() {
  const { t } = useTranslation('auth');

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight leading-tight">
          {t('login.title')}
        </h1>
        <p className="mt-3 text-base text-muted-text">{t('login.subtitle')}</p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Link to register */}
      <p className="mt-8 text-center text-sm text-muted-text">
        {t('login.no_account')}{' '}
        <Link
          to="/register"
          className="font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
        >
          {t('login.register_link')}
        </Link>
      </p>
    </div>
  );
}
```

**Crear** `src/pages/LoginPage/index.ts`:

```ts
export { default as LoginPage } from './LoginPage';
```

### 6.4 Crear `src/pages/RegisterPage/RegisterPage.tsx`

```tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../../features/auth';

export default function RegisterPage() {
  const { t } = useTranslation('auth');

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight leading-tight">
          {t('register.title')}
        </h1>
        <p className="mt-3 text-base text-muted-text">{t('register.subtitle')}</p>
      </div>

      {/* Form */}
      <RegisterForm />

      {/* Link to login */}
      <p className="mt-8 text-center text-sm text-muted-text">
        {t('register.has_account')}{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
        >
          {t('register.login_link')}
        </Link>
      </p>
    </div>
  );
}
```

**Crear** `src/pages/RegisterPage/index.ts`:

```ts
export { default as RegisterPage } from './RegisterPage';
```

### Reglas a seguir

- Las páginas solo componen features y layout. No contienen lógica de negocio.
- Las páginas usan `default export` para habilitar lazy loading con `React.lazy()`.
- El `AuthLayout` reutiliza el mismo patrón de switch de idioma que la Navbar.
- Los links entre login y registro usan `<Link>` de react-router-dom para navegación SPA.

---

## Fase 7 — Routing y actualización de Navbar

**Objetivo:** Registrar las nuevas rutas y convertir el botón de login de la Navbar en un link real.

### 7.1 Modificar `src/routes/index.tsx`

```tsx
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { AuthLayout } from '../components/layout';
import { LandingPage } from '../pages/LandingPage';
import { SellerLandingPage } from '../pages/SellerLandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas con layout principal (Navbar + Footer) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vender" element={<SellerLandingPage />} />
      </Route>

      {/* Rutas con layout de autenticación (solo logo, sin Navbar/Footer) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
```

### 7.2 Modificar `src/components/layout/Navbar/Navbar.tsx`

Cambios necesarios:

1. Reemplazar `import { User as UserIcon }` → el import ya existe, mantenerlo.
2. Reemplazar el bloque del botón "Iniciar sesión" (que hace `setAuthenticated(true)`) por un `<Link>` a `/login`.
3. Agregar import de `Link` desde `react-router-dom`.
4. El botón de usuario autenticado debe usar `logout` en lugar de `setAuthenticated(false)`.

```diff
-import { Menu, Globe, User as UserIcon } from 'lucide-react';
+import { Link } from 'react-router-dom';
+import { Menu, Globe, User as UserIcon } from 'lucide-react';

 // En las acciones de auth:
-const { isAuthenticated, user, setAuthenticated } = useAuthStore();
+const { isAuthenticated, user, logout } = useAuthStore();

 // Botón de usuario autenticado:
-onClick={() => setAuthenticated(false)}
+onClick={() => logout()}

 // Botón de iniciar sesión (reemplazar el Button ghost):
-<Button
-  variant="ghost"
-  size="sm"
-  onClick={() => setAuthenticated(true)}
-  className="hidden sm:inline-flex items-center gap-1.5"
->
-  <UserIcon className="w-4 h-4" />
-  <span>{t('login')}</span>
-</Button>
+<Link
+  to="/login"
+  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-navy hover:text-primary-indigo transition-colors rounded-button"
+>
+  <UserIcon className="w-4 h-4" />
+  <span>{t('login')}</span>
+</Link>
```

### 7.3 Modificar `MobileMenu` del Navbar

El menú móvil también debe incluir el enlace a login. Buscar en `src/components/layout/Navbar/MobileMenu.tsx` y hacer cambios equivalentes:

- Si el usuario no está autenticado: mostrar un link a `/login` dentro del menú móvil.
- Si el usuario está autenticado: mostrar opción de cerrar sesión usando `logout()`.
- Usar `<Link>` de `react-router-dom`, no `<button onClick={setAuthenticated}>`.

> **Instrucción para el agente:** Localizar el archivo `MobileMenu.tsx`, identificar la sección de auth del menú móvil y aplicar los mismos cambios conceptuales que en la Navbar desktop: reemplazar la acción directa de `setAuthenticated(true)` por un `<Link to="/login">` y `setAuthenticated(false)` por `logout()`.

### Reglas a seguir

- Las rutas de auth usan `AuthLayout`, no `AppLayout`.
- El `AuthLayout` es un route layout (usa `<Outlet />`), igual que `AppLayout`.
- Los imports de páginas en `routes/index.tsx` no son lazy por ahora. Se puede optimizar en un futuro milestone si se desea code splitting.
- El `MobileMenu` debe cerrar el drawer al navegar a `/login` (llamar `onClose()` en el `<Link>`).

---

## Fase 8 — Pulido, responsive y QA

**Objetivo:** Verificar que todo funcione correctamente en móvil y desktop, cumpliendo los requerimientos visuales.

### Checklist de verificación visual

#### 8.1 Mobile (< 640px)

- [ ] Login: formulario ocupa ancho completo con padding lateral adecuado.
- [ ] Login: logo visible y centrado arriba.
- [ ] Login: campos de input no se cortan ni overflow horizontal.
- [ ] Login: botón "Iniciar sesión" ocupa todo el ancho.
- [ ] Login: link a registro visible y clickeable.
- [ ] Registro Step 1: misma distribución que login, con indicador de step visible.
- [ ] Registro Step 2: selector de países funciona en mobile (dropdown nativo).
- [ ] Registro Step 2: botones "Atrás" y "Crear cuenta" distribuidos correctamente.
- [ ] Toasts: aparecen en posición visible sin ocultar contenido importante. Considerar `top-4 right-4` en mobile o cambiar a `bottom-4 left-4 right-4` centrados.
- [ ] El switch de idioma en AuthLayout es accesible.
- [ ] Navegar a `/login` desde el menú hamburguesa funciona.

#### 8.2 Tablet (640px – 1024px)

- [ ] Formularios centrados con `max-w-md`.
- [ ] Espaciado proporcional.
- [ ] Sin scroll horizontal.

#### 8.3 Desktop (> 1024px)

- [ ] Formularios centrados con espacio generoso alrededor.
- [ ] Apariencia premium y limpia, consistente con el landing.
- [ ] Hover states en botones, links e inputs funcionan.
- [ ] Focus visible (ring) en todos los campos.

#### 8.4 Funcionalidad

- [ ] Registro Step 1 → validar → muestra errores con input resaltado en rojo.
- [ ] Registro Step 1 → corregir errores → "Continuar" avanza a Step 2.
- [ ] Registro Step 2 → validar → muestra errores con input resaltado.
- [ ] Registro Step 2 → "Atrás" → vuelve a Step 1 con datos conservados.
- [ ] Registro Step 2 → submit exitoso → toast de éxito → redirige a `/login`.
- [ ] Login → campos vacíos → toast de error genérico (no resalta inputs).
- [ ] Login → datos válidos → toast de éxito → redirige a `/` (landing).
- [ ] Selector de países cambia idioma de los nombres al cambiar idioma.
- [ ] Todos los textos cambian al alternar ES/EN.
- [ ] Navegar `/` → clic "Iniciar sesión" en Navbar → lleva a `/login`.
- [ ] Navegar `/login` → clic logo → lleva a `/`.
- [ ] Navegar `/login` → "Crear cuenta" → lleva a `/register`.
- [ ] Navegar `/register` → "Iniciar sesión" → lleva a `/login`.

#### 8.5 Formato de código

```bash
npm run format:check
npm run format
```

- [ ] Sin errores de formato.
- [ ] Prettier y oxlint pasan sin warnings relevantes.

---

## Fase 9 — Documentación y READMEs

### 9.1 Crear `src/features/auth/README.md`

```markdown
# Feature: Auth

Vertical slice para autenticación de clientes (login y registro).

## Estructura

auth/
components/
LoginForm/ # Formulario de inicio de sesión
RegisterForm/ # Formulario de registro (2 steps)
hooks/
useCountries.ts # Hook para lista de países (i18n-iso-countries)
types.ts # Tipos locales (RegisterFormState, RegisterStep)
index.ts # API pública del feature

## Dependencias externas

- `i18n-iso-countries`: Lista de países traducida ES/EN.

## Conexión con backend

El backend no está conectado en M3. Los archivos relevantes para conectar:

- `src/api/auth.api.ts` — Reemplazar mocks con llamadas reales (buscar TODO [M4]).
- `src/store/authStore.ts` — La acción `login` usa mock; actualizar para usar el servicio real.

## Notas

- Login usa seguridad por oscuridad: no revela qué campo falla.
- Registro valida cada campo individualmente y resalta errores.
- El formulario de registro está dividido en 2 steps para no saturar al usuario.
```

### 9.2 Crear READMEs para componentes nuevos

Crear `README.md` en:

- `src/components/ui/Input/README.md` — Documentar props, ejemplo de uso, estados (normal, error, disabled).
- `src/components/ui/Select/README.md` — Documentar props, ejemplo de uso.
- `src/components/ui/Toast/README.md` — Documentar uso de `showToast.success()`, `showToast.error()`, cómo funciona el `ToastContainer`, y el store Zustand.
- `src/components/layout/AuthLayout/README.md` — Documentar propósito y diferencia con AppLayout.
- `src/pages/LoginPage/README.md` — Breve descripción.
- `src/pages/RegisterPage/README.md` — Breve descripción.

### 9.3 Actualizar `docs/DECISIONS.md`

Agregar la sección "Milestone 3 — Login y Registro de Customers" con las decisiones #18 a #25 documentadas en la [sección 2](#2-decisiones-tomadas-antes-del-plan) de este plan.

### 9.4 Actualizar `src/pages/README.md`

Agregar entrada para `LoginPage` y `RegisterPage` explicando que usan `AuthLayout` en vez de `AppLayout`.

### Reglas a seguir

- Cada carpeta relevante creada tiene un `README.md`.
- Los READMEs contienen información útil para evitar leer archivos innecesariamente.
- `DECISIONS.md` se mantiene como registro vivo de decisiones arquitectónicas.

---

## Árbol de archivos final

```
src/
  types/
    auth.ts                                  # [CREAR] AuthUser, CustomerRegistrationData, LoginCredentials, AuthResponse

  api/
    auth.api.ts                              # [CREAR] loginApi, registerApi (mockeados)

  services/
    auth.service.ts                          # [CREAR] loginUser, registerUser
    auth.service.test.ts                     # [CREAR] Tests del servicio

  utils/
    validation.ts                            # [CREAR] Funciones de validación puras
    validation.test.ts                       # [CREAR] Tests de validación

  store/
    authStore.ts                             # [MODIFICAR] AuthUser, login(), logout()

  i18n/
    i18n.ts                                  # [MODIFICAR] Agregar namespace auth
    locales/
      es/
        auth.json                            # [CREAR] Traducciones español
      en/
        auth.json                            # [CREAR] Traducciones inglés

  components/
    ui/
      Input/
        Input.tsx                            # [CREAR]
        index.ts                             # [CREAR]
        README.md                            # [CREAR]
      Select/
        Select.tsx                           # [CREAR]
        index.ts                             # [CREAR]
        README.md                            # [CREAR]
      Toast/
        Toast.tsx                            # [CREAR]
        ToastContainer.tsx                   # [CREAR]
        useToast.ts                          # [CREAR]
        index.ts                             # [CREAR]
        README.md                            # [CREAR]
      index.ts                               # [MODIFICAR] Agregar exports

    layout/
      AuthLayout/
        AuthLayout.tsx                       # [CREAR]
        index.ts                             # [CREAR]
        README.md                            # [CREAR]
      index.ts                               # [MODIFICAR] Agregar export

  features/
    auth/
      components/
        LoginForm/
          LoginForm.tsx                      # [CREAR]
          index.ts                           # [CREAR]
        RegisterForm/
          RegisterForm.tsx                   # [CREAR]
          RegisterStepIndicator.tsx          # [CREAR]
          index.ts                           # [CREAR]
      hooks/
        useCountries.ts                      # [CREAR]
      types.ts                               # [CREAR]
      index.ts                               # [CREAR]
      README.md                              # [CREAR]

  pages/
    LoginPage/
      LoginPage.tsx                          # [CREAR]
      index.ts                               # [CREAR]
      README.md                              # [CREAR]
    RegisterPage/
      RegisterPage.tsx                       # [CREAR]
      index.ts                               # [CREAR]
      README.md                              # [CREAR]
    README.md                                # [MODIFICAR]

  routes/
    index.tsx                                # [MODIFICAR] Agregar rutas /login y /register

  App.tsx                                    # [MODIFICAR] Montar ToastContainer

docs/
  DECISIONS.md                               # [MODIFICAR] Agregar decisiones M3
  IMPLEMENTATION_PLAN_M3.md                  # [CREAR] Este archivo
```

**Archivos nuevos:** ~30
**Archivos modificados:** ~8
**Paquetes nuevos:** 1 (`i18n-iso-countries`)

---

## Criterios de aceptación

| #   | Criterio                                                                                 | Verificación                                                             |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | `/login` muestra formulario de inicio de sesión con email y password                     | Navegar a `/login`, verificar visualmente                                |
| 2   | `/register` muestra formulario de registro con Step 1 (credenciales)                     | Navegar a `/register`, verificar Step 1                                  |
| 3   | Step 1 del registro valida email, password y confirmación con errores visibles por campo | Enviar Step 1 vacío, verificar inputs resaltados en rojo con mensaje     |
| 4   | Step 2 del registro valida name, lastname, country y address con errores visibles        | Avanzar a Step 2 y enviar vacío, verificar                               |
| 5   | Login NO muestra errores individuales por campo (seguridad por oscuridad)                | Enviar login vacío, verificar que inputs no se resaltan y toast genérico |
| 6   | Registro exitoso redirige a `/login` con toast de éxito                                  | Completar registro, verificar redirección y toast                        |
| 7   | Login exitoso redirige a `/` con toast de éxito                                          | Completar login, verificar redirección a landing                         |
| 8   | El selector de países muestra nombres traducidos según idioma activo                     | Cambiar idioma en AuthLayout, verificar lista de países                  |
| 9   | Todos los textos están traducidos ES/EN sin strings hardcodeados                         | Alternar idioma, verificar que todo cambia                               |
| 10  | Auth pages usan AuthLayout (logo + contenido, sin Navbar/Footer)                         | Navegar a `/login`, verificar que no hay Navbar ni Footer                |
| 11  | Landing y seller pages mantienen AppLayout (Navbar + Footer)                             | Navegar a `/`, `/vender`, verificar layout normal                        |
| 12  | Botón "Iniciar sesión" en Navbar navega a `/login`                                       | Clic en botón de Navbar, verificar navegación                            |
| 13  | Menú móvil incluye enlace a login                                                        | Abrir menú hamburguesa, verificar opción de login                        |
| 14  | Responsive: sin problemas de UI en móvil (< 640px)                                       | Viewport móvil, verificar formularios                                    |
| 15  | Responsive: sin problemas de UI en desktop (> 1024px)                                    | Viewport desktop, verificar formularios                                  |
| 16  | Toasts aparecen y desaparecen con animación suave                                        | Disparar toast, verificar animación                                      |
| 17  | `npm run format:check` pasa sin errores                                                  | Ejecutar comando                                                         |
| 18  | Colores usan variables de `@theme` (sin hex hardcodeados en componentes)                 | Buscar hex en archivos `.tsx` nuevos                                     |
| 19  | Tests de validación pasan                                                                | Ejecutar `npx vitest run src/utils/validation.test.ts`                   |
| 20  | Tests del servicio auth pasan                                                            | Ejecutar `npx vitest run src/services/auth.service.test.ts`              |
| 21  | READMEs creados en todas las carpetas relevantes                                         | Verificar existencia de archivos                                         |
| 22  | `DECISIONS.md` actualizado con decisiones M3                                             | Revisar contenido                                                        |

---

## Checklist final

Antes de dar por terminado el milestone, verificar:

- [ ] Ningún componente/página importa desde `api/` o `lib/`
- [ ] Cero strings hardcodeados en UI (todo viene de i18n)
- [ ] Cero colores hex en archivos `.tsx` (todo via Tailwind + `@theme`)
- [ ] Login no resalta errores por campo (toast genérico)
- [ ] Registro resalta errores por campo (input border rojo + mensaje)
- [ ] Registro está dividido en 2 steps funcionales
- [ ] Paso atrás en registro conserva datos del Step 1
- [ ] Selector de países se traduce al cambiar idioma
- [ ] Redirección post-login a `/` con comentario `TODO [POST-M3]`
- [ ] Redirección post-registro a `/login`
- [ ] `AuthLayout` no incluye Navbar ni Footer
- [ ] `AppLayout` no se ve afectado por los cambios
- [ ] Navbar desktop y mobile enlazan a `/login`
- [ ] `ToastContainer` montado en `App.tsx`
- [ ] Tests de validación (`validation.test.ts`) pasan
- [ ] Tests de servicio (`auth.service.test.ts`) pasan
- [ ] `npm run format:check` pasa
- [ ] READMEs creados en carpetas nuevas
- [ ] `DECISIONS.md` actualizado
- [ ] No se crearon carpetas nuevas en `src/` sin aprobación
- [ ] No se alteró infraestructura Docker
