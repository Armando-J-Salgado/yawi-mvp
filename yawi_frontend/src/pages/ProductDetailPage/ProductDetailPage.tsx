import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useProductDetail,
  ProductDetailHero,
  ProductGallery,
  ProductInfo,
  ProductArtisan,
  AddToCartButton,
  ProductCultureSection,
} from '@/features/catalog';
import { useBusinessDetail } from '@/features/artisans';
import { Button, Skeleton } from '@/components/ui';

export default function ProductDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation('catalog');
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useProductDetail(id);
  const { data: business } = useBusinessDetail(product?.businessId ?? '');

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <Skeleton height="400px" className="w-full rounded-card" />
        <Skeleton height="32px" className="w-1/2" />
        <Skeleton height="120px" className="w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 px-4 text-center">
        <p className="text-muted-text">{t('detail.error')}</p>
        <Button variant="secondary" size="md" onClick={() => navigate('/products')}>
          {t('detail.back')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <ProductDetailHero product={product} backLabel={t('detail.back')} />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <ProductGallery
            images={product.imageUrls}
            productName={product.name}
            galleryTitle={t('detail.gallery_title')}
            noImagesMessage={t('detail.no_images')}
          />

          <div className="space-y-6">
            <ProductInfo
              product={product}
              tagsTitle={t('detail.tags_title')}
              priceLabel={t('detail.price_label')}
            />
            <AddToCartButton
              product={product}
              label={t('detail.add_to_cart')}
              addedMessage={t('added', { ns: 'cart' })}
            />
          </div>

          <ProductArtisan
            business={business}
            businessName={product.businessName}
            artisanTitle={t('detail.artisan_title')}
            countryLabel={t('detail.artisan_country')}
          />

          <ProductCultureSection
            cultureTitle={t('detail.culture_title')}
            cultureText={t('detail.culture_text', { name: product.name })}
          />
        </div>
      </section>
    </>
  );
}
