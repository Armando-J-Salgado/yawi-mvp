import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button, ImagePlaceholder, Badge } from '../../../../components/ui';
import imagesData from '../../landing-images.json';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const collageImages = imagesData.hero.collage;

  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-20 lg:py-24">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 w-80 h-80 bg-peach-accent/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: 40-45% text */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-6 text-left">
            <Badge variant="default" className="gap-1.5 px-3.5 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-indigo" />
              <span>{t('hero.badge')}</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-navy tracking-tight leading-[1.1]">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-muted-text leading-relaxed max-w-xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <Button
                variant="primary"
                size="lg"
                as="a"
                href="#categories"
                className="gap-2 group shadow-md"
              >
                <span>{t('hero.cta_primary')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                as="a"
                href="#testimonials"
              >
                {t('hero.cta_secondary')}
              </Button>
            </div>
          </div>

          {/* Right Column: 55-60% Visual collage */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
              {/* Image 1 - taller, slight offset */}
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-card overflow-hidden shadow-card border border-border bg-surface aspect-4/5 transform hover:-translate-y-1 transition-transform duration-300">
                  <ImagePlaceholder
                    src={collageImages[0]?.src}
                    alt={t(collageImages[0]?.alt || 'hero.collage_1_alt')}
                    className="w-full h-full"
                  />
                </div>
                <div className="rounded-card overflow-hidden shadow-card border border-border bg-surface aspect-square transform hover:-translate-y-1 transition-transform duration-300">
                  <ImagePlaceholder
                    src={collageImages[1]?.src}
                    alt={t(collageImages[1]?.alt || 'hero.collage_2_alt')}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Image 2 - staggered column */}
              <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10">
                <div className="rounded-card overflow-hidden shadow-card border border-border bg-surface aspect-square transform hover:-translate-y-1 transition-transform duration-300">
                  <ImagePlaceholder
                    src={collageImages[2]?.src}
                    alt={t(collageImages[2]?.alt || 'hero.collage_3_alt')}
                    className="w-full h-full"
                  />
                </div>
                <div className="rounded-card overflow-hidden shadow-card border border-border bg-surface aspect-4/5 transform hover:-translate-y-1 transition-transform duration-300">
                  <ImagePlaceholder
                    src={collageImages[3]?.src}
                    alt={t(collageImages[3]?.alt || 'hero.collage_4_alt')}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
