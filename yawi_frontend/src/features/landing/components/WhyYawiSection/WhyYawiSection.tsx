import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ShieldCheck, Heart, Truck } from 'lucide-react';
import { SectionContainer, Card } from '../../../../components/ui';

export const WhyYawiSection: React.FC = () => {
  const { t } = useTranslation('landing');

  const icons = [Globe, ShieldCheck, Heart, Truck];

  return (
    <SectionContainer id="why-yawi" background="surface">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight mb-4">
          {t('why_yawi.title')}
        </h2>
        <p className="text-base sm:text-lg text-muted-text">
          {t('why_yawi.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {icons.map((IconComponent, idx) => {
          const cardTitle = t(`why_yawi.cards.${idx}.title`);
          const cardSubtitle = t(`why_yawi.cards.${idx}.subtitle`);

          return (
            <Card
              key={idx}
              hoverable
              className="flex flex-col items-start p-7 h-full bg-background/50 border border-border"
            >
              <div className="w-13 h-13 rounded-2xl bg-soft-lavender/30 text-primary-navy flex items-center justify-center mb-6 shrink-0 transition-transform duration-300 group-hover:scale-110">
                <IconComponent className="w-6 h-6 text-primary-indigo" />
              </div>
              <h3 className="text-lg font-bold text-primary-navy mb-2.5">
                {cardTitle}
              </h3>
              <p className="text-sm text-muted-text leading-relaxed">
                {cardSubtitle}
              </p>
            </Card>
          );
        })}
      </div>
    </SectionContainer>
  );
};
