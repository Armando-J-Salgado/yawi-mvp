import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { SectionContainer, Card, Badge } from '../../../../components/ui';

interface MarketItem {
  flag: string;
  name: string;
  status: 'active' | 'coming_soon';
}

export const SellerMarketsSection: React.FC = () => {
  const { t } = useTranslation('seller');
  const items = (t('markets.items', { returnObjects: true }) as MarketItem[]) || [];

  return (
    <SectionContainer background="surface">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-navy text-center">
        {t('markets.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        {items.map((market, index) => {
          const isActive = market.status === 'active';

          return (
            <Card
              key={index}
              hoverable
              className={`flex flex-col items-center text-center gap-4 p-8 ${
                isActive ? 'border-2 border-primary-indigo shadow-card-hover' : 'opacity-85'
              }`}
            >
              <span className="text-5xl select-none" role="img" aria-label={market.name}>
                {market.flag}
              </span>

              <h3 className="text-xl font-bold text-primary-navy">{market.name}</h3>

              <div className="pt-2">
                {isActive ? (
                  <Badge variant="accent" className="gap-1.5 normal-case text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-primary-navy" />
                    <span>{t('markets.active_label')}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="normal-case text-xs">
                    {t('markets.coming_soon_label')}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </SectionContainer>
  );
};
