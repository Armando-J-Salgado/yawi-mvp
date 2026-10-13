import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatCurrency';

export interface OrderTotalsProps {
  subtotal: number;
  shippingFee: number;
  total: number;
}

export const OrderTotals: React.FC<OrderTotalsProps> = ({ subtotal, shippingFee, total }) => {
  const { t } = useTranslation('orders');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-text">
        <span>{t('detail.subtotal')}</span>
        <span className="font-semibold text-primary-navy">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-text">
        <span>{t('detail.shipping')}</span>
        <span className="font-semibold text-primary-navy">{formatCurrency(shippingFee)}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border text-lg">
        <span className="font-bold text-primary-navy">{t('detail.total')}</span>
        <span className="font-extrabold text-primary-navy">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
