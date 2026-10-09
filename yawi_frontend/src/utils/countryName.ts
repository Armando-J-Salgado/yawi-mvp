import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';

// Registro idempotente de locales (mismo patrón que features/auth/hooks/useCountries.ts).
countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

/**
 * Convierte un código ISO alpha-2 (p. ej. 'SV') al nombre oficial del país.
 *
 * La API `yawi_api` persiste nombres completos (p. ej. 'El Salvador'), no códigos.
 * Se usa locale 'es' por defecto para producir un valor canónico y estable,
 * independiente del idioma de la UI y consistente con los datos existentes del backend.
 * Si el código no se reconoce, se devuelve el valor original (fallback seguro).
 */
export function resolveCountryName(code: string, locale: 'es' | 'en' = 'es'): string {
  if (!code) return code;
  return countries.getName(code.toUpperCase(), locale) ?? code;
}
