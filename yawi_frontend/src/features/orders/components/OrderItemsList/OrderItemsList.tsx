import React from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { OrderItem } from '@/types/order';

export interface OrderItemsListProps {
  items: OrderItem[];
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({ items }) => {
  return (
    <ul className="divide-y divide-border/70">
      {items.map((item) => (
        <li key={item.id} className="py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-primary-navy truncate">{item.productName}</p>
            <p className="text-sm text-muted-text">
              {item.quantity} × {formatCurrency(item.unitPrice)}
            </p>
          </div>
          <span className="font-bold text-primary-navy shrink-0">
            {formatCurrency(item.subtotal)}
          </span>
        </li>
      ))}
    </ul>
  );
};
