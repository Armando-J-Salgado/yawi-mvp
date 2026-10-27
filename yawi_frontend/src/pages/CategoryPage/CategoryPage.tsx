import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PackageOpen } from 'lucide-react';
import { ProductGrid } from '@/features/catalog';
import { CategoryHeroBanner, CategorySidebar, useProductsByCategory } from '@/features/artesanias';
import { CATEGORIES } from '@/data/categories';
import { Button } from '@/components/ui';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['artesanias', 'catalog']);

  const category = CATEGORIES.find((c) => c.slug === slug);

  // Filtros internos de la categoría
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Limpiar filtros al cambiar de categoría
  useEffect(() => {
    setSelectedTags([]);
    setPriceRange('all');
    setSearchQuery('');
  }, [slug]);

  const {
    data: rawCategoryProducts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProductsByCategory(category?.tag ?? '');

  const resolveText = (key: string) => {
    const direct = t(key);
    if (direct !== key) return direct;
    const stripped = key.replace(/^artesanias\./, '');
    return t(stripped);
  };

  const categoryTitle = category ? resolveText(category.titleKey) : '';
  const categoryDescription = category ? resolveText(category.descriptionKey) : '';

  useEffect(() => {
    if (category) {
      document.title = `${categoryTitle} ${t('artesanias:meta.category_title_suffix')}`;
    }
  }, [category, categoryTitle, t]);

  useErrorToast(isError, error, t('catalog:grid.error'));

  // Filtrado compuesto dentro de la categoría
  const filteredProducts = useMemo(() => {
    return rawCategoryProducts.filter((p) => {
      // 1. Filtro por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBusiness = p.businessName?.toLowerCase().includes(query) ?? false;
        const matchesTag = p.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesBusiness && !matchesTag) {
          return false;
        }
      }

      // 2. Filtro por sub-tags seleccionados
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((selected) =>
          p.tags.some((tag) => tag.toLowerCase() === selected.toLowerCase()),
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // 3. Filtro por rango de precio
      if (priceRange === 'under_25' && p.price >= 25) return false;
      if (priceRange === 'between_25_50' && (p.price < 25 || p.price > 50)) return false;
      if (priceRange === 'between_50_100' && (p.price < 50 || p.price > 100)) return false;
      if (priceRange === 'over_100' && p.price <= 100) return false;

      return true;
    });
  }, [rawCategoryProducts, searchQuery, selectedTags, priceRange]);

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) + selectedTags.length + (priceRange !== 'all' ? 1 : 0);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setPriceRange('all');
    setSearchQuery('');
  };

  if (!category) {
    return <Navigate to="/artesanias" replace />;
  }

  return (
    <>
      {/* 1. Banner mínimo con breadcrumb */}
      <CategoryHeroBanner
        title={categoryTitle}
        description={categoryDescription}
        breadcrumbItems={[
          { label: t('artesanias:breadcrumb.home'), href: '/artesanias' },
          { label: categoryTitle },
        ]}
      />

      {/* 2. Layout principal: Sidebar de Detalles & Filtros + Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-background">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar desktop con ficha cultural y filtros */}
          <CategorySidebar
            category={category}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            priceRange={priceRange}
            onSelectPriceRange={setPriceRange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Área principal */}
          <div className="flex-1 w-full min-w-0">
            {/* Mobile: botón desplegable de filtros y detalles */}
            <CategorySidebar
              category={category}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
              priceRange={priceRange}
              onSelectPriceRange={setPriceRange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
              mobile
            />

            {!isLoading && !isError && filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-card bg-surface border border-border space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-soft-lavender/30 flex items-center justify-center text-primary-navy">
                  <PackageOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-primary-navy">
                  {activeFiltersCount > 0
                    ? t('category_details.clear_filters')
                    : t('artesanias:empty.title')}
                </h3>
                <p className="text-sm text-muted-text max-w-md">
                  {activeFiltersCount > 0
                    ? 'No se encontraron piezas con los filtros seleccionados. Intenta restablecer los filtros.'
                    : t('artesanias:empty.text')}
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={
                    activeFiltersCount > 0 ? handleClearFilters : () => navigate('/artesanias')
                  }
                >
                  {activeFiltersCount > 0
                    ? t('category_details.clear_filters')
                    : t('artesanias:empty.cta')}
                </Button>
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                isLoading={isLoading}
                isError={isError}
                onRetry={() => void refetch()}
                onViewProduct={(id) => navigate(`/products/${id}`)}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
