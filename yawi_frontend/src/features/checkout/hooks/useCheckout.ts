import { useMutation } from '@tanstack/react-query';
import { useCart } from '@/features/cart';
import { useAuthStore } from '@/store/authStore';
import { buildOrderPayload, submitOrder } from '@/services/order.service';
import { getPaymentProvider } from '../providers/paymentProviders';
import { useCheckoutStore } from '../store/checkoutStore';
import type { Order } from '@/types/order';
import type { PaymentSession } from '../providers/types';

export interface CheckoutResult {
  order: Order;
  session: PaymentSession;
}

/**
 * Orquesta el checkout: construye el payload desde el carrito, crea la orden
 * (`POST /orders`) e inicia la sesión de pago mock del proveedor seleccionado.
 * En éxito vacía el carrito y avanza al paso de confirmación (Decisión #88).
 *
 * La lógica pura vive en `services/order.service` y `providers/`; este hook solo
 * compone estado y conecta la mutación (Decisión #85).
 */
export function useCheckout() {
  const { items, subtotal, clear } = useCart();
  const user = useAuthStore((state) => state.user);
  const providerId = useCheckoutStore((state) => state.providerId);
  const step = useCheckoutStore((state) => state.step);
  const session = useCheckoutStore((state) => state.session);
  const orderId = useCheckoutStore((state) => state.orderId);
  const orderTotal = useCheckoutStore((state) => state.orderTotal);
  const setProvider = useCheckoutStore((state) => state.setProvider);
  const setStep = useCheckoutStore((state) => state.setStep);
  const setSession = useCheckoutStore((state) => state.setSession);
  const setOrder = useCheckoutStore((state) => state.setOrder);
  const reset = useCheckoutStore((state) => state.reset);

  const mutation = useMutation<CheckoutResult, Error, string>({
    mutationFn: async (deliveryAddress: string) => {
      if (!user) throw new Error('Not authenticated');
      const order = await submitOrder(buildOrderPayload(user.id, deliveryAddress, items));
      const paymentSession = await getPaymentProvider(providerId).createPaymentSession({
        orderId: order.id,
        amount: order.total,
      });
      return { order, session: paymentSession };
    },
    onSuccess: ({ order, session: paymentSession }) => {
      setSession(paymentSession);
      setOrder(order.id, order.total);
      clear();
      setStep('confirmation');
    },
  });

  return {
    items,
    subtotal,
    providerId,
    step,
    session,
    orderId,
    orderTotal,
    setProvider,
    reset,
    mutation,
  };
}
