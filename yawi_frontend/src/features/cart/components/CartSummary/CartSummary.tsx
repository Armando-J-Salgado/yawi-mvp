import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatCurrency';

export interface CartSummaryProps {
  subtotal: number;
  children?: React.ReactNode;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, children }) => {
  const { t } = useTranslation('cart');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-base">
        <span className="font-semibold text-primary-navy">{t('subtotal')}</span>
        <span className="font-extrabold text-primary-navy">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-lg pt-3 border-t border-border">
        <span className="font-bold text-primary-navy">{t('total')}</span>
        <span className="font-extrabold text-primary-navy">{formatCurrency(subtotal)}</span>
      </div>

      {children}
    </div>
  );
};
