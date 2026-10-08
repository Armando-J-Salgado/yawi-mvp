# Sistema de Toast Notifications

Sistema ligero de notificaciones toast para Yawi, sin dependencias pesadas de terceros y estilizado según `DESIGN.md`.

## Uso

Importar el objeto utilitario `showToast`:

```tsx
import { showToast } from '@/components/ui'; // o import relativo '../../components/ui'

// Éxito
showToast.success('¡Operación completada!');

// Error
showToast.error('Ocurrió un error inesperado');

// Información
showToast.info('Mensaje informativo', 5000); // Duración personalizada en ms
```

## Arquitectura

- `Toast.tsx`: Componente visual individual con transiciones suaves de entrada y salida.
- `ToastContainer.tsx`: Contenedor fijo flotante en la esquina superior derecha (`top-6 right-6 z-50`). Montado en `App.tsx`.
- `useToast.ts`: Store Zustand (`useToastStore`) y utilitario `showToast` con funciones de conveniencia.
