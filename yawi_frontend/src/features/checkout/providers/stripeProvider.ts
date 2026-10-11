import type { PaymentProvider, PaymentSession } from './types';

/**
 * ⚠️ MOCK de Stripe.
 * NO hay red, tarjetas, tokens, webhooks ni credenciales. Simula una
 * transferencia bancaria usando datos placeholder.
 */
export const stripeProvider: PaymentProvider = {
  id: 'stripe',
  labelKey: 'payment.stripe',
  async createPaymentSession({ orderId }): Promise<PaymentSession> {
    return {
      providerId: 'stripe',
      status: 'pending_transfer',
      instructions: {
        beneficiary: 'Yawi Marketplace',
        bank: 'Banco Mock Stripe',
        accountNumber: '0000-0000-0000-0001',
        reference: `STRIPE-${orderId.slice(0, 8).toUpperCase()}`,
      },
    };
  },
};
