import { getBusinesses, getBusinessById } from '@/api/artisans.api';
import { formatAddress } from '@/utils/formatAddress';
import type { Business, BusinessDto, PublicVendor } from '@/types/artisan';

function mapVendorToPublic(raw: BusinessDto['owner']): PublicVendor {
  return {
    id: raw.id,
    name: raw.name,
    surname: raw.surname,
    lastname: raw.lastname,
    second_lastname: raw.second_lastname,
    country: raw.country,
    // Los campos sensibles (username, password, DUI, NIT, birthdate, personal_address) son omitidos aquí.
  };
}

function mapBusinessDtoToDomain(dto: BusinessDto): Business {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    address: dto.address,
    locationSummary: formatAddress(dto.address),
    imagesUrls: dto.imagesUrls ?? [],
    owner: mapVendorToPublic(dto.owner),
    joinedAt: new Date(dto.createdAt),
  };
}

export async function fetchBusinesses(): Promise<Business[]> {
  const dtos = await getBusinesses();
  return dtos.map(mapBusinessDtoToDomain);
}

export async function fetchBusinessById(id: string): Promise<Business> {
  const dto = await getBusinessById(id);
  return mapBusinessDtoToDomain(dto);
}
