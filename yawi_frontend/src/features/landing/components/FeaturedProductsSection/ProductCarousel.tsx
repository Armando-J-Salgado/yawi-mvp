import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { ProductCard } from '../../../../components/common/ProductCard';
import { Skeleton } from '../../../../components/ui';
import type { Product } from '../../types';

export interface ProductCarouselProps {
  products: Product[];
  isLoading?: boolean;
  isError?: boolean;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  isLoading = false,
  isError = false,
}) => {
  const { t } = useTranslation('landing');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-card border border-border text-center">
        <AlertCircle className="w-10 h-10 text-peach-accent mb-3" />
        <p className="text-base text-primary-navy font-semibold">
          {t('featured_products.error_message')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden py-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="w-[280px] sm:w-[320px] shrink-0 bg-surface rounded-card p-4 border border-border"
          >
            <Skeleton className="w-full aspect-square mb-4 rounded-xl" />
            <Skeleton className="w-3/4 h-5 mb-2" />
            <Skeleton className="w-1/2 h-4 mb-4" />
            <Skeleton className="w-full h-10 rounded-button" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-text">
        <p>{t('featured_products.empty_message')}</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Arrows for Desktop */}
      <div className="hidden md:flex absolute -top-16 right-0 items-center gap-2">
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-soft-lavender/20 text-primary-navy flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
          aria-label={t('featured_products.prev')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-soft-lavender/20 text-primary-navy flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
          aria-label={t('featured_products.next')}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Horizontal Scroll Snap Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[280px] sm:w-[320px] shrink-0 snap-start"
          >
            <ProductCard
              imageSrc={product.imageSrc}
              name={product.name}
              country={product.country}
              artisan={product.artisan}
              price={product.price}
              currency={product.currency}
              priceLabel={t('featured_products.price_label')}
              ctaLabel={t('featured_products.view_product')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
