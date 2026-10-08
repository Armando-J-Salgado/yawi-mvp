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
