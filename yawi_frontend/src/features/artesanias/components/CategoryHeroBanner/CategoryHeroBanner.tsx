import React from 'react';
import { Breadcrumb, type BreadcrumbItem } from '../Breadcrumb';

export interface CategoryHeroBannerProps {
  title: string;
  description: string;
  breadcrumbItems: BreadcrumbItem[];
}

export const CategoryHeroBanner: React.FC<CategoryHeroBannerProps> = ({
  title,
  description,
  breadcrumbItems,
}) => {
  return (
    <section className="bg-gradient-to-r from-primary-navy via-[#1F2C6D] to-primary-navy text-white py-4 sm:py-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
        <Breadcrumb items={breadcrumbItems} />
        <div className="pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="text-xs sm:text-sm text-soft-lavender/90 max-w-2xl mt-1">{description}</p>
        </div>
      </div>
    </section>
  );
};
