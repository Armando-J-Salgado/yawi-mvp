import React from 'react';
import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '@/types/order';

/** Tono visual por estado (solo tokens del design system; sin hex). */
const toneByStatus: Record<OrderStatus, string> = {
  pending: 'bg-peach-accent/20 text-primary-navy',
  confirmed: 'bg-primary-indigo/15 text-primary-navy',
  preparing: 'bg-soft-lavender/40 text-primary-navy',
  delivered: 'bg-primary-navy text-white',
  cancelled: 'bg-muted-text/20 text-muted-text',
};

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useTranslation('orders');

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${toneByStatus[status]} ${className}`}
    >
      {t(`status.${status}`)}
    </span>
  );
};
