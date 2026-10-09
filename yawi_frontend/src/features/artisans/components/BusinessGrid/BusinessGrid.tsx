import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, SearchX } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { BusinessCard } from '../BusinessCard';
import type { Business } from '@/types/artisan';

export interface BusinessGridProps {
  businesses: Business[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewProfile: (id: string) => void;
}

export const BusinessGrid: React.FC<BusinessGridProps> = ({
  businesses,
  isLoading,
  isError,
  onRetry,
  onViewProfile,
}) => {
  const { t } = useTranslation('artisans');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-surface rounded-card border border-border p-0 overflow-hidden shadow-card flex flex-col h-[400px]"
          >
            <Skeleton className="w-full h-52 rounded-none" />
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <Skeleton width="40%" height="16px" />
                <Skeleton width="80%" height="24px" />
                <Skeleton width="60%" height="16px" />
                <Skeleton width="100%" height="36px" />
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <Skeleton width="45%" height="16px" />
                <Skeleton width="35%" height="32px" borderRadius="12px" />
              </div>
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
        <div className="space-y-1 max-w-md">
          <h3 className="text-lg font-bold text-primary-navy">{t('grid.error')}</h3>
        </div>
        <Button variant="primary" size="md" onClick={onRetry}>
          {t('grid.retry')}
        </Button>
      </div>
    );
  }

  if (businesses.length === 0) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          ctaLabel={t('card.view_profile')}
          joinedLabel={t('card.joined')}
          artisanLabel={t('card.artisan_label')}
          locationLabel={t('card.location_label')}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};
