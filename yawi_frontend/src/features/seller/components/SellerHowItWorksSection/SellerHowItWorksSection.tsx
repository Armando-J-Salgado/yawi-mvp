import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Camera, Megaphone, Inbox } from 'lucide-react';
import { SectionContainer } from '../../../../components/ui';

const STEP_ICONS = [UserPlus, Camera, Megaphone, Inbox];

interface StepItem {
  number: string;
  title: string;
  description: string;
}

export const SellerHowItWorksSection: React.FC = () => {
  const { t } = useTranslation('seller');
  const steps = (t('how_it_works.steps', { returnObjects: true }) as StepItem[]) || [];

  return (
    <SectionContainer background="default">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-navy text-center mb-12">
        {t('how_it_works.title')}
      </h2>

      <div className="relative mt-12">
        {/* Horizontal connector line on desktop */}
        <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-primary-indigo/20" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = STEP_ICONS[index] || UserPlus;

            return (
              <div key={index} className="flex flex-col items-center text-center gap-3 relative">
                {/* Number circle */}
                <div className="w-14 h-14 rounded-full bg-primary-navy text-white font-extrabold text-lg flex items-center justify-center shadow-card relative z-10">
                  {step.number}
                </div>

                {/* Step icon */}
                <div className="text-primary-indigo p-2 mt-1">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Step title */}
                <h3 className="font-bold text-lg text-primary-navy">{step.title}</h3>

                {/* Step description */}
                <p className="text-sm text-muted-text max-w-[200px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
};
