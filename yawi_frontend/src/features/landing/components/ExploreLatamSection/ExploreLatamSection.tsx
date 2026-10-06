import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../../../../components/ui';
import { CountryCard } from './CountryCard';
import imagesData from '../../landing-images.json';

export const ExploreLatamSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const countries = imagesData.explore_latam.countries;

  return (
    <SectionContainer id="explore-latam" background="default">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight mb-4">
          {t('explore_latam.title')}
        </h2>
        <p className="text-base sm:text-lg text-muted-text">{t('explore_latam.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {countries.map((country) => (
          <CountryCard
            key={country.id}
            countryKey={country.id}
            countryName={t(`explore_latam.countries.${country.id}`)}
            imageSrc={country.src}
            isActive={country.active}
            activeLabel={t('explore_latam.active_label')}
            comingSoonLabel={t('explore_latam.coming_soon')}
            availableSubtitle={t('explore_latam.available_collection')}
            comingSoonSubtitle={t('explore_latam.coming_soon_collection')}
          />
        ))}
      </div>
    </SectionContainer>
  );
};
