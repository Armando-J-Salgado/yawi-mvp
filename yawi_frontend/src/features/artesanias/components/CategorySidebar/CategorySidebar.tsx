import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  DollarSign,
  Tag,
} from 'lucide-react';
import type { Category } from '@/data/categories';

export interface CategorySidebarProps {
  category: Category;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  priceRange: string;
  onSelectPriceRange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  mobile?: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  category,
  selectedTags,
  onToggleTag,
  priceRange,
  onSelectPriceRange,
  searchQuery,
  onSearchChange,
  onClearFilters,
  activeFiltersCount,
  mobile = false,
}) => {
  const { t } = useTranslation('artesanias');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const priceOptions = [
    { id: 'all', labelKey: 'category_details.all_prices' },
    { id: 'under_25', labelKey: 'category_details.under_25' },
    { id: 'between_25_50', labelKey: 'category_details.between_25_50' },
    { id: 'between_50_100', labelKey: 'category_details.between_50_100' },
    { id: 'over_100', labelKey: 'category_details.over_100' },
  ];

  const content = (
    <div className="space-y-6">
      {/* 1. Volver a todas las artesanías */}
      <Link
        to="/artesanias"
        className="inline-flex items-center gap-2 text-xs font-semibold text-primary-indigo hover:text-primary-navy transition-colors pb-1 border-b border-transparent hover:border-primary-indigo"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('category_details.back_to_categories')}</span>
      </Link>

      {/* 2. Filtros activos y Limpiar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-peach-accent/15 border border-peach-accent/30 text-xs">
          <span className="font-semibold text-primary-navy">
            {activeFiltersCount} {t('category_details.active_filters')}
          </span>
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 font-bold text-primary-indigo hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('category_details.clear_filters')}</span>
          </button>
        </div>
      )}

      {/* 3. Búsqueda dentro de la categoría */}
      <div className="space-y-2">
        <label
          htmlFor="category-search-input"
          className="block text-xs font-bold uppercase tracking-wider text-primary-navy"
        >
          {t('category_details.search_in_category')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
            <Search className="w-4 h-4 text-primary-navy/50" />
          </div>
          <input
            id="category-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('category_details.search_in_category')}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-surface text-primary-text placeholder:text-muted-text/60 focus:outline-none focus:ring-2 focus:ring-primary-indigo/30 focus:border-primary-indigo transition-all"
          />
        </div>
      </div>

      {/* 4. Sub-filtros por tipo de pieza / etiquetas */}
      {category.details?.suggestedTags && category.details.suggestedTags.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-navy">
            <Tag className="w-3.5 h-3.5 text-primary-indigo" />
            <span>{t('category_details.subcategories_title')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {category.details.suggestedTags.map((item) => {
              const isSelected = selectedTags.includes(item.tag);
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onToggleTag(item.tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-primary-indigo text-white shadow-sm font-semibold scale-105'
                      : 'bg-surface text-primary-text border border-border hover:border-primary-indigo/40 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Filtro por Rango de Precio */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-navy">
          <DollarSign className="w-3.5 h-3.5 text-primary-indigo" />
          <span>{t('category_details.price_range_title')}</span>
        </div>
        <div className="space-y-1">
          {priceOptions.map((opt) => {
            const isSelected = priceRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectPriceRange(opt.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary-indigo/10 text-primary-indigo font-bold'
                    : 'text-muted-text hover:text-primary-navy hover:bg-slate-50'
                }`}
              >
                <span>{t(opt.labelKey)}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary-indigo" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Ficha Cultural: "Sobre esta artesanía" */}
      {category.details && (
        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-navy">
            <Sparkles className="w-3.5 h-3.5 text-peach-accent" />
            <span>{t('category_details.about_title')}</span>
          </div>

          <p className="text-xs text-muted-text leading-relaxed bg-slate-50 p-3 rounded-xl border border-border/60">
            {category.details.culturalNote}
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-primary-navy flex items-center gap-1 mb-1">
                <Layers className="w-3 h-3 text-primary-indigo" />
                {t('category_details.materials_label')}
              </span>
              <p className="text-muted-text pl-4 leading-normal">{category.details.materials}</p>
            </div>

            <div>
              <span className="font-bold text-primary-navy flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-primary-indigo" />
                {t('category_details.techniques_label')}
              </span>
              <p className="text-muted-text pl-4 leading-normal">{category.details.techniques}</p>
            </div>

            <div>
              <span className="font-bold text-primary-navy flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-primary-indigo" />
                {t('category_details.origin_label')}
              </span>
              <p className="text-muted-text pl-4 leading-normal">{category.details.origin}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile layout: Collapsible toggle panel
  if (mobile) {
    return (
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border shadow-sm text-sm font-semibold text-primary-navy hover:border-primary-indigo/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary-indigo" />
            <span>{t('category_details.toggle_filters')}</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-indigo text-white">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpenMobile && (
          <div className="mt-3 p-4 rounded-card bg-surface border border-border shadow-card animate-fadeIn">
            {content}
          </div>
        )}
      </div>
    );
  }

  // Desktop sidebar layout
  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="bg-surface rounded-card p-5 border border-border shadow-card sticky top-24">
        {content}
      </div>
    </aside>
  );
};
