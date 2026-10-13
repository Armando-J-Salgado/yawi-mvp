import { describe, it, expect, beforeEach } from 'vitest';
import { useCheckoutStore } from './checkoutStore';
import type { PaymentSession } from '../providers/types';

const initial = {
  providerId: 'stripe' as const,
  step: 'review' as const,
  session: null,
  orderId: null,
  orderTotal: null,
};

const session: PaymentSession = {
  providerId: 'wompi',
  status: 'pending_transfer',
  instructions: {
    beneficiary: 'Yawi Marketplace',
    bank: 'Banco Mock Wompi',
    accountNumber: '0000-0000-0000-0002',
    reference: 'WOMPI-ABCD1234',
  },
};

describe('checkoutStore', () => {
  beforeEach(() => {
    useCheckoutStore.setState(initial);
  });

  it('starts in review with stripe and no session/order', () => {
    const state = useCheckoutStore.getState();
    expect(state.providerId).toBe('stripe');
    expect(state.step).toBe('review');
    expect(state.session).toBeNull();
    expect(state.orderId).toBeNull();
    expect(state.orderTotal).toBeNull();
  });

  it('updates the selected provider', () => {
    useCheckoutStore.getState().setProvider('wompi');
    expect(useCheckoutStore.getState().providerId).toBe('wompi');
  });

  it('updates the current step', () => {
    useCheckoutStore.getState().setStep('confirmation');
    expect(useCheckoutStore.getState().step).toBe('confirmation');
  });

  it('stores the payment session', () => {
    useCheckoutStore.getState().setSession(session);
    expect(useCheckoutStore.getState().session?.instructions.reference).toBe('WOMPI-ABCD1234');
  });

  it('stores the created order id and total', () => {
    useCheckoutStore.getState().setOrder('o-001', 39);
    expect(useCheckoutStore.getState().orderId).toBe('o-001');
    expect(useCheckoutStore.getState().orderTotal).toBe(39);
  });

  it('resets to the initial state', () => {
    const store = useCheckoutStore.getState();
    store.setProvider('wompi');
    store.setStep('confirmation');
    store.setSession(session);
    store.setOrder('o-001', 39);

    useCheckoutStore.getState().reset();

    const state = useCheckoutStore.getState();
    expect(state).toMatchObject(initial);
  });
});
