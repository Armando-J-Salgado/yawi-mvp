import type { BusinessDto } from '@/types/artisan';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function getBusinesses(): Promise<BusinessDto[]> {
  const res = await fetch(`${API_BASE}/businesses`);
  if (!res.ok) throw new Error(`Error fetching businesses: ${res.status}`);
  return res.json() as Promise<BusinessDto[]>;
}

export async function getBusinessById(id: string): Promise<BusinessDto> {
  const res = await fetch(`${API_BASE}/businesses/${id}`);
  if (!res.ok) throw new Error(`Error fetching business ${id}: ${res.status}`);
  return res.json() as Promise<BusinessDto>;
}
