import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CustomerDto } from '@/api/auth.api';

vi.mock('@/api/customers.api', () => ({
  getCustomerById: vi.fn(),
}));

import { getCustomerById } from '@/api/customers.api';
import { fetchCustomerProfile, mapCustomerDtoToProfile } from './customer.service';

const customerDto: CustomerDto = {
  id: 'c-001',
  email: 'ana@example.com',
  name: 'Ana',
  lastname: 'Pérez',
  country: 'El Salvador',
  personal_address: 'Colonia Escalón, San Salvador',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  deletedAt: null,
};

describe('customer.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapCustomerDtoToProfile', () => {
    it('maps personal_address to address', () => {
      expect(mapCustomerDtoToProfile(customerDto)).toEqual({
        id: 'c-001',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        address: 'Colonia Escalón, San Salvador',
      });
    });
  });

  describe('fetchCustomerProfile', () => {
    it('fetches and maps the customer profile', async () => {
      vi.mocked(getCustomerById).mockResolvedValueOnce(customerDto);

      const profile = await fetchCustomerProfile('c-001');

      expect(getCustomerById).toHaveBeenCalledWith('c-001');
      expect(profile.address).toBe('Colonia Escalón, San Salvador');
    });
  });
});
