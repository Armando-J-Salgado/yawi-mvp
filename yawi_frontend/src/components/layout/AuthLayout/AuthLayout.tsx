import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import yawiLogo from '../../../assets/yawi-logo.svg';

/**
 * Layout minimalista para páginas de autenticación.
 * Solo muestra el logo centrado, un selector de idioma discreto y el contenido del formulario.
 * No incluye Navbar ni Footer para evitar distracciones.
 */
export function AuthLayout() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header mínimo: logo + language toggle */}
      <header className="w-full px-4 sm:px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          to="/"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo rounded-lg"
        >
          <img
            src={yawiLogo}
            alt="Yawi"
            className="h-8 w-auto hover:opacity-90 transition-opacity"
          />
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-navy hover:text-primary-indigo bg-transparent hover:bg-border/40 rounded-full border border-border/80 transition-colors cursor-pointer"
          aria-label={`Change language, current: ${i18n.language}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{i18n.language.startsWith('es') ? 'EN' : 'ES'}</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
