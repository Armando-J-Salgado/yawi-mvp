import type { PaymentProvider, PaymentSession } from './types';

/**
 * ⚠️ MOCK de Wompi.
 * NO hay red, tarjetas, tokens, webhooks ni credenciales. Simula una
 * transferencia bancaria usando datos placeholder.
 */
export const wompiProvider: PaymentProvider = {
  id: 'wompi',
  labelKey: 'payment.wompi',
  async createPaymentSession({ orderId }): Promise<PaymentSession> {
    return {
      providerId: 'wompi',
      status: 'pending_transfer',
      instructions: {
        beneficiary: 'Yawi Marketplace',
        bank: 'Banco Mock Wompi',
        accountNumber: '0000-0000-0000-0002',
        reference: `WOMPI-${orderId.slice(0, 8).toUpperCase()}`,
      },
    };
  },
};
