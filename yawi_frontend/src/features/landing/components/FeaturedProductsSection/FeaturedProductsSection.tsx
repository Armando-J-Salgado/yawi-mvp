import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../../../../components/ui';
import { ProductCarousel } from './ProductCarousel';
import { useFeaturedProducts } from '../../hooks/useFeaturedProducts';

export const FeaturedProductsSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const { data: products, isLoading, isError } = useFeaturedProducts();

  return (
    <SectionContainer id="featured-products" background="surface">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight mb-3">
            {t('featured_products.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-text">
            {t('featured_products.subtitle')}
          </p>
        </div>
      </div>

      <ProductCarousel
        products={products}
        isLoading={isLoading}
        isError={isError}
      />
    </SectionContainer>
  );
};
