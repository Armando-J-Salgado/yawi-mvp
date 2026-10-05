# Global State Store (`src/store`)

## Propósito
Centraliza los stores de estado global de la aplicación web utilizando Zustand para una gestión ligera, desacoplada y con mínimo boilerplate.

## Contenido
- `authStore.ts`: Store global del estado de sesión del usuario (`isAuthenticated`, `user`, `setAuthenticated`, `setUser`).

## Reglas
- **Zustand como estándar**: Se utiliza Zustand en lugar de Redux Toolkit para simplificar el flujo y optimizar tiempos en el MVP (Decisión #1 en `DECISIONS.md`).
- **Stores modulares**: Cada dominio de estado global debe tener su propio archivo (ej. `authStore.ts`, `cartStore.ts` en hitos futuros).
- **Acceso mediante hooks**: Consumir los estados en componentes usando los custom hooks exportados (`useAuthStore`).

## Dependencias
- Importa de: `zustand`.
- Importado por: `components/layout/Navbar/`, y futuros componentes con estado autenticado.
