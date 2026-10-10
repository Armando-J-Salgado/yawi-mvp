import React from 'react';
import { Badge } from '@/components/ui';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Product } from '@/types/product';

export interface ProductInfoProps {
  product: Product;
  tagsTitle: string;
  priceLabel: string;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, tagsTitle, priceLabel }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs text-muted-text uppercase tracking-wider block">
            {priceLabel}
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold text-primary-navy">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>

      {product.tags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-semibold text-primary-navy">{tagsTitle}</span>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
