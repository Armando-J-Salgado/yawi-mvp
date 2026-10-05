import React from 'react';
import { ImagePlaceholder } from '../../../../components/ui';

export interface CategoryCardProps {
  imageSrc?: string;
  title: string;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  imageSrc,
  title,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-card overflow-hidden h-48 sm:h-56 md:h-64 shadow-card hover:shadow-card-hover border border-border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-surface"
    >
      {/* Image container */}
      <ImagePlaceholder
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/90 via-primary-navy/40 to-transparent transition-opacity group-hover:opacity-90" />

      {/* Bottom text overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide group-hover:text-peach-accent transition-colors">
          {title}
        </h3>
        <span className="text-xs font-semibold text-soft-lavender opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
          Explorar &rarr;
        </span>
      </div>
    </div>
  );
};
