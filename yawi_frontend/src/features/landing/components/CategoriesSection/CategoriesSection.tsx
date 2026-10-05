import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../../../../components/ui';
import { CategoryCard } from './CategoryCard';
import imagesData from '../../landing-images.json';

export const CategoriesSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const categories = imagesData.categories;

  return (
    <SectionContainer id="categories" background="default">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight mb-4">
          {t('categories.title')}
        </h2>
        <p className="text-base sm:text-lg text-muted-text">
          {t('categories.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            imageSrc={cat.src}
            title={t(cat.titleKey)}
          />
        ))}
      </div>
    </SectionContainer>
  );
};
