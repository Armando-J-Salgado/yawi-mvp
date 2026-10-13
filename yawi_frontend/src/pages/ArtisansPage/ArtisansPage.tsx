import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useBusinesses,
  ArtisansHero,
  ArtisansSearchBar,
  ArtisansFilters,
  BusinessGrid,
  FeaturedArtisansSection,
  ArtisansCultureSection,
} from '@/features/artisans';
import type { ArtisanFilters } from '@/features/artisans';
import type { Business } from '@/types/artisan';

export default function ArtisansPage() {
  const navigate = useNavigate();
  const { data: businesses = [], isLoading, isError, refetch } = useBusinesses();

  const [filters, setFilters] = useState<ArtisanFilters>({ search: '', country: '' });

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b: Business) => {
      const searchTerm = filters.search.toLowerCase().trim();
      const matchSearch =
        searchTerm === '' ||
        b.name.toLowerCase().includes(searchTerm) ||
        `${b.owner.name} ${b.owner.surname}`.toLowerCase().includes(searchTerm);
      const matchCountry = filters.country === '' || b.owner.country === filters.country;
      return matchSearch && matchCountry;
    });
  }, [businesses, filters]);

  const handleViewProfile = (id: string) => navigate(`/artisans/${id}`);

  return (
    <>
      <ArtisansHero />

      {!isLoading && !isError && businesses.length > 0 && (
        <FeaturedArtisansSection
          businesses={businesses.slice(0, 3)}
          onViewProfile={handleViewProfile}
        />
      )}

      <section
        id="artisans-discovery"
        className="py-12 sm:py-16 md:py-24 bg-background w-full max-w-full overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
          <div className="flex flex-col gap-6 mb-10 w-full min-w-0">
            <ArtisansSearchBar
              value={filters.search}
              onChange={(search: string) => setFilters((f: ArtisanFilters) => ({ ...f, search }))}
            />
            <ArtisansFilters
              selectedCountry={filters.country}
              onCountryChange={(country: string) =>
                setFilters((f: ArtisanFilters) => ({ ...f, country }))
              }
            />
          </div>

          <BusinessGrid
            businesses={filteredBusinesses}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onViewProfile={handleViewProfile}
          />
        </div>
      </section>

      <ArtisansCultureSection />
    </>
  );
}
