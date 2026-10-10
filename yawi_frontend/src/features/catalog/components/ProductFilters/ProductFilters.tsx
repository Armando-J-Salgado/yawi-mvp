import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ProductFiltersProps {
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClear: () => void;
}

/**
 * Filtros por tags. La lista de tags se deriva dinámicamente de los productos cargados.
 *
 * Arquitectura preparada para crecer: en el futuro este contenedor podrá alojar filtros de
 * país, artesano, categoría, rango de precios y disponibilidad (ver `ProductFilters` en
 * `@/types/product`) sin cambiar la firma de los componentes de grilla.
 */
export const ProductFilters: React.FC<ProductFiltersProps> = ({
  availableTags,
  selectedTags,
  onToggleTag,
  onClear,
}) => {
  const { t } = useTranslation('catalog');

  if (availableTags.length === 0) return null;

  return (
    <div className="w-full max-w-full min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="block text-sm font-semibold text-primary-navy">{t('filters.title')}</span>
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-primary-indigo hover:text-primary-navy transition-colors cursor-pointer"
          >
            {t('filters.clear')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full max-w-full min-w-0 md:flex-wrap">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              aria-pressed={isSelected}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-primary-navy text-white shadow-sm'
                  : 'bg-surface border border-primary-navy/30 text-primary-navy hover:bg-primary-navy/5'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
