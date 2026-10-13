import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SectionContainer } from '@/components/ui';
import { BusinessCard } from '../BusinessCard';
import type { Business } from '@/types/artisan';

export interface FeaturedArtisansSectionProps {
  businesses: Business[];
  onViewProfile?: (id: string) => void;
}

export const FeaturedArtisansSection: React.FC<FeaturedArtisansSectionProps> = ({
  businesses,
  onViewProfile,
}) => {
  const { t } = useTranslation('artisans');
  const navigate = useNavigate();

  const handleViewProfile = (id: string) => {
    if (onViewProfile) {
      onViewProfile(id);
    } else {
      navigate(`/artisans/${id}`);
    }
  };

  const featured = businesses.slice(0, 3);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              ctaLabel={t('card.view_profile')}
              joinedLabel={t('card.joined')}
              artisanLabel={t('card.artisan_label')}
              locationLabel={t('card.location_label')}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};
