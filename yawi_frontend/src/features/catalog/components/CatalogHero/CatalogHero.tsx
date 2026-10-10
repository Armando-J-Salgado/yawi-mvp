import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, ImagePlaceholder } from '@/components/ui';
import { Sparkles, ArrowRight, Globe2, HeartHandshake } from 'lucide-react';

const COLLAGE_IMAGES = [
  { src: '/images/textiles.webp', alt: 'Textiles' },
  { src: '/images/joyeria.webp', alt: 'Joyería' },
  { src: '/images/alfareria.webp', alt: 'Alfarería' },
  { src: '/images/maderas.webp', alt: 'Maderas' },
];

export const CatalogHero: React.FC = () => {
  const { t } = useTranslation('catalog');

  const handleScrollToDiscovery = () => {
    document.getElementById('catalog-discovery')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-primary-navy text-white py-12 sm:py-16 md:py-24 w-full max-w-full">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 sm:w-80 md:w-[500px] h-64 sm:h-80 md:h-[500px] bg-primary-indigo/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-52 sm:w-64 md:w-[400px] h-52 sm:h-64 md:h-[400px] bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (40%) */}
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
                className="w-full sm:w-auto font-bold text-center gap-2 group"
              >
                <span>{t('hero.cta_primary')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                as="a"
                href="/artisans"
                className="w-full sm:w-auto text-white border-white/40 hover:bg-white/10 text-center"
              >
                {t('hero.cta_secondary')}
              </Button>
            </div>
          </div>

          {/* Right Column (60%) */}
          <div className="lg:col-span-7 hidden lg:block">
            <div className="grid grid-cols-2 gap-6">
              {COLLAGE_IMAGES.map((image, index) => (
                <div
                  key={image.src}
                  className={`rounded-card overflow-hidden shadow-2xl border border-white/10 bg-white/5 aspect-4/3 ${
                    index % 2 === 1 ? 'translate-y-6' : ''
                  }`}
                >
                  <ImagePlaceholder src={image.src} alt={image.alt} className="w-full h-full" />
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-medium">
                <Globe2 className="w-4 h-4 text-soft-lavender" />
                <span>{t('hero.made_in_latam')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-medium">
                <HeartHandshake className="w-4 h-4 text-peach-accent" />
                <span>{t('hero.fair_trade')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
