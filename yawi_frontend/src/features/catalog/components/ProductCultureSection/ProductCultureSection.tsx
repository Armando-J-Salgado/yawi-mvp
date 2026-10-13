import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart } from 'lucide-react';

export interface ProductCultureSectionProps {
  cultureTitle: string;
  cultureText: string;
}

export const ProductCultureSection: React.FC<ProductCultureSectionProps> = ({
  cultureTitle,
  cultureText,
}) => {
  const { t } = useTranslation('catalog');

  return (
    <div className="relative overflow-hidden p-6 sm:p-10 bg-primary-navy text-white rounded-card shadow-xl w-full border border-primary-indigo/20">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-48 sm:w-80 h-48 sm:h-80 bg-primary-indigo/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-40 sm:w-64 h-40 sm:h-64 bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-peach-accent border border-white/15 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('detail.culture_badge')}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {cultureTitle}
        </h3>

        <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
          {cultureText}
        </p>

        <div className="pt-2 flex items-center gap-2 text-peach-accent text-sm font-medium">
          <Heart className="w-4 h-4 fill-peach-accent text-peach-accent" />
          <span>{t('detail.culture_footer')}</span>
        </div>
      </div>
    </div>
  );
};
