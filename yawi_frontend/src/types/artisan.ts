/**
 * Datos del Vendor expuestos públicamente.
 * NUNCA incluir: username, password, DUI, NIT, birthdate, personal_address.
 */
export interface PublicVendor {
  id: string;
  name: string;
  surname: string;
  lastname?: string;
  second_lastname?: string;
  country: string;
}

/**
 * Modelo de dominio del Business para la UI.
 */
export interface Business {
  id: string;
  name: string;
  description: string;
  address: string; // dirección completa del negocio
  locationSummary: string; // dirección truncada (primera parte antes de la coma)
  imagesUrls: string[]; // nunca null en el modelo UI (array vacío si no tiene)
  owner: PublicVendor;
  joinedAt: Date; // derivado de createdAt
}

/**
 * DTO crudo que retorna la API (NO usar directamente en componentes).
 */
export interface BusinessDto {
  id: string;
  name: string;
  description: string;
  address: string;
  imagesUrls: string[] | null;
  owner_id: string;
  owner: {
    id: string;
    username: string; // sensible — ignorar
    password: string; // sensible — ignorar
    name: string;
    surname: string;
    lastname?: string;
    second_lastname?: string;
    birthdate: string; // sensible — ignorar
    country: string;
    personal_address: string; // sensible — ignorar
    DUI: string; // sensible — ignorar
    NIT: string; // sensible — ignorar
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
