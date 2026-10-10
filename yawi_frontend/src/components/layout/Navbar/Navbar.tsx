import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Menu, Globe, User as UserIcon, ShoppingBag } from 'lucide-react';
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { ProfileMenu } from './ProfileMenu';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore, selectTotalItems } from '../../../store/cartStore';

const yawiLogo = '/images/yawi-logo.svg';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation('nav');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const totalItems = useCartStore(selectTotalItems);
  const openCart = useCartStore((state) => state.openCart);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border/80 transition-shadow duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo rounded-lg"
          aria-label={t('logo_alt')}
        >
          <img
            src={yawiLogo}
            alt={t('logo_alt')}
            className="h-9 w-auto hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          <NavLinks direction="row" />
        </nav>

        {/* Right side controls: Language & Auth (Desktop) + Hamburger (Mobile) */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-navy hover:text-primary-indigo bg-transparent hover:bg-border/40 rounded-full border border-border/80 transition-colors cursor-pointer"
            aria-label={`Cambiar idioma, actual ${i18n.language}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{i18n.language.startsWith('es') ? 'EN' : 'ES'}</span>
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-navy hover:text-primary-indigo transition-colors rounded-button"
            >
              <UserIcon className="w-4 h-4" />
              <span>{t('login')}</span>
            </Link>
          )}

          {/* Cart button (Mobile + Desktop) */}
          <button
            type="button"
            onClick={openCart}
            aria-label={t('open', { ns: 'cart' })}
            className="relative p-2 rounded-xl text-primary-navy hover:bg-border/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo cursor-pointer"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-peach-accent text-primary-navy text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Hamburger toggle button (Mobile) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-primary-navy hover:bg-border/60 transition-colors md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo"
            aria-label={t('open_menu')}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onToggleLanguage={toggleLanguage}
        currentLanguage={i18n.language}
      />
    </header>
  );
};
