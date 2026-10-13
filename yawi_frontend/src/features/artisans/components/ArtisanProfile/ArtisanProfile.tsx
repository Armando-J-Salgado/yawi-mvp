import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { PublicVendor } from '@/types/artisan';

export interface ArtisanProfileProps {
  vendor: PublicVendor;
  joinedAt: Date;
  meetArtisanTitle: string;
  countryLabel: string;
  memberSinceLabel: string;
}

export const ArtisanProfile: React.FC<ArtisanProfileProps> = ({
  vendor,
  joinedAt,
  meetArtisanTitle,
  countryLabel,
  memberSinceLabel,
}) => {
  const { i18n } = useTranslation();

  const initials = `${vendor.name?.[0] ?? ''}${vendor.surname?.[0] ?? ''}`.toUpperCase();
  const fullName = [vendor.name, vendor.lastname, vendor.surname, vendor.second_lastname]
    .filter(Boolean)
    .join(' ');

  const formattedDate = new Intl.DateTimeFormat(i18n.language || 'es', {
    month: 'long',
    year: 'numeric',
  }).format(joinedAt instanceof Date ? joinedAt : new Date(joinedAt));

  return (
    <div className="space-y-4">
      <h3 className="text-xl sm:text-2xl font-bold text-primary-navy tracking-tight">
        {meetArtisanTitle}
      </h3>

      <Card className="p-6 sm:p-8 bg-surface border border-border shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Initials Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-navy to-primary-indigo text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md shrink-0">
            {initials}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-xl sm:text-2xl font-bold text-primary-navy">{fullName}</h4>
              <Badge
                variant="accent"
                className="flex items-center gap-1 normal-case text-xs font-semibold py-0.5 px-2.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-navy" />
                <span>Artesano Verificado</span>
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-text">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-indigo" />
                <span>
                  <strong className="text-primary-navy">{countryLabel}:</strong> {vendor.country}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-indigo" />
                <span>
                  <strong className="text-primary-navy">{memberSinceLabel}:</strong> {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
