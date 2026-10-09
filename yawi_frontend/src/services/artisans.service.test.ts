import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBusinesses, fetchBusinessById } from './artisans.service';
import * as artisansApi from '@/api/artisans.api';
import type { BusinessDto } from '@/types/artisan';

vi.mock('@/api/artisans.api', () => ({
  getBusinesses: vi.fn(),
  getBusinessById: vi.fn(),
}));

function buildBusinessDto(overrides: Partial<BusinessDto> = {}): BusinessDto {
  return {
    id: 'test-uuid',
    name: 'Test Business',
    description: 'A description',
    address: 'Calle 1, Colonia 2, San Salvador',
    imagesUrls: null,
    owner_id: 'vendor-uuid',
    owner: {
      id: 'vendor-uuid',
      username: 'secret_user',
      password: 'hashed_pass',
      name: 'Carlos',
      surname: 'Martínez',
      lastname: 'Antonio',
      second_lastname: 'López',
      birthdate: '1988-04-12',
      country: 'El Salvador',
      personal_address: 'Dirección privada',
      DUI: '01234567-8',
      NIT: '0614-120488-101-5',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}

describe('artisans.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchBusinesses returns empty array when API returns empty array', async () => {
    vi.mocked(artisansApi.getBusinesses).mockResolvedValueOnce([]);

    const result = await fetchBusinesses();
    expect(result).toEqual([]);
  });

  it('fetchBusinesses maps DTO correctly to domain Business model', async () => {
    const dto = buildBusinessDto({ imagesUrls: null });
    vi.mocked(artisansApi.getBusinesses).mockResolvedValueOnce([dto]);

    const result = await fetchBusinesses();
    expect(result).toHaveLength(1);
    const business = result[0];

    expect(business.id).toBe('test-uuid');
    expect(business.name).toBe('Test Business');
    expect(business.description).toBe('A description');
    expect(business.address).toBe('Calle 1, Colonia 2, San Salvador');
    expect(business.locationSummary).toBe('Calle 1');
    expect(business.imagesUrls).toEqual([]);
    expect(business.joinedAt).toEqual(new Date('2026-01-15T10:00:00.000Z'));
  });

  it('fetchBusinessById maps individual DTO correctly', async () => {
    const dto = buildBusinessDto({
      imagesUrls: ['https://example.com/img1.jpg'],
    });
    vi.mocked(artisansApi.getBusinessById).mockResolvedValueOnce(dto);

    const result = await fetchBusinessById('test-uuid');
    expect(result.id).toBe('test-uuid');
    expect(result.imagesUrls).toEqual(['https://example.com/img1.jpg']);
    expect(result.owner.name).toBe('Carlos');
    expect(result.owner.surname).toBe('Martínez');
  });

  it('omits sensitive vendor fields (username, password, DUI, NIT, birthdate, personal_address)', async () => {
    const dto = buildBusinessDto();
    vi.mocked(artisansApi.getBusinessById).mockResolvedValueOnce(dto);

    const result = await fetchBusinessById('test-uuid');
    const owner = result.owner as unknown as Record<string, unknown>;

    expect(owner.username).toBeUndefined();
    expect(owner.password).toBeUndefined();
    expect(owner.DUI).toBeUndefined();
    expect(owner.NIT).toBeUndefined();
    expect(owner.birthdate).toBeUndefined();
    expect(owner.personal_address).toBeUndefined();
    expect(owner.id).toBe('vendor-uuid');
    expect(owner.name).toBe('Carlos');
    expect(owner.surname).toBe('Martínez');
    expect(owner.country).toBe('El Salvador');
  });
});
