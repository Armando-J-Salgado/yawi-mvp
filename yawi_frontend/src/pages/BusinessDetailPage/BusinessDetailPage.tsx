import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useBusinessDetail,
  BusinessDetailHero,
  BusinessGallery,
  ArtisanProfile,
  BusinessImpact,
} from '@/features/artisans';
import { Skeleton, Button } from '@/components/ui';

export default function BusinessDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation('artisans');
  const navigate = useNavigate();
  const { data: business, isLoading, isError } = useBusinessDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <Skeleton height="400px" className="w-full rounded-card" />
        <Skeleton height="32px" className="w-1/2" />
        <Skeleton height="120px" className="w-full" />
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center gap-4">
        <p className="text-muted-text text-lg">
          {isError ? t('detail.error') : t('detail.not_found')}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/artisans')}>
          {t('detail.back')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <BusinessDetailHero business={business} backLabel={t('detail.back')} />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="text-3xl font-extrabold text-primary-navy tracking-tight mb-4">
              {business.name}
            </h2>
            <p className="text-base sm:text-lg text-muted-text leading-relaxed">
              {business.description}
            </p>
          </div>

          <BusinessGallery
            images={business.imagesUrls}
            businessName={business.name}
            galleryTitle={t('detail.gallery_title')}
            noImagesMessage={t('detail.no_images')}
          />

          <ArtisanProfile
            vendor={business.owner}
            joinedAt={business.joinedAt}
            meetArtisanTitle={t('detail.meet_artisan')}
            countryLabel={t('detail.country_label')}
            memberSinceLabel={t('detail.member_since')}
          />

          <BusinessImpact
            businessName={business.name}
            impactTitle={t('detail.impact_title')}
            impactText={t('detail.impact_text', { name: business.name })}
          />
        </div>
      </section>
    </>
  );
}
