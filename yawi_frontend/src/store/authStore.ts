import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchCurrentUser, loginUser } from '@/services/auth.service';
import { setAuthToken } from '@/lib/authToken';
import type { AuthUser } from '@/types/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  /**
   * Acción de login: valida credenciales contra el backend, guarda el token
   * y actualiza el estado de sesión.
   */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  /**
   * Cierra la sesión y limpia el usuario y el token.
   */
  logout: () => void;
  /**
   * Rehidrata la sesión desde el token persistido validándolo con `GET /auth/me`.
   * Si el token es inválido o expiró, limpia la sesión.
   */
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
