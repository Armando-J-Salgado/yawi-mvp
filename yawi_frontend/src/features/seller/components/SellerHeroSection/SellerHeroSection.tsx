import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SectionContainer, ImagePlaceholder } from '../../../../components/ui';
import imagesData from '../../seller-images.json';

export const SellerHeroSection: React.FC = () => {
  const { t } = useTranslation('seller');

  return (
    <SectionContainer
      id="seller-hero"
      className="relative overflow-hidden min-h-[70vh] flex items-center"
    >
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-soft-lavender/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary-indigo/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Left column (content) */}
        <div className="flex flex-col items-start space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-primary-navy">
            {t('hero.title')}
          </h1>

          <p className="text-lg md:text-xl text-muted-text leading-relaxed max-w-xl">
            {t('hero.subtitle')}
          </p>

          <div className="pt-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              as="a"
              href="#registro"
              className="w-full sm:w-auto shadow-md"
            >
              {t('hero.cta_primary')}
            </Button>
          </div>
        </div>

        {/* Right column (image) */}
        <div className="w-full">
          <ImagePlaceholder
            className="rounded-card shadow-card-hover w-full h-80 md:h-[420px]"
            src={imagesData.hero.src}
            alt={t(imagesData.hero.alt)}
          />
        </div>
      </div>
    </SectionContainer>
  );
};
