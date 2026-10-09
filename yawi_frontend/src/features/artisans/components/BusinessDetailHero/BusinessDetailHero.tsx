import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Business } from '@/types/artisan';

export interface BusinessDetailHeroProps {
  business: Business;
  backLabel: string;
}

export const BusinessDetailHero: React.FC<BusinessDetailHeroProps> = ({ business, backLabel }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const firstImage =
    business.imagesUrls.length > 0 && Boolean(business.imagesUrls[0])
      ? business.imagesUrls[0]
      : undefined;

  return (
    <section className="relative w-full h-80 sm:h-96 lg:h-[450px] bg-primary-navy overflow-hidden">
      {/* Background Image if available and valid */}
      {firstImage && !imageError ? (
        <>
          <div className="absolute inset-0 w-full h-full">
            <img
              src={firstImage}
              alt={business.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Dark Gradient Overlay for image */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/95 via-primary-navy/60 to-primary-navy/40" />
        </>
      ) : (
        /* Clean Background with Decorative Orbs when no image is present */
        <>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-primary-indigo/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-60 sm:w-80 md:w-[400px] h-60 sm:h-80 md:h-[400px] bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-navy to-primary-navy/90" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col justify-between py-8">
        {/* Back button */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/artisans')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/20 backdrop-blur-md text-white text-sm font-semibold hover:bg-surface/30 transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        </div>

        {/* Hero content */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              variant="accent"
              className="flex items-center gap-1 normal-case text-xs font-semibold py-1 px-3"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{business.owner.country}</span>
            </Badge>
            {business.locationSummary && (
              <span className="text-sm text-white/80 font-medium">{business.locationSummary}</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {business.name}
          </h1>

          <div className="flex items-center gap-2 text-white/90 text-sm sm:text-base font-medium">
            <UserIcon className="w-4 h-4 text-peach-accent" />
            <span>
              {business.owner.name} {business.owner.surname}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
