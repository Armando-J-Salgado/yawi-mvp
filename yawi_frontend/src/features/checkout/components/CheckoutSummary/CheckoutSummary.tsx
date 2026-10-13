import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatCurrency';
import { DEFAULT_SHIPPING_FEE, estimateOrderTotal } from '../../checkoutTotals';
import type { CartItem } from '@/types/cart';

export interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
}

/**
 * Resumen del pedido en el checkout.
 * Muestra explícitamente el subtotal, el cargo de envío ($10.00 fijo del MVP)
 * y el total estimado. El total definitivo lo confirma el backend al crear la orden.
 */
export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ items, subtotal }) => {
  const { t } = useTranslation('checkout');
  const estimatedTotal = estimateOrderTotal(subtotal);

  return (
    <div className="bg-surface rounded-card border border-border shadow-card p-6 space-y-4">
      <h2 className="text-lg font-extrabold text-primary-navy tracking-tight">
        {t('items.title')}
      </h2>

      <ul className="divide-y divide-border/70">
        {items.map((item) => (
          <li key={item.productId} className="py-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-primary-navy truncate">{item.name}</p>
              <p className="text-sm text-muted-text">
                {item.quantity} × {formatCurrency(item.price)}
              </p>
            </div>
            <span className="font-bold text-primary-navy shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-sm text-muted-text">
          <span>{t('summary.subtotal')}</span>
          <span className="font-semibold text-primary-navy">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-text">
          <span>{t('summary.shipping')}</span>
          <span className="font-semibold text-primary-navy">
            {formatCurrency(DEFAULT_SHIPPING_FEE)}
          </span>
        </div>
        <p className="text-xs text-muted-text">{t('summary.shipping_note')}</p>
        <div className="flex items-center justify-between pt-3 border-t border-border text-lg">
          <span className="font-bold text-primary-navy">{t('summary.total')}</span>
          <span className="font-extrabold text-primary-navy">{formatCurrency(estimatedTotal)}</span>
        </div>
      </div>
    </div>
  );
};
