import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Skeleton, Button } from '@/components/ui';
import { OrderCard } from '../OrderCard';
import { OrdersEmptyState } from '../OrdersEmptyState';
import type { Order } from '@/types/order';

export interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, isLoading, isError, onRetry }) => {
  const { t } = useTranslation('orders');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} height="220px" className="w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface rounded-card border border-border shadow-card p-10 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-8 h-8 text-peach-accent" />
        <p className="text-muted-text">{t('list.error')}</p>
        <Button variant="secondary" size="md" onClick={onRetry}>
          {t('list.retry')}
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return <OrdersEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
