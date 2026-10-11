import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useErrorToast } from '@/hooks/useErrorToast';
import {
  useCheckout,
  useCustomerProfile,
  CheckoutSummary,
  DeliveryAddressForm,
  PaymentMethodSelector,
  CheckoutConfirmation,
  CheckoutEmptyCart,
} from '@/features/checkout';

export default function CheckoutPage() {
  const { t } = useTranslation('checkout');
  const user = useAuthStore((state) => state.user);
  const {
    items,
    subtotal,
    providerId,
    step,
    session,
    orderId,
    orderTotal,
    setProvider,
    reset,
    mutation,
  } = useCheckout();
  const { data: profile } = useCustomerProfile(user?.id ?? '');

  useErrorToast(mutation.isError, mutation.error, t('error.generic'));

  // Limpia el estado efímero del checkout al salir de la página.
  useEffect(() => () => reset(), [reset]);

  const shell = (children: React.ReactNode) => (
    <section className="py-12 md:py-16 bg-background min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );

  if (step === 'confirmation' && session && orderId) {
    return shell(
      <CheckoutConfirmation orderId={orderId} total={orderTotal ?? 0} session={session} />,
    );
  }

  if (items.length === 0) {
    return shell(<CheckoutEmptyCart />);
  }

  return shell(
    <>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-3 text-base text-muted-text">{t('subtitle')}</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CheckoutSummary items={items} subtotal={subtotal} />

        <div className="space-y-6">
          <PaymentMethodSelector selected={providerId} onSelect={setProvider} />
          <DeliveryAddressForm
            initialAddress={profile?.address}
            isSubmitting={mutation.isPending}
            onSubmit={(address) => mutation.mutate(address)}
          />
        </div>
      </div>
    </>,
  );
}
