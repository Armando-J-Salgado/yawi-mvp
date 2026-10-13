import React from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui';
import type { Business } from '@/types/artisan';

export interface ProductArtisanProps {
  business?: Business;
  /** Fallback cuando el negocio no pudo resolverse (join best-effort). */
  businessName?: string;
  artisanTitle: string;
  countryLabel: string;
}

export const ProductArtisan: React.FC<ProductArtisanProps> = ({
  business,
  businessName,
  artisanTitle,
  countryLabel,
}) => {
  const displayName = business?.name ?? businessName;
  if (!displayName) return null;

  const initials = (() => {
    const source = business?.owner
      ? `${business.owner.name?.[0] ?? ''}${business.owner.surname?.[0] ?? ''}`
      : displayName;
    return source.slice(0, 2).toUpperCase();
  })();

  return (
    <div className="space-y-4">
      <h3 className="text-xl sm:text-2xl font-bold text-primary-navy tracking-tight">
        {artisanTitle}
      </h3>

      <Card className="p-6 sm:p-8 bg-surface border border-border shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-navy to-primary-indigo text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md shrink-0">
            {initials}
          </div>

          <div className="space-y-2 flex-1">
            <h4 className="text-xl sm:text-2xl font-bold text-primary-navy">{displayName}</h4>

            {business && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-text">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-indigo" />
                  <span>
                    <strong className="text-primary-navy">{countryLabel}:</strong>{' '}
                    {business.owner.country}
                  </span>
                </div>
                {business.locationSummary && (
                  <span className="text-muted-text">{business.locationSummary}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
