import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export interface CheckoutEmptyCartProps {
  className?: string;
}

/** Estado mostrado en `/checkout` cuando el carrito está vacío. */
export const CheckoutEmptyCart: React.FC<CheckoutEmptyCartProps> = ({ className = '' }) => {
  const { t } = useTranslation('checkout');

  return (
    <div
      className={`bg-surface rounded-card border border-border shadow-card p-10 text-center flex flex-col items-center gap-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-soft-lavender/30 flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-primary-indigo" />
      </div>
      <h2 className="text-xl font-extrabold text-primary-navy tracking-tight">
        {t('empty_cart.title')}
      </h2>
      <p className="text-muted-text max-w-md">{t('empty_cart.message')}</p>
      <Link
        to="/products"
        className="mt-2 inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-button bg-primary-navy text-white hover:bg-primary-indigo transition-all duration-200"
      >
        {t('empty_cart.cta')}
      </Link>
    </div>
  );
};
