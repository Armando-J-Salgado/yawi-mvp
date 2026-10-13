import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer, Button } from '../../../../components/ui';

export const SellerFinalCtaSection: React.FC = () => {
  const { t } = useTranslation('seller');

  return (
    <SectionContainer id="registro" background="default" className="py-24 md:py-32">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <div className="w-24 h-1 bg-primary-indigo mx-auto rounded-full mb-6" />

        <h2 className="text-3xl md:text-4xl font-extrabold text-primary-navy text-center mb-8 max-w-2xl">
          {t('final_cta.title')}
        </h2>

        <Button
          variant="cta"
          size="lg"
          as="a"
          href="#registro"
          className="shadow-md hover:scale-105 transition-transform"
        >
          {t('final_cta.button')}
        </Button>
      </div>
    </SectionContainer>
  );
};
