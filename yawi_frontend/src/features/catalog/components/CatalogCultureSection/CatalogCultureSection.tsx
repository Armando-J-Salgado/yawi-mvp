import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '@/components/ui';
import { Sparkles, Heart } from 'lucide-react';

export const CatalogCultureSection: React.FC = () => {
  const { t } = useTranslation('catalog');

  return (
    <SectionContainer background="default" className="relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-soft-lavender/30 via-peach-accent/20 to-soft-lavender/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-soft-lavender/40 text-primary-indigo mb-2">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-navy tracking-tight leading-tight">
          {t('culture.title')}
        </h2>

        <p className="text-lg sm:text-xl text-primary-navy/80 leading-relaxed max-w-2xl mx-auto">
          {t('culture.text')}
        </p>

        <div className="pt-4 flex items-center justify-center gap-2 text-primary-indigo text-sm font-semibold">
          <Heart className="w-4 h-4 fill-primary-indigo text-primary-indigo" />
          <span>{t('culture.footer')}</span>
        </div>
      </div>
    </SectionContainer>
  );
};
