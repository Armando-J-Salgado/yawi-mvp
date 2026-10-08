import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, MessageCircle } from 'lucide-react';
import { SectionContainer, Card } from '../../../../components/ui';

const HELPS_ICONS = [Users, TrendingUp, MessageCircle];

interface HelpsBlockItem {
  heading: string;
  text: string;
  image_alt?: string;
}

export const SellerHowYawiHelpsSection: React.FC = () => {
  const { t } = useTranslation('seller');
  const blocks = (t('how_yawi_helps.blocks', { returnObjects: true }) as HelpsBlockItem[]) || [];

  return (
    <SectionContainer background="default">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-navy text-center mb-12">
        {t('how_yawi_helps.title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blocks.map((block, index) => {
          const IconComponent = HELPS_ICONS[index] || Users;

          return (
            <Card
              key={index}
              hoverable
              className="flex flex-col items-center text-center gap-4 p-8"
            >
              <div className="p-4 bg-soft-lavender/30 rounded-full text-primary-navy inline-flex items-center justify-center">
                <IconComponent className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary-navy">{block.heading}</h3>
              <p className="text-muted-text leading-relaxed">{block.text}</p>
            </Card>
          );
        })}
      </div>
    </SectionContainer>
  );
};
