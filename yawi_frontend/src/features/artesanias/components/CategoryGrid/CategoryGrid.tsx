import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Category } from '@/data/categories';
import { CategoryGridCard } from './CategoryGridCard';

export interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('artesanias');

  const resolveText = (key: string) => {
    const direct = t(key);
    if (direct !== key) return direct;
    const stripped = key.replace(/^artesanias\./, '');
    return t(stripped);
  };

  return (
    <section className="py-6 sm:py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-navy tracking-tight mb-4 sm:mb-6">
          {resolveText('categories.section_title')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat) => (
            <CategoryGridCard
              key={cat.id}
              imageSrc={cat.image}
              title={resolveText(cat.titleKey)}
              slug={cat.slug}
              onClick={() => navigate(`/artesanias/${cat.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
