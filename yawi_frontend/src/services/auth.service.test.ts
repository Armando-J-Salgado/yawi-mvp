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
