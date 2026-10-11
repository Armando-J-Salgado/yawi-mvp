import { describe, it, expect } from 'vitest';
import { wompiProvider } from './wompiProvider';

describe('wompiProvider', () => {
  it('exposes the wompi id and i18n label key', () => {
    expect(wompiProvider.id).toBe('wompi');
    expect(wompiProvider.labelKey).toBe('payment.wompi');
  });

  it('creates a pending transfer session referencing the order', async () => {
    const session = await wompiProvider.createPaymentSession({
      orderId: 'abcd1234-5678-90ab-cdef-1234567890ab',
      amount: 39,
    });

    expect(session.providerId).toBe('wompi');
    expect(session.status).toBe('pending_transfer');
    expect(session.instructions.reference).toBe('WOMPI-ABCD1234');
    expect(session.instructions.bank.length).toBeGreaterThan(0);
    expect(session.instructions.accountNumber.length).toBeGreaterThan(0);
  });
});
