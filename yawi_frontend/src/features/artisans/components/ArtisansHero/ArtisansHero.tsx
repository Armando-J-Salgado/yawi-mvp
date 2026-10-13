import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button } from '@/components/ui';
import { Sparkles, Compass, HeartHandshake } from 'lucide-react';

export const ArtisansHero: React.FC = () => {
  const { t } = useTranslation('artisans');

  const handleScrollToDiscovery = () => {
    const el = document.getElementById('artisans-discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-primary-navy text-white py-12 sm:py-16 md:py-24 w-full max-w-full">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 sm:w-80 md:w-[500px] h-64 sm:h-80 md:h-[500px] bg-primary-indigo/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-52 sm:w-64 md:w-[400px] h-52 sm:h-64 md:h-[400px] bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (40% desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-5 sm:space-y-6 w-full min-w-0">
            <Badge variant="accent" className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {t('hero.badge')}
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white break-words">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-lg">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Button
                variant="cta"
                size="lg"
                onClick={handleScrollToDiscovery}
                className="w-full sm:w-auto font-bold text-center"
              >
                {t('hero.cta_primary')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                as="a"
                href="/#story"
                className="w-full sm:w-auto text-white border-white/40 hover:bg-white/10 text-center"
              >
                {t('hero.cta_secondary')}
              </Button>
            </div>
          </div>

          {/* Right Column (60% desktop) */}
          <div className="lg:col-span-7 hidden lg:block">
            <div className="relative rounded-card bg-surface/10 backdrop-blur-md border border-white/10 p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-3 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-peach-accent/20 flex items-center justify-center text-peach-accent">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white">100% Auténtico</h3>
                  <p className="text-sm text-white/70">
                    Conexión directa sin intermediarios con maestros artesanos latinoamericanos.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm space-y-3 transform translate-y-6 rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-soft-lavender/20 flex items-center justify-center text-soft-lavender">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Impacto Regional</h3>
                  <p className="text-sm text-white/70">
                    Preservamos técnicas ancestrales e impulsamos economías locales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
