import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, NavLink } from 'react-router-dom';

export interface NavItem {
  labelKey: string;
  href: string;
  type: 'route' | 'hash';
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'home', href: '/', type: 'route' },
  { labelKey: 'explore', href: '/#categories', type: 'hash' },
  { labelKey: 'artisans', href: '/artisans', type: 'route' },
  { labelKey: 'about', href: '/#story', type: 'hash' },
  { labelKey: 'sell', href: '/vender', type: 'route' },
];

export interface NavLinksProps {
  onItemClick?: () => void;
  direction?: 'row' | 'col';
}

export const NavLinks: React.FC<NavLinksProps> = ({ onItemClick, direction = 'row' }) => {
  const { t } = useTranslation('nav');
  const location = useLocation();
  const [activeHash, setActiveHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash : '',
  );

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const containerClasses =
    direction === 'row' ? 'flex items-center gap-7' : 'flex flex-col items-stretch gap-3 w-full';

  const activeLink =
    'text-primary-navy font-bold border-b-2 border-primary-indigo text-sm py-1.5 transition-all';
  const inactiveLink =
    'text-sm font-medium text-primary-text/75 hover:text-primary-navy hover:border-b-2 hover:border-primary-navy/30 py-1.5 border-b-2 border-transparent transition-all';

  const activeMobile =
    'text-primary-indigo font-bold bg-soft-lavender/20 rounded-xl px-4 py-3 text-sm transition-all';
  const inactiveMobile =
    'text-sm font-medium text-primary-text/80 hover:bg-border/40 rounded-xl px-4 py-3 transition-all';

  return (
    <div className={containerClasses}>
      {NAV_ITEMS.map((item) => {
        const label = t(item.labelKey);

        if (item.type === 'route') {
          return (
            <NavLink
              key={item.labelKey}
              to={item.href}
              end={item.href === '/'}
              onClick={() => {
                setActiveHash('');
                onItemClick?.();
              }}
              className={({ isActive }) =>
                direction === 'row'
                  ? isActive
                    ? activeLink
                    : inactiveLink
                  : isActive
                    ? activeMobile
                    : inactiveMobile
              }
            >
              {label}
            </NavLink>
          );
        }

        const targetHash = item.href.includes('#') ? `#${item.href.split('#')[1]}` : item.href;
        const isHashActive = location.pathname === '/' && activeHash === targetHash;

        return (
          <a
            key={item.labelKey}
            href={item.href}
            onClick={() => {
              setActiveHash(targetHash);
              onItemClick?.();
            }}
            className={
              direction === 'row'
                ? isHashActive
                  ? activeLink
                  : inactiveLink
                : isHashActive
                  ? activeMobile
                  : inactiveMobile
            }
            aria-current={isHashActive ? 'page' : undefined}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
};
