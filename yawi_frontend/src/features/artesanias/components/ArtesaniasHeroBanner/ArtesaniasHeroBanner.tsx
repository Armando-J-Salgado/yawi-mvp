import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Search } from 'lucide-react';

export interface ArtesaniasHeroBannerProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmit?: (query: string) => void;
}

export const ArtesaniasHeroBanner: React.FC<ArtesaniasHeroBannerProps> = ({
  search,
  onSearchChange,
  onSubmit,
}) => {
  const { t } = useTranslation('artesanias');
  const [innerValue, setInnerValue] = useState(search);

  useEffect(() => {
    setInnerValue(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(innerValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [innerValue, onSearchChange]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary-navy via-[#1F2C6D] to-primary-navy text-white py-6 sm:py-8 border-b border-white/10">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/3 -z-10 w-72 h-72 bg-soft-lavender/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 w-64 h-64 bg-peach-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* SEO Heading & Subtitle */}
          <div className="text-center md:text-left space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-peach-accent text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('hero.title')}
            </h1>
            <p className="text-xs sm:text-sm text-soft-lavender/80 max-w-md">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-96 flex-shrink-0">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (onSubmit) {
                  onSubmit(innerValue.trim());
                }
              }}
            >
              <label htmlFor="artesanias-hero-search" className="sr-only">
                {t('hero.search_placeholder')}
              </label>
              <div className="relative">
                {!onSubmit && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
                    <Search className="w-4 h-4 text-primary-navy/60" />
                  </div>
                )}
                <input
                  id="artesanias-hero-search"
                  type="search"
                  value={innerValue}
                  onChange={(e) => setInnerValue(e.target.value)}
                  placeholder={t('hero.search_placeholder')}
                  className={`w-full ${onSubmit ? 'pl-4 pr-10' : 'pl-10 pr-4'} py-2.5 rounded-xl bg-surface text-primary-text text-sm placeholder:text-muted-text/70 shadow-md focus:outline-none focus:ring-2 focus:ring-peach-accent/80 border border-transparent transition-all`}
                />
                {onSubmit && (
                  <button
                    type="submit"
                    aria-label={t('hero.search_aria_submit')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary-navy/60 hover:text-primary-navy transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
