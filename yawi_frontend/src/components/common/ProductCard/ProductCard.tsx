import React from 'react';
import { MapPin, User as UserIcon } from 'lucide-react';
import { Card, Button, ImagePlaceholder, Badge } from '../../ui';

export interface ProductCardProps {
  imageSrc?: string;
  name: string;
  country: string;
  artisan: string;
  price: number;
  currency: string;
  ctaLabel: string;
  priceLabel?: string;
  onCtaClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  imageSrc,
  name,
  country,
  artisan,
  price,
  currency,
  ctaLabel,
  priceLabel = 'Precio',
  onCtaClick,
}) => {
  return (
    <Card
      hoverable
      className="flex flex-col h-full overflow-hidden p-0 bg-surface border border-border group"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-border/40 overflow-hidden">
        <ImagePlaceholder
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge
            variant="default"
            className="backdrop-blur-md bg-surface/90 text-primary-navy shadow-xs"
          >
            <MapPin className="w-3 h-3 mr-1 inline text-primary-indigo" />
            {country}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-text mb-1.5">
            <UserIcon className="w-3.5 h-3.5 text-primary-indigo" />
            <span className="truncate">{artisan}</span>
          </div>
          <h3 className="text-base font-bold text-primary-navy group-hover:text-primary-indigo transition-colors line-clamp-2">
            {name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/80">
          <div>
            <span className="text-xs text-muted-text block uppercase tracking-wider">
              {priceLabel}
            </span>
            <span className="text-lg font-extrabold text-primary-navy">
              ${price.toFixed(2)}{' '}
              <span className="text-xs font-semibold text-muted-text">{currency}</span>
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onCtaClick}
            className="group-hover:bg-primary-navy group-hover:text-white transition-all"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};
