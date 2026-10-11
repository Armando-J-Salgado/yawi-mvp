export type PaymentProviderId = 'stripe' | 'wompi';

/** Datos de transferencia simulados (placeholders, nunca credenciales reales). */
export interface TransferInstructions {
  beneficiary: string;
  bank: string;
  accountNumber: string;
  reference: string;
}

/** Resultado de iniciar un pago mock. Efímero; no se persiste (Decisión #83). */
export interface PaymentSession {
  providerId: PaymentProviderId;
  status: 'pending_transfer';
  instructions: TransferInstructions;
}

export interface CreatePaymentSessionInput {
  orderId: string;
  amount: number;
}

/**
 * Contrato de proveedor de pago.
 * En esta iteración ambas implementaciones son MOCK (transferencia bancaria).
 * Para la integración real futura, basta con reemplazar la implementación
 * manteniendo esta interfaz (sin tocar componentes ni páginas).
 */
export interface PaymentProvider {
  id: PaymentProviderId;
  /** Clave i18n del nombre visible (p. ej. `payment.stripe`). */
  labelKey: string;
  createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession>;
}
