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
