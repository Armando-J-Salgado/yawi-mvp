import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Landmark } from 'lucide-react';
import { PAYMENT_PROVIDERS } from '../../providers/paymentProviders';
import type { PaymentProviderId } from '../../providers/types';

export interface PaymentMethodSelectorProps {
  selected: PaymentProviderId;
  onSelect: (id: PaymentProviderId) => void;
}

/**
 * Selector visual de método de pago. Ambos proveedores (Stripe y Wompi) usan
 * una simulación de transferencia en esta iteración (Decisión #83).
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { t } = useTranslation('checkout');

  return (
    <div className="bg-surface rounded-card border border-border shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2 text-primary-navy">
        <Landmark className="w-5 h-5 text-primary-indigo" />
        <h2 className="text-lg font-extrabold tracking-tight">{t('payment.title')}</h2>
      </div>
      <p className="text-sm text-muted-text">{t('payment.subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PAYMENT_PROVIDERS.map((provider) => {
          const isActive = provider.id === selected;
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelect(provider.id)}
              aria-pressed={isActive}
              className={`relative text-left rounded-card border p-4 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-primary-indigo ring-2 ring-primary-indigo/30 bg-soft-lavender/15'
                  : 'border-border hover:border-primary-indigo/40'
              }`}
            >
              <span className="block font-semibold text-primary-navy">{t(provider.labelKey)}</span>
              <span className="mt-1 block text-xs text-muted-text">
                {t('payment.transfer_note')}
              </span>
              {isActive && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-indigo">
                  <Check className="w-4 h-4" />
                  {t('payment.selected')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
