import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';

// Registrar idiomas necesarios
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

export interface CountryOption {
  value: string; // ISO alpha-2 code
  label: string; // Translated country name
}

/**
 * Hook que retorna la lista de países traducida al idioma actual.
 * Usa i18n-iso-countries con cacheo implícito (paquete estático).
 * La lista se recalcula solo cuando cambia el idioma.
 */
export function useCountries(): CountryOption[] {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';

  return useMemo(() => {
    const namesByCode = countries.getNames(lang, { select: 'official' });
    return Object.entries(namesByCode)
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, lang));
  }, [lang]);
}
