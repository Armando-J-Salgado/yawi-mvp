import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeartHandshake } from 'lucide-react';
import { SectionContainer, ImagePlaceholder, Badge } from '../../../../components/ui';
import imagesData from '../../landing-images.json';

export const StorySection: React.FC = () => {
  const { t } = useTranslation('landing');
  const storyImage = imagesData.story;

  return (
    <SectionContainer id="story" background="surface">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column: Text content */}
        <div className="lg:col-span-6 space-y-6">
          <Badge variant="default" className="gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-primary-indigo" />
            <span>{t('story.badge')}</span>
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight leading-tight">
            {t('story.title')}
          </h2>

          <p className="text-base sm:text-lg text-muted-text leading-relaxed">{t('story.text')}</p>

          <div className="pt-4 border-t border-border flex items-center gap-6">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">100%</p>
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">
                {t('story.metrics.handmade')}
              </p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">+25</p>
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">
                {t('story.metrics.communities')}
              </p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">0%</p>
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">
                {t('story.metrics.middlemen')}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Visual imagery */}
        <div className="lg:col-span-6">
          <div className="relative">
            {/* Background decorative element */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-soft-lavender/40 to-peach-accent/30 rounded-3xl blur-xl -z-10" />

            <div className="rounded-card overflow-hidden shadow-card-hover border border-border bg-background aspect-4/3 sm:aspect-16/10">
              <ImagePlaceholder
                src={storyImage.src}
                alt={t(storyImage.alt)}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};
