import { describe, it, expect } from 'vitest';
import { PAYMENT_PROVIDERS, getPaymentProvider } from './paymentProviders';
import type { PaymentProviderId } from './types';

describe('paymentProviders registry', () => {
  it('registers exactly stripe and wompi', () => {
    expect(PAYMENT_PROVIDERS).toHaveLength(2);
    expect(PAYMENT_PROVIDERS.map((p) => p.id)).toEqual(['stripe', 'wompi']);
  });

  it('returns the provider matching the id', () => {
    expect(getPaymentProvider('wompi').id).toBe('wompi');
    expect(getPaymentProvider('stripe').id).toBe('stripe');
  });

  it('throws for an unknown provider id', () => {
    expect(() => getPaymentProvider('paypal' as PaymentProviderId)).toThrow(
      'Unknown payment provider: paypal',
    );
  });
});
