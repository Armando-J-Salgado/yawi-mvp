import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CalendarDays, Package, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { OrderStatusBadge } from '../OrderStatusBadge';
import type { Order } from '@/types/order';

export interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { t, i18n } = useTranslation('orders');

  return (
    <article className="bg-surface rounded-card border border-border shadow-card p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            {t('card.order')}
          </p>
          <p className="text-lg font-extrabold text-primary-navy tracking-tight">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-text">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-primary-indigo" />
          {new Date(order.createdAt).toLocaleDateString(i18n.language)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Package className="w-4 h-4 text-primary-indigo" />
          {t('card.items_count', { count: order.items.length })}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            {t('card.total')}
          </p>
          <p className="text-lg font-extrabold text-primary-navy">{formatCurrency(order.total)}</p>
        </div>
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
        >
          {t('card.view')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};
