import { create } from 'zustand';
import type { PaymentProviderId, PaymentSession } from '../providers/types';

export type CheckoutStep = 'review' | 'confirmation';

export interface CheckoutState {
  providerId: PaymentProviderId;
  step: CheckoutStep;
  session: PaymentSession | null;
  orderId: string | null;
  orderTotal: number | null;
  setProvider: (id: PaymentProviderId) => void;
  setStep: (step: CheckoutStep) => void;
  setSession: (session: PaymentSession | null) => void;
  setOrder: (orderId: string, orderTotal: number) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  providerId: 'stripe' as PaymentProviderId,
  step: 'review' as CheckoutStep,
  session: null as PaymentSession | null,
  orderId: null as string | null,
  orderTotal: null as number | null,
};

/**
 * Estado efímero del checkout. SIN `persist`: no sobrevive recargas (Decisión #84).
 * El carrito persiste aparte (`src/store/cartStore.ts`).
 */
export const useCheckoutStore = create<CheckoutState>()((set) => ({
  ...INITIAL_STATE,
  setProvider: (providerId) => set({ providerId }),
  setStep: (step) => set({ step }),
  setSession: (session) => set({ session }),
  setOrder: (orderId, orderTotal) => set({ orderId, orderTotal }),
  reset: () => set({ ...INITIAL_STATE }),
}));
