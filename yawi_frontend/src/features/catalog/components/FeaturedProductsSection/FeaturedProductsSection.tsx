import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '@/components/ui';
import { ProductCard } from '@/components/common';
import { selectFeaturedProducts } from '@/services/products.service';
import type { Product } from '@/types/product';
import type { BusinessNameMap } from '../../types';

export interface FeaturedProductsSectionProps {
  products: Product[];
  onViewProduct: (id: string) => void;
  businessNameById?: BusinessNameMap;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  onViewProduct,
  businessNameById,
}) => {
  const { t } = useTranslation('catalog');
  const featured = selectFeaturedProducts(products, 4);

  if (featured.length === 0) return null;

  return (
    <SectionContainer background="surface" className="border-y border-border">
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight">
            {t('featured.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-text leading-relaxed">
            {t('featured.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              imageSrc={product.imageUrls[0]}
              name={product.name}
              businessName={businessNameById?.get(product.businessId) ?? product.businessName}
              tags={product.tags}
              price={product.price}
              priceLabel={t('card.price_label')}
              ctaLabel={t('card.view_product')}
              onCtaClick={() => onViewProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};
