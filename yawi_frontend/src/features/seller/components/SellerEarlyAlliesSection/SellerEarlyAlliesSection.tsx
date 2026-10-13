import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Gift, Tag } from 'lucide-react';
import { SectionContainer, Card, Badge } from '../../../../components/ui';

const TIER_ICONS = [Star, Gift, Tag];

interface TierItem {
  label: string;
  benefit: string;
}

export const SellerEarlyAlliesSection: React.FC = () => {
  const { t } = useTranslation('seller');
  const tiers = (t('early_allies.tiers', { returnObjects: true }) as TierItem[]) || [];

  return (
    <SectionContainer background="surface">
      <div className="w-full h-1 bg-peach-accent/40 mb-12 rounded-full" />

      <div className="flex flex-col items-center text-center">
        <Badge variant="accent" className="mb-4">
          {t('early_allies.launch_badge')}
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-navy">
          {t('early_allies.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {tiers.map((tier, index) => {
          const IconComponent = TIER_ICONS[index] || Star;
          const isFeatured = index === 0;

          return (
            <Card
              key={index}
              hoverable
              className={`flex flex-col items-center text-center gap-4 p-8 relative ${
                isFeatured ? 'border-2 border-peach-accent shadow-card-hover' : ''
              }`}
            >
              <div className="p-3.5 bg-peach-accent/15 rounded-full text-peach-accent inline-flex items-center justify-center">
                <IconComponent className="w-7 h-7" />
              </div>

              <span className="inline-block px-3 py-1 bg-peach-accent/20 text-primary-navy font-semibold text-xs rounded-full uppercase tracking-wider">
                {tier.label}
              </span>

              <p className="text-base text-primary-text font-medium leading-relaxed">
                {tier.benefit}
              </p>
            </Card>
          );
        })}
      </div>
    </SectionContainer>
  );
};
