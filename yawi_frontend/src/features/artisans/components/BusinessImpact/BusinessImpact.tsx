import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export interface BusinessImpactProps {
  businessName: string;
  impactTitle: string;
  impactText: string;
}

export const BusinessImpact: React.FC<BusinessImpactProps> = ({ impactTitle, impactText }) => {
  return (
    <div className="relative overflow-hidden p-6 sm:p-10 bg-primary-navy text-white rounded-card shadow-xl w-full border border-primary-indigo/20">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-48 sm:w-80 h-48 sm:h-80 bg-primary-indigo/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-40 sm:w-64 h-40 sm:h-64 bg-soft-lavender/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-peach-accent border border-white/15 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Comercio Justo y Sostenible</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {impactTitle}
        </h3>

        <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
          {impactText}
        </p>

        <div className="pt-2 flex items-center gap-2 text-peach-accent text-sm font-medium">
          <Heart className="w-4 h-4 fill-peach-accent text-peach-accent" />
          <span>Cada compra genera un impacto real en las comunidades artesanas</span>
        </div>
      </div>
    </div>
  );
};
