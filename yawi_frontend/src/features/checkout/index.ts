// Hooks
export { useCheckout } from './hooks/useCheckout';
export { useCustomerProfile } from './hooks/useCustomerProfile';

// Componentes
export { CheckoutSummary } from './components/CheckoutSummary';
export { DeliveryAddressForm } from './components/DeliveryAddressForm';
export { PaymentMethodSelector } from './components/PaymentMethodSelector';
export { CheckoutConfirmation } from './components/CheckoutConfirmation';
export { CheckoutEmptyCart } from './components/CheckoutEmptyCart';

// Proveedores de pago (mock Stripe/Wompi)
export { PAYMENT_PROVIDERS, getPaymentProvider } from './providers/paymentProviders';

// Types
export type {
  PaymentProvider,
  PaymentProviderId,
  PaymentSession,
  TransferInstructions,
} from './types';
