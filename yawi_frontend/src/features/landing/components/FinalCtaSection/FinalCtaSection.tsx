import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../../components/ui';

export const FinalCtaSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <section
      id="final-cta"
      className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-primary-navy via-[#23337A] to-primary-indigo text-white"
    >
      {/* Background glowing effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-peach-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-peach-accent text-xs sm:text-sm font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Comunidad Yawi</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          {t('final_cta.title')}
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-soft-lavender/90 leading-relaxed max-w-2xl mx-auto">
          {t('final_cta.description')}
        </p>

        <div className="pt-4 flex justify-center">
          <Button
            variant="cta"
            size="lg"
            as="a"
            href="#categories"
            className="gap-2 group shadow-xl hover:scale-105 transition-all text-primary-navy font-bold"
          >
            <span>{t('final_cta.button')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
