import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PaymentSession } from '../../providers/types';

export interface CheckoutConfirmationProps {
  orderId: string;
  total: number;
  session: PaymentSession;
}

/** Paso final del checkout: orden creada + instrucciones de transferencia mock. */
export const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  orderId,
  total,
  session,
}) => {
  const { t } = useTranslation('checkout');
  const { instructions } = session;

  const rows: { label: string; value: string }[] = [
    { label: t('confirmation.beneficiary'), value: instructions.beneficiary },
    { label: t('confirmation.bank'), value: instructions.bank },
    { label: t('confirmation.account'), value: instructions.accountNumber },
    { label: t('confirmation.reference'), value: instructions.reference },
  ];

  return (
    <div className="bg-surface rounded-card border border-border shadow-card p-8 space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center gap-3">
        <CheckCircle2 className="w-12 h-12 text-primary-indigo" />
        <h1 className="text-2xl font-extrabold text-primary-navy tracking-tight">
          {t('confirmation.title')}
        </h1>
        <p className="text-muted-text">{t('confirmation.message')}</p>
      </div>

      <div className="flex items-center justify-between rounded-card bg-background border border-border px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            {t('confirmation.order_id')}
          </p>
          <p className="text-lg font-extrabold text-primary-navy">
            #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            {t('confirmation.total')}
          </p>
          <p className="text-lg font-extrabold text-primary-navy">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary-navy">
          {t('confirmation.instructions_title')}
        </h2>
        <dl className="divide-y divide-border/70 rounded-card border border-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3 gap-4">
              <dt className="text-sm text-muted-text">{row.label}</dt>
              <dd className="text-sm font-semibold text-primary-navy text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/orders/${orderId}`}
          className="flex-1 inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-button bg-primary-navy text-white hover:bg-primary-indigo transition-all duration-200"
        >
          {t('confirmation.view_order')}
        </Link>
        <Link
          to="/orders"
          className="flex-1 inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-button bg-transparent text-primary-navy border border-primary-navy hover:bg-primary-navy/5 transition-all duration-200"
        >
          {t('confirmation.go_to_orders')}
        </Link>
      </div>
    </div>
  );
};
