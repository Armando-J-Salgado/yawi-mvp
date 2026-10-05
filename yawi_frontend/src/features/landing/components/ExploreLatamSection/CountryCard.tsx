import React from 'react';
import { ImagePlaceholder, Badge } from '../../../../components/ui';

export interface CountryCardProps {
  countryKey: string;
  countryName: string;
  imageSrc?: string;
  isActive: boolean;
  activeLabel: string;
  comingSoonLabel: string;
  availableSubtitle?: string;
  comingSoonSubtitle?: string;
}

export const CountryCard: React.FC<CountryCardProps> = ({
  countryName,
  imageSrc,
  isActive,
  activeLabel,
  comingSoonLabel,
  availableSubtitle = 'Colección disponible',
  comingSoonSubtitle = 'Pronto disponible',
}) => {
  return (
    <div
      className={`relative rounded-card overflow-hidden p-5 flex flex-col justify-between h-48 border transition-all duration-300 ${
        isActive
          ? 'bg-surface border-primary-indigo shadow-card hover:shadow-card-hover -translate-y-1'
          : 'bg-surface/60 border-border/80 opacity-80 hover:opacity-100 hover:border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-border/40 border border-border shrink-0">
          <ImagePlaceholder
            src={imageSrc}
            alt={countryName}
            className="w-full h-full object-cover"
          />
        </div>

        <Badge variant={isActive ? 'accent' : 'outline'}>
          {isActive ? activeLabel : comingSoonLabel}
        </Badge>
      </div>

      <div>
        <h3 className="text-lg font-bold text-primary-navy mb-1">
          {countryName}
        </h3>
        <p className="text-xs text-muted-text">
          {isActive ? availableSubtitle : comingSoonSubtitle}
        </p>
      </div>
    </div>
  );
};
