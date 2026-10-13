import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Quote } from 'lucide-react';
import { SectionContainer } from '../../../../components/ui';

export const CultureSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <SectionContainer id="culture" background="default" className="relative overflow-hidden">
      {/* Decorative gradient sphere */}
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

        <div className="pt-6">
          <div className="inline-flex flex-col items-center p-6 bg-surface/80 backdrop-blur-xs rounded-2xl border border-border max-w-xl shadow-xs">
            <Quote className="w-8 h-8 text-peach-accent mb-2" />
            <p className="text-base sm:text-lg font-medium italic text-primary-navy">
              {t('culture.quote')}
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};
