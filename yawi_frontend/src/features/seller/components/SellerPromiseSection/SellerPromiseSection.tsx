import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

export const SellerPromiseSection: React.FC = () => {
  const { t } = useTranslation('seller');
  const benefits = (t('promise.benefits', { returnObjects: true }) as string[]) || [];

  return (
    <section
      className="relative overflow-hidden py-24 md:py-32 text-white"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary-navy), var(--color-primary-indigo), var(--color-soft-lavender))',
      }}
    >
      {/* Decorative Warmth Orb */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-peach-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-10">
          {t('promise.title')}
        </h2>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-button px-5 py-2.5 text-white font-medium text-sm"
            >
              <CheckCircle className="w-4 h-4 text-peach-accent flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
