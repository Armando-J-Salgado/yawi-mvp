import { stripeProvider } from './stripeProvider';
import { wompiProvider } from './wompiProvider';
import type { PaymentProvider, PaymentProviderId } from './types';

/** Adaptadores disponibles en el MVP (ambos MOCK de transferencia). */
export const PAYMENT_PROVIDERS: PaymentProvider[] = [stripeProvider, wompiProvider];

/** Devuelve el proveedor por id. Lanza si el id no existe (contrato defensivo). */
export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  const provider = PAYMENT_PROVIDERS.find((candidate) => candidate.id === id);
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}
