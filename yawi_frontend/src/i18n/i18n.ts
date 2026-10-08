import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import esCommon from './locales/es/common.json';
import esLanding from './locales/es/landing.json';
import esNav from './locales/es/nav.json';
import esFooter from './locales/es/footer.json';
import esSeller from './locales/es/seller.json';
import esAuth from './locales/es/auth.json';
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enNav from './locales/en/nav.json';
import enFooter from './locales/en/footer.json';
import enSeller from './locales/en/seller.json';
import enAuth from './locales/en/auth.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        landing: esLanding,
        nav: esNav,
        footer: esFooter,
        seller: esSeller,
        auth: esAuth,
      },
      en: {
        common: enCommon,
        landing: enLanding,
        nav: enNav,
        footer: enFooter,
        seller: enSeller,
        auth: enAuth,
      },
    },
    lng: 'es', // Idioma por defecto: español
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });

export default i18n;
