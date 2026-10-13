import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export interface ArtisansSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const ArtisansSearchBar: React.FC<ArtisansSearchBarProps> = ({ value, onChange }) => {
  const { t } = useTranslation('artisans');
  const [innerValue, setInnerValue] = useState(value);

  // Synchronize when parent value changes externally
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  // Debounce notification to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(innerValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [innerValue, onChange]);

  return (
    <div className="w-full">
      <label
        htmlFor="artisans-search"
        className="block text-sm font-semibold text-primary-navy mb-2"
      >
        {t('search.label')}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-text">
          <Search className="w-5 h-5 text-primary-navy/50" />
        </div>
        <input
          id="artisans-search"
          type="search"
          value={innerValue}
          onChange={(e) => setInnerValue(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-surface text-primary-text text-base font-normal leading-relaxed placeholder:text-muted-text/60 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-indigo/40 focus:border-primary-indigo hover:border-primary-indigo/40"
        />
      </div>
    </div>
  );
};
