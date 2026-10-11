import { describe, it, expect } from 'vitest';
import { stripeProvider } from './stripeProvider';

describe('stripeProvider', () => {
  it('exposes the stripe id and i18n label key', () => {
    expect(stripeProvider.id).toBe('stripe');
    expect(stripeProvider.labelKey).toBe('payment.stripe');
  });

  it('creates a pending transfer session referencing the order', async () => {
    const session = await stripeProvider.createPaymentSession({
      orderId: 'abcd1234-5678-90ab-cdef-1234567890ab',
      amount: 39,
    });

    expect(session.providerId).toBe('stripe');
    expect(session.status).toBe('pending_transfer');
    expect(session.instructions.reference).toBe('STRIPE-ABCD1234');
    expect(session.instructions.bank.length).toBeGreaterThan(0);
    expect(session.instructions.accountNumber.length).toBeGreaterThan(0);
  });
});
