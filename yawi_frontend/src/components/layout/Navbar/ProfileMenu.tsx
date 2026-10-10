import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

/**
 * Avatar del usuario autenticado con menú desplegable.
 * El logout vive dentro del menú (no en el clic del avatar) para evitar
 * cierres de sesión accidentales.
 */
export const ProfileMenu: React.FC = () => {
  const { t } = useTranslation('nav');
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full bg-primary-navy text-white text-xs font-bold flex items-center justify-center hover:bg-primary-indigo transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t('user_menu')}
      >
        {user?.name?.[0] || 'U'}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-border bg-surface shadow-card p-2 z-50"
        >
          <div className="px-3 py-2 border-b border-border/70">
            <p className="text-sm font-semibold text-primary-navy truncate">
              {user?.name || t('user_menu')}
            </p>
            {user?.email && <p className="text-xs text-muted-text truncate">{user.email}</p>}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-peach-accent hover:bg-peach-accent/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
