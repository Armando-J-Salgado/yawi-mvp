import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionContainer, Card, Badge } from '@/components/ui';
import { MapPin, Globe } from 'lucide-react';

interface CountryInfo {
  code: string;
  name: string;
  active: boolean;
  flag: string;
  description: string;
}

const COUNTRIES: CountryInfo[] = [
  {
    code: 'SV',
    name: 'El Salvador',
    active: true,
    flag: '🇸🇻',
    description: 'Tierra de volcanes, café y rica tradición en alfarería, añil y madera.',
  },
  {
    code: 'GT',
    name: 'Guatemala',
    active: false,
    flag: '🇬🇹',
    description: 'Cuna de tejidos mayas ancestrales, cerámica y tallados tradicionales.',
  },
  {
    code: 'HN',
    name: 'Honduras',
    active: false,
    flag: '🇭🇳',
    description: 'Maestría en artesanía de barro lenca, junco y fibras naturales.',
  },
];

export const ArtisansCultureSection: React.FC = () => {
  const { t } = useTranslation('artisans');

  return (
    <SectionContainer background="default" className="py-16 md:py-24">
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-soft-lavender/30 text-primary-navy text-xs font-semibold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 text-primary-indigo" />
            <span>Latinoamérica</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight">
            {t('culture.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-text leading-relaxed">
            {t('culture.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COUNTRIES.map((item) => (
            <Card
              key={item.code}
              hoverable={item.active}
              className={`p-6 flex flex-col justify-between space-y-6 ${
                item.active
                  ? 'border-primary-indigo/30 shadow-card hover:shadow-card-hover'
                  : 'bg-surface/60 border-border/80 opacity-90'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl" role="img" aria-label={item.name}>
                    {item.flag}
                  </span>
                  <Badge
                    variant={item.active ? 'accent' : 'outline'}
                    className="normal-case text-xs font-semibold py-0.5 px-2.5"
                  >
                    {item.active ? t('culture.active_label') : t('culture.coming_soon')}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-lg font-bold text-primary-navy">
                    <MapPin className="w-4 h-4 text-primary-indigo" />
                    <span>{item.name}</span>
                  </div>
                  <p className="text-sm text-muted-text leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 text-xs font-medium text-muted-text">
                {item.active ? (
                  <span className="text-primary-indigo font-semibold">
                    Comunidad activa de artesanos
                  </span>
                ) : (
                  <span>Próxima apertura regional</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};
