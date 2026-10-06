import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export interface NavItem {
  labelKey: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'home', href: '/' },
  { labelKey: 'explore', href: '#categories' },
  { labelKey: 'artisans', href: '#testimonials' },
  { labelKey: 'about', href: '#story' },
  { labelKey: 'sell', href: '#final-cta' },
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

  return (
    <div className={containerClasses}>
      {NAV_ITEMS.map((item) => {
        const label = t(item.labelKey);

        // Active check: matches hash, or if no hash and item is home '/'
        const isActive =
          item.href === '/'
            ? (!activeHash || activeHash === '' || activeHash === '#') && location.pathname === '/'
            : activeHash === item.href;

        const linkStyles = isActive
          ? 'text-primary-navy font-bold border-b-2 border-primary-indigo text-sm py-1.5 transition-all'
          : 'text-sm font-medium text-primary-text/75 hover:text-primary-navy hover:border-b-2 hover:border-primary-navy/30 py-1.5 border-b-2 border-transparent transition-all';

        const mobileLinkStyles = isActive
          ? 'text-primary-indigo font-bold bg-soft-lavender/20 rounded-xl px-4 py-3 text-sm transition-all'
          : 'text-sm font-medium text-primary-text/80 hover:bg-border/40 rounded-xl px-4 py-3 transition-all';

        return (
          <a
            key={item.labelKey}
            href={item.href}
            onClick={() => {
              setActiveHash(item.href === '/' ? '' : item.href);
              onItemClick?.();
            }}
            className={direction === 'row' ? linkStyles : mobileLinkStyles}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
};
