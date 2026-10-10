import React from 'react';
import { MapPin, User as UserIcon } from 'lucide-react';
import { Card, Button, ImagePlaceholder, Badge } from '@/components/ui';
import { formatCurrency, DEFAULT_CURRENCY } from '@/utils/formatCurrency';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export interface ProductCardProps {
  imageSrc?: string;
  name: string;
  /** País de origen (opcional: solo si la información está disponible). */
  country?: string;
  /** Nombre del artesano (fallback de `businessName`). */
  artisan?: string;
  /** Nombre del negocio/artesano asociado (opcional). */
  businessName?: string;
  /** Tags relevantes del producto (opcional, se muestran hasta 3). */
  tags?: string[];
  price: number;
  currency?: string;
  ctaLabel: string;
  priceLabel?: string;
  onCtaClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  imageSrc,
  name,
  country,
  artisan,
  businessName,
  tags = [],
  price,
  currency = DEFAULT_CURRENCY,
  ctaLabel,
  priceLabel = 'Precio',
  onCtaClick,
}) => {
  const sellerLabel = businessName ?? artisan;
  const visibleTags = tags.slice(0, 3);

  return (
    <Card
      hoverable
      className="flex flex-col h-full overflow-hidden p-0 bg-surface border border-border group"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-border/40 overflow-hidden">
        <ImagePlaceholder
          src={resolveImageUrl(imageSrc)}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {country && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="default"
              className="backdrop-blur-md bg-surface/90 text-primary-navy shadow-xs"
            >
              <MapPin className="w-3 h-3 mr-1 inline text-primary-indigo" />
              {country}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {sellerLabel && (
            <div className="flex items-center gap-1.5 text-xs text-muted-text mb-1.5">
              <UserIcon className="w-3.5 h-3.5 text-primary-indigo" />
              <span className="truncate">{sellerLabel}</span>
            </div>
          )}
          <h3 className="text-base font-bold text-primary-navy group-hover:text-primary-indigo transition-colors line-clamp-2">
            {name}
          </h3>

          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="normal-case text-[10px] font-medium py-0.5 px-2 tracking-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/80 gap-3">
          <div className="min-w-0">
            <span className="text-xs text-muted-text block uppercase tracking-wider">
              {priceLabel}
            </span>
            <span className="text-lg font-extrabold text-primary-navy">
              {formatCurrency(price, currency)}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onCtaClick}
            className="group-hover:bg-primary-navy group-hover:text-white transition-all shrink-0"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};
