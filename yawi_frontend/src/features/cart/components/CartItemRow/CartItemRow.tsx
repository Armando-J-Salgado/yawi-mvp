import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui';
import { formatCurrency } from '@/utils/formatCurrency';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import type { CartItem } from '@/types/cart';

export interface CartItemRowProps {
  item: CartItem;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const { t } = useTranslation('cart');

  return (
    <div className="flex gap-4 py-4">
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-border/40 shrink-0">
        <ImagePlaceholder
          src={resolveImageUrl(item.imageUrl)}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-primary-navy line-clamp-2">{item.name}</h4>
            <p className="text-xs text-muted-text mt-0.5">
              {t('unit_price')}: {formatCurrency(item.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            aria-label={`${t('remove')}: ${item.name}`}
            className="p-1.5 rounded-full text-muted-text hover:text-peach-accent hover:bg-peach-accent/10 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
            <button
              type="button"
              onClick={() => onDecrement(item.productId)}
              disabled={item.quantity <= 1}
              aria-label={t('decrease')}
              className="p-2 text-primary-navy hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span
              className="w-8 text-center text-sm font-bold text-primary-navy select-none"
              aria-label={t('quantity')}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item.productId)}
              aria-label={t('increase')}
              className="p-2 text-primary-navy hover:bg-border/50 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-sm font-extrabold text-primary-navy">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};
