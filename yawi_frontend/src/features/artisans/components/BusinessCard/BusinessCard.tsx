import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, User as UserIcon, Calendar } from 'lucide-react';
import { Card, Badge, Button, ImagePlaceholder } from '@/components/ui';
import type { Business } from '@/types/artisan';

export interface BusinessCardProps {
  business: Business;
  ctaLabel: string;
  joinedLabel: string;
  artisanLabel: string;
  locationLabel: string;
  onViewProfile: (id: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  ctaLabel,
  joinedLabel,
  artisanLabel,
  locationLabel,
  onViewProfile,
}) => {
  const { i18n } = useTranslation();
  const { owner, imagesUrls, joinedAt } = business;

  const formattedDate = new Intl.DateTimeFormat(i18n.language || 'es', {
    month: 'short',
    year: 'numeric',
  }).format(joinedAt instanceof Date ? joinedAt : new Date(joinedAt));

  const renderImages = () => {
    const imagesCount = imagesUrls.length;

    if (imagesCount === 0) {
      return (
        <div className="w-full h-full">
          <ImagePlaceholder
            alt={business.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    }

    if (imagesCount === 1) {
      return (
        <ImagePlaceholder
          src={imagesUrls[0]}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      );
    }

    if (imagesCount === 2) {
      return (
        <div className="grid grid-cols-2 h-full gap-0.5 w-full">
          <ImagePlaceholder
            src={imagesUrls[0]}
            alt={`${business.name} 1`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <ImagePlaceholder
            src={imagesUrls[1]}
            alt={`${business.name} 2`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    }

    if (imagesCount === 3) {
      return (
        <div className="grid grid-cols-3 h-full gap-0.5 w-full">
          <div className="col-span-2 h-full">
            <ImagePlaceholder
              src={imagesUrls[0]}
              alt={`${business.name} 1`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-0.5 h-full">
            <ImagePlaceholder
              src={imagesUrls[1]}
              alt={`${business.name} 2`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <ImagePlaceholder
              src={imagesUrls[2]}
              alt={`${business.name} 3`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      );
    }

    // 4 or more images
    return (
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 w-full">
        {imagesUrls.slice(0, 4).map((url: string, idx: number) => (
          <ImagePlaceholder
            key={idx}
            src={url}
            alt={`${business.name} ${idx + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ))}
      </div>
    );
  };

  return (
    <Card
      hoverable
      className="group p-0 overflow-hidden flex flex-col h-full bg-surface border-border shadow-card"
    >
      {/* Images area */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-border/40">
        <div className="absolute top-3 left-3 z-20">
          <Badge
            variant="default"
            className="bg-surface/90 backdrop-blur-md text-primary-navy shadow-sm flex items-center gap-1 normal-case text-xs font-semibold py-1 px-2.5"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-indigo" />
            <span>{owner.country}</span>
          </Badge>
        </div>
        {renderImages()}
      </div>

      {/* Content area */}
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-text">
            <UserIcon className="w-3.5 h-3.5 text-primary-navy/70" />
            <span aria-label={artisanLabel}>
              {owner.name} {owner.surname}
            </span>
          </div>

          <h3 className="text-xl font-bold text-primary-navy tracking-tight group-hover:text-primary-indigo transition-colors duration-200">
            {business.name}
          </h3>

          {business.locationSummary && (
            <div className="flex items-center gap-1.5 text-xs text-muted-text">
              <MapPin className="w-3.5 h-3.5 text-muted-text" />
              <span aria-label={locationLabel}>{business.locationSummary}</span>
            </div>
          )}

          <p className="text-sm text-muted-text line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-text">
            <Calendar className="w-3.5 h-3.5 text-muted-text/70" />
            <span>
              {joinedLabel} {formattedDate}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              onViewProfile(business.id);
            }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};
