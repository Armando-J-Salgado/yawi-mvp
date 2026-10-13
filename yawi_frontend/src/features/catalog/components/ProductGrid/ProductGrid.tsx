import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, SearchX } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { ProductCard } from '@/components/common';
import type { Product } from '@/types/product';
import type { BusinessNameMap } from '../../types';

export interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewProduct: (id: string) => void;
  businessNameById?: BusinessNameMap;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  isError,
  onRetry,
  onViewProduct,
  businessNameById,
}) => {
  const { t } = useTranslation('catalog');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-surface rounded-card border border-border p-0 overflow-hidden shadow-card flex flex-col h-[380px]"
          >
            <Skeleton className="w-full aspect-square rounded-none" />
            <div className="p-5 space-y-3 flex-1">
              <Skeleton width="45%" height="16px" />
              <Skeleton width="80%" height="22px" />
              <Skeleton width="100%" height="20px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-card bg-surface border border-border space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-peach-accent/20 flex items-center justify-center text-peach-accent">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <p className="text-base text-muted-text max-w-md">{t('grid.error')}</p>
        <Button variant="primary" size="md" onClick={onRetry}>
          {t('grid.retry')}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-card bg-surface border border-border space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-soft-lavender/30 flex items-center justify-center text-primary-navy">
          <SearchX className="w-7 h-7" />
        </div>
        <p className="text-base text-muted-text max-w-sm">{t('grid.empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
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
  );
};
