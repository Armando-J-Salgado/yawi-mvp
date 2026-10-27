import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';
import { useProducts, ProductGrid } from '@/features/catalog';
import { ArtesaniasHeroBanner, Breadcrumb } from '@/features/artesanias';
import { CATEGORIES } from '@/data/categories';
import { filterProducts } from '@/services/products.service';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Button } from '@/components/ui';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['artesanias', 'catalog']);

  const query = searchParams.get('q') ?? '';

  const { data: allProducts = [], isLoading, isError, error, refetch } = useProducts();

  useErrorToast(isError, error, t('artesanias:search.error'));

  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts, { search: query, tags: [] });
  }, [allProducts, query]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed) {
      document.title = t('artesanias:search.meta_title', { query: trimmed });
    } else {
      document.title = t('artesanias:search.meta_title_empty');
    }
  }, [query, t]);

  const handleSearchChange = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSubmit = (submittedQuery: string) => {
    if (submittedQuery) {
      setSearchParams({ q: submittedQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleViewProduct = (id: string) => navigate(`/products/${id}`);

  const trimmedQuery = query.trim();
  const count = filteredProducts.length;

  return (
    <>
      <ArtesaniasHeroBanner
        search={query}
        onSearchChange={handleSearchChange}
        onSubmit={handleSubmit}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Breadcrumb
          items={[
            { label: t('artesanias:breadcrumb.home'), href: '/artesanias' },
            {
              label: trimmedQuery
                ? t('artesanias:search.breadcrumb_label', { query: trimmedQuery })
                : t('artesanias:search.meta_title_empty'),
            },
          ]}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-navy">
            {trimmedQuery
              ? t('artesanias:search.heading', { query: trimmedQuery })
              : t('artesanias:search.meta_title_empty')}
          </h1>
          {!isLoading && !isError && (
            <p className="text-sm text-muted-text mt-1">
              {count === 1
                ? t('artesanias:search.count_one', { count })
                : t('artesanias:search.count_other', { count })}
            </p>
          )}
        </header>

        {!isLoading && !isError && filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-card bg-surface border border-border space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-soft-lavender/30 flex items-center justify-center text-primary-navy">
              <SearchX className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-lg font-bold text-primary-navy">
                {trimmedQuery
                  ? t('artesanias:search.empty_title', { query: trimmedQuery })
                  : t('artesanias:search.meta_title_empty')}
              </h2>
              <p className="text-sm text-muted-text">{t('artesanias:search.empty_text')}</p>
            </div>

            <div className="w-full max-w-lg space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                {t('artesanias:search.suggestions_label')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/artesanias/${cat.slug}`}
                    className="px-3 py-1.5 rounded-full bg-soft-lavender/30 hover:bg-soft-lavender/60 text-primary-navy text-xs font-medium transition-colors"
                  >
                    {t(`artesanias:categories.${cat.id.replace(/-/g, '_')}`)}
                  </Link>
                ))}
              </div>
            </div>

            <Button variant="primary" size="md" onClick={() => navigate('/artesanias')}>
              {t('artesanias:search.empty_cta')}
            </Button>
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onViewProduct={handleViewProduct}
          />
        )}
      </main>
    </>
  );
}
