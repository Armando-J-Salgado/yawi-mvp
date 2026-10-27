import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useProducts,
  ProductFilters,
  ProductGrid,
  FeaturedProductsSection,
} from '@/features/catalog';
import { ArtesaniasHeroBanner, CategoryGrid } from '@/features/artesanias';
import { CATEGORIES } from '@/data/categories';
import { filterProducts, extractAvailableTags } from '@/services/products.service';
import { useErrorToast } from '@/hooks/useErrorToast';
import type { ProductFilters as ProductFiltersState } from '@/types/product';

export default function ArtesaniasPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['artesanias', 'catalog']);
  const { data: products = [], isLoading, isError, error, refetch } = useProducts();

  const [filters, setFilters] = useState<ProductFiltersState>({ search: '', tags: [] });

  useEffect(() => {
    document.title = t('artesanias:meta.home_title');
  }, [t]);

  useErrorToast(isError, error, t('catalog:grid.error'));

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
      {/* 1. Banner compacto con H1 SEO y búsqueda */}
      <ArtesaniasHeroBanner
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
        onSubmit={(query) => navigate(`/buscar?q=${encodeURIComponent(query)}`)}
      />

      {/* 2. Grid de categorías — PRIMER contenido visible */}
      <CategoryGrid categories={CATEGORIES} />

      {/* 3. Productos destacados (solo si hay datos disponibles) */}
      {!isLoading && !isError && products.length > 0 && (
        <FeaturedProductsSection products={products} onViewProduct={handleViewProduct} />
      )}

      {/* 4. Sección de descubrimiento: Búsqueda y filtros */}
      <section id="artesanias-discovery" className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 mb-10">
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
    </>
  );
}
