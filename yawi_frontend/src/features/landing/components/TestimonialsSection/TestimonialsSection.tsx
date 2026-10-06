import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../../../../components/ui';
import { TestimonialCard } from './TestimonialCard';
import imagesData from '../../landing-images.json';

export const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const testimonialsImages = imagesData.testimonials;

  return (
    <SectionContainer id="testimonials" background="surface">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight mb-4">
          {t('testimonials.title')}
        </h2>
        <p className="text-base sm:text-lg text-muted-text">{t('testimonials.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Buyer Testimonial */}
        <TestimonialCard
          roleType="buyer"
          roleLabel={t('testimonials.buyer_label')}
          avatarSrc={testimonialsImages.buyer.avatar_src}
          name={t('testimonials.buyer.name')}
          subtitle={t('testimonials.buyer.location')}
          quote={t('testimonials.buyer.quote')}
        />

        {/* Artisan Testimonial */}
        <TestimonialCard
          roleType="artisan"
          roleLabel={t('testimonials.artisan_label')}
          avatarSrc={testimonialsImages.artisan.avatar_src}
          name={t('testimonials.artisan.name')}
          subtitle={`${t('testimonials.artisan.craft')} • ${t('testimonials.artisan.location')}`}
          quote={t('testimonials.artisan.quote')}
        />
      </div>
    </SectionContainer>
  );
};
