/**
 * Estado de los filtros activos en la página de artesanos.
 */
export interface ArtisanFilters {
  search: string;
  country: string; // '' = todos
}

/**
 * Países disponibles con su estado.
 */
export interface CountryFilterOption {
  value: string;
  labelKey: string; // clave i18n en namespace 'artisans'
  available: boolean; // false = "próximamente"
}

/**
 * Datos estáticos de los filtros de país disponibles.
 */
export const COUNTRY_FILTERS: CountryFilterOption[] = [
  { value: '', labelKey: 'filters.all', available: true },
  { value: 'El Salvador', labelKey: 'filters.el_salvador', available: true },
  { value: 'Guatemala', labelKey: 'filters.guatemala', available: false },
  { value: 'Honduras', labelKey: 'filters.honduras', available: false },
];
