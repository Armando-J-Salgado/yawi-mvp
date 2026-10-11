import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react';
import { Input, Button } from '@/components/ui';

export interface DeliveryAddressFormProps {
  /** Dirección sugerida (prefill desde el perfil del cliente). */
  initialAddress?: string;
  isSubmitting: boolean;
  onSubmit: (address: string) => void;
}

export const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({
  initialAddress = '',
  isSubmitting,
  onSubmit,
}) => {
  const { t } = useTranslation('checkout');
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState<string | undefined>(undefined);

  // Prefill cuando el perfil del cliente llega de forma asíncrona (solo si el
  // usuario no ha escrito todavía).
  useEffect(() => {
    setAddress((current) => (current.trim() === '' ? initialAddress : current));
  }, [initialAddress]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (address.trim() === '') {
      setError(t('delivery.required'));
      return;
    }
    setError(undefined);
    onSubmit(address.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-card border border-border shadow-card p-6 space-y-4"
    >
      <div className="flex items-center gap-2 text-primary-navy">
        <Truck className="w-5 h-5 text-primary-indigo" />
        <h2 className="text-lg font-extrabold tracking-tight">{t('delivery.title')}</h2>
      </div>

      <Input
        name="delivery_address"
        label={t('delivery.label')}
        placeholder={t('delivery.placeholder')}
        value={address}
        onChange={(value) => {
          setAddress(value);
          if (error) setError(undefined);
        }}
        error={error}
        autoComplete="street-address"
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
};
