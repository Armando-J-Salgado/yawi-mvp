import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

export const SellerStorySection: React.FC = () => {
  const { t } = useTranslation('seller');

  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary-navy) 0%, var(--color-primary-indigo) 55%, var(--color-soft-lavender) 100%)',
      }}
    >
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-soft-lavender/20 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-peach-accent/15 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-indigo/30 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <BookOpen className="w-10 h-10 text-soft-lavender mx-auto mb-6" />

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          {t('story.title')}
        </h2>

        <div className="w-16 h-1 bg-peach-accent mx-auto rounded-full mb-8" />

        <p className="text-white/85 text-lg md:text-xl leading-relaxed">{t('story.text')}</p>
      </div>
    </section>
  );
};
