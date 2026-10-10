import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Globe, User as UserIcon, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLinks } from './NavLinks';
import { useAuthStore } from '../../../store/authStore';

const yawiLogo = '/images/yawi-logo.svg';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleLanguage: () => void;
  currentLanguage: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onToggleLanguage,
  currentLanguage,
}) => {
  const { t } = useTranslation('nav');
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-primary-navy/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen h-[100dvh] w-[290px] sm:w-[320px] bg-surface bg-white shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('open_menu')}
      >
        <div>
          {/* Header with close button */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <img src={yawiLogo} alt={t('logo_alt')} className="h-7 w-auto" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-primary-navy hover:bg-border/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo"
              aria-label={t('close_menu')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="py-6">
            <NavLinks direction="col" onItemClick={onClose} />
          </div>
        </div>

        {/* Footer actions: Auth + Language */}
        <div className="pt-6 border-t border-border flex flex-col gap-4">
          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-navy hover:text-primary-indigo hover:bg-border/40 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('view_cart', { ns: 'cart' })}</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 p-2 bg-soft-lavender/20 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-primary-indigo text-white flex items-center justify-center font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-semibold text-primary-navy truncate">
                  {user?.name || t('user_menu')}
                </p>
                <p className="text-xs text-muted-text truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs text-peach-accent font-medium hover:underline cursor-pointer"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-navy hover:text-primary-indigo hover:bg-border/40 rounded-xl transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span>{t('login')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              onToggleLanguage();
            }}
            className="flex items-center justify-between px-3 py-2 rounded-xl border border-border text-sm font-medium text-primary-navy hover:bg-border/40 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-indigo" />
              <span>Idioma / Language</span>
            </span>
            <span className="font-bold text-primary-indigo uppercase">
              {currentLanguage.startsWith('es') ? 'EN' : 'ES'}
            </span>
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};
