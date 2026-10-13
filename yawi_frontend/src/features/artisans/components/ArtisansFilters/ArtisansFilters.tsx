import React from 'react';
import { useTranslation } from 'react-i18next';
import { COUNTRY_FILTERS } from '../../types';

export interface ArtisansFiltersProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const ArtisansFilters: React.FC<ArtisansFiltersProps> = ({
  selectedCountry,
  onCountryChange,
}) => {
  const { t } = useTranslation('artisans');

  return (
    <div className="w-full max-w-full min-w-0 space-y-3">
      <span className="block text-sm font-semibold text-primary-navy">{t('filters.title')}</span>
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full max-w-full min-w-0 md:flex-wrap">
        {COUNTRY_FILTERS.map((filter) => {
          const isSelected = selectedCountry === filter.value;
          const label = t(filter.labelKey);

          if (!filter.available) {
            return (
              <button
                key={filter.labelKey}
                type="button"
                disabled
                className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-border bg-surface text-muted-text/50 opacity-60 cursor-not-allowed transition-all"
              >
                {label}
              </button>
            );
          }

          return (
            <button
              key={filter.labelKey}
              type="button"
              onClick={() => onCountryChange(filter.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-primary-navy text-white shadow-sm'
                  : 'bg-surface border border-primary-navy/30 text-primary-navy hover:bg-primary-navy/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
