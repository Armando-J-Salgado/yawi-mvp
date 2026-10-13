/**
 * Tipos locales del feature `catalog`.
 * Los tipos de dominio compartidos (`Product`, `ProductFilters`) viven en `@/types/product`.
 */

/** Mapa `businessId → nombre` para enriquecer tarjetas (join best-effort con negocios). */
export type BusinessNameMap = Map<string, string>;
