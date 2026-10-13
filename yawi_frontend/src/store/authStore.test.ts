import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { getAuthToken, setAuthToken } from '@/lib/authToken';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const loginDto = {
  access_token: 'jwt-token',
  token_type: 'Bearer',
  expires_in: '1d',
  user: {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    userType: 'customer',
    email: 'cliente@example.com',
    name: 'Ana',
    lastname: 'Pérez',
  },
};

const meDto = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  userType: 'customer',
  email: 'cliente@example.com',
  name: 'Ana',
  lastname: 'Pérez',
};

describe('authStore', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    useAuthStore.setState({ isAuthenticated: false, user: null, token: null });
    setAuthToken(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    setAuthToken(null);
  });

  it('login success stores user, token and sets the auth helper', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(loginDto, 200));

    const result = await useAuthStore.getState().login('cliente@example.com', 'secret123');
    const state = useAuthStore.getState();

    expect(result).toEqual({ success: true });
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('cliente@example.com');
    expect(state.token).toBe('jwt-token');
    expect(getAuthToken()).toBe('jwt-token');
  });

  it('login failure propagates the backend error and keeps the session empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ statusCode: 401, message: 'Credenciales inválidas' }, 401),
    );

    const result = await useAuthStore.getState().login('cliente@example.com', 'wrong');
    const state = useAuthStore.getState();

    expect(result).toEqual({ success: false, error: 'Credenciales inválidas' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(getAuthToken()).toBeNull();
  });

  it('logout clears the session and the auth helper', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(loginDto, 200));
    await useAuthStore.getState().login('cliente@example.com', 'secret123');

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(getAuthToken()).toBeNull();
  });

  it('restoreSession authenticates when the token is valid', async () => {
    useAuthStore.setState({ isAuthenticated: false, user: null, token: 'jwt-token' });
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(meDto, 200));

    await useAuthStore.getState().restoreSession();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(state.token).toBe('jwt-token');
    expect(getAuthToken()).toBe('jwt-token');
  });

  it('restoreSession clears the session when the token is invalid', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: null, token: 'bad-token' });
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ statusCode: 401, message: 'Token inválido' }, 401),
    );

    await useAuthStore.getState().restoreSession();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(getAuthToken()).toBeNull();
  });

  it('restoreSession does nothing when there is no token', async () => {
    useAuthStore.setState({ isAuthenticated: false, user: null, token: null });

    await useAuthStore.getState().restoreSession();

    expect(fetch).not.toHaveBeenCalled();
  });
});
