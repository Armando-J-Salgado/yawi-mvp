import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Eye, Monitor, CreditCard } from 'lucide-react';
import { SectionContainer, Card } from '../../../../components/ui';

const PROBLEM_ICONS = [MapPin, Globe, Eye, Monitor, CreditCard];

interface ProblemCardItem {
  text: string;
}

export const SellerProblemSection: React.FC = () => {
  const { t } = useTranslation('seller');
  const cards = (t('problem.cards', { returnObjects: true }) as ProblemCardItem[]) || [];

  return (
    <SectionContainer background="surface">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-navy text-center mb-10">
        {t('problem.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {cards.map((card, index) => {
          const IconComponent = PROBLEM_ICONS[index] || MapPin;
          // In lg screens, centering the last two items if index >= 3
          const isSpanNeeded =
            index === 3
              ? 'lg:col-start-1 lg:ml-auto w-full lg:max-w-md'
              : index === 4
                ? 'lg:col-start-2 lg:mr-auto w-full lg:max-w-md'
                : '';

          return (
            <Card
              key={index}
              hoverable
              className={`flex flex-col items-center sm:items-start text-center sm:text-left gap-4 p-6 ${isSpanNeeded}`}
            >
              <div className="p-3 bg-soft-lavender/20 rounded-full text-primary-indigo inline-flex items-center justify-center">
                <IconComponent className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-primary-text leading-relaxed">
                {card.text}
              </p>
            </Card>
          );
        })}
      </div>
    </SectionContainer>
  );
};
