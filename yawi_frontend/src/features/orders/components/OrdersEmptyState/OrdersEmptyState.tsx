import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

export interface OrdersEmptyStateProps {
  className?: string;
}

export const OrdersEmptyState: React.FC<OrdersEmptyStateProps> = ({ className = '' }) => {
  const { t } = useTranslation('orders');

  return (
    <div
      className={`bg-surface rounded-card border border-border shadow-card p-10 text-center flex flex-col items-center gap-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-soft-lavender/30 flex items-center justify-center">
        <PackageOpen className="w-8 h-8 text-primary-indigo" />
      </div>
      <h2 className="text-xl font-extrabold text-primary-navy tracking-tight">
        {t('list.empty_title')}
      </h2>
      <p className="text-muted-text max-w-md">{t('list.empty_message')}</p>
      <Link
        to="/products"
        className="mt-2 inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-button bg-primary-navy text-white hover:bg-primary-indigo transition-all duration-200"
      >
        {t('list.empty_cta')}
      </Link>
    </div>
  );
};
