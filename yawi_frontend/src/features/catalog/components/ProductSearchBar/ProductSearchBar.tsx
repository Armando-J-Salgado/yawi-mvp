import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ value, onChange }) => {
  const { t } = useTranslation('catalog');
  const [innerValue, setInnerValue] = useState(value);

  // Sincroniza cuando el valor cambia desde fuera (p. ej. "limpiar filtros").
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  // Debounce de 300ms para no re-filtrar en cada tecla.
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(innerValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [innerValue, onChange]);

  return (
    <div className="w-full">
      <label
        htmlFor="catalog-search"
        className="block text-sm font-semibold text-primary-navy mb-2"
      >
        {t('search.label')}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-text">
          <Search className="w-5 h-5 text-primary-navy/50" />
        </div>
        <input
          id="catalog-search"
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
