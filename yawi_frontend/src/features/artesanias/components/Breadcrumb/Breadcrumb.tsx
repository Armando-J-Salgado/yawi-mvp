import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center flex-wrap gap-2 text-white/70">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-white transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-white font-semibold" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
