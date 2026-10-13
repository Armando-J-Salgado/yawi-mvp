import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useProducts,
  CatalogHero,
  ProductSearchBar,
  ProductFilters,
  ProductGrid,
  FeaturedProductsSection,
  CatalogCultureSection,
} from '@/features/catalog';
import { filterProducts, extractAvailableTags } from '@/services/products.service';
import { useErrorToast } from '@/hooks/useErrorToast';
import type { ProductFilters as ProductFiltersState } from '@/types/product';

export default function CatalogPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('catalog');
  const { data: products = [], isLoading, isError, error, refetch } = useProducts();

  const [filters, setFilters] = useState<ProductFiltersState>({ search: '', tags: [] });

  useErrorToast(isError, error, t('grid.error'));

  const availableTags = useMemo(() => extractAvailableTags(products), [products]);
  const filteredProducts = useMemo(() => filterProducts(products, filters), [products, filters]);

  const handleViewProduct = (id: string) => navigate(`/products/${id}`);

  const handleToggleTag = (tag: string) =>
    setFilters((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((selected) => selected !== tag)
        : [...current.tags, tag],
    }));

  return (
    <>
      <CatalogHero />

      {!isLoading && !isError && products.length > 0 && (
        <FeaturedProductsSection products={products} onViewProduct={handleViewProduct} />
      )}

      <section id="catalog-discovery" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 mb-10">
            <ProductSearchBar
              value={filters.search}
              onChange={(search) => setFilters((current) => ({ ...current, search }))}
            />
            <ProductFilters
              availableTags={availableTags}
              selectedTags={filters.tags}
              onToggleTag={handleToggleTag}
              onClear={() => setFilters((current) => ({ ...current, tags: [] }))}
            />
          </div>

          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onViewProduct={handleViewProduct}
          />
        </div>
      </section>

      <CatalogCultureSection />
    </>
  );
}
