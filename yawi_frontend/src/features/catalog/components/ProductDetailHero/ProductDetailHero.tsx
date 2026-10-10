import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import type { Product } from '@/types/product';

export interface ProductDetailHeroProps {
  product: Product;
  backLabel: string;
}

export const ProductDetailHero: React.FC<ProductDetailHeroProps> = ({ product, backLabel }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const firstImage = resolveImageUrl(product.imageUrls[0]);

  return (
    <section className="relative w-full h-80 sm:h-96 lg:h-[70vh] bg-primary-navy overflow-hidden">
      {firstImage && !imageError ? (
        <>
          <img
            src={firstImage}
            alt={product.name}
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/95 via-primary-navy/60 to-primary-navy/40" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-primary-indigo/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-60 sm:w-80 md:w-[400px] h-60 sm:h-80 md:h-[400px] bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-navy to-primary-navy/90" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col justify-between py-8">
        <div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/20 backdrop-blur-md text-white text-sm font-semibold hover:bg-surface/30 transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {product.name}
          </h1>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="bg-surface/20 backdrop-blur-md text-white normal-case text-xs font-semibold py-1 px-3"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
