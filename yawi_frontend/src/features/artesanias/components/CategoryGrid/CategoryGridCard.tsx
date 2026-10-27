import React from 'react';
import { ImagePlaceholder } from '@/components/ui';

export interface CategoryGridCardProps {
  imageSrc: string;
  title: string;
  slug: string;
  onClick: () => void;
}

export const CategoryGridCard: React.FC<CategoryGridCardProps> = ({ imageSrc, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative rounded-card overflow-hidden h-40 sm:h-48 shadow-card hover:shadow-card-hover border border-border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-surface"
    >
      <ImagePlaceholder
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/90 via-primary-navy/40 to-transparent transition-opacity group-hover:opacity-90" />

      {/* Text overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-peach-accent transition-colors line-clamp-2">
          {title}
        </h3>
        <span className="text-xs font-semibold text-soft-lavender opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1 group-hover:translate-x-0 hidden sm:inline">
          &rarr;
        </span>
      </div>
    </div>
  );
};
