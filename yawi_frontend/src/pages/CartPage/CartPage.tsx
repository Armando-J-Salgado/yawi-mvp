import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useCart, CartItemRow, CartSummary, CartEmptyState } from '@/features/cart';

export default function CartPage() {
  const { t } = useTranslation('cart');
  const { items, subtotal, increment, decrement, remove, clear } = useCart();

  return (
    <section className="py-12 md:py-16 bg-background min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-navy tracking-tight mb-8">
          {t('title')}
        </h1>

        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="bg-surface rounded-card border border-border shadow-card px-6 divide-y divide-border/70">
                {items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    onIncrement={increment}
                    onDecrement={decrement}
                    onRemove={remove}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <Link
                  to="/products"
                  className="text-sm font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
                >
                  {t('continue_shopping')}
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-medium text-muted-text hover:text-peach-accent transition-colors cursor-pointer"
                >
                  {t('clear')}
                </button>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-surface rounded-card border border-border shadow-card p-6 lg:sticky lg:top-24">
                <CartSummary subtotal={subtotal}>
                  <Button variant="primary" size="md" disabled className="w-full">
                    {t('checkout')}
                  </Button>
                  <p className="text-center text-xs text-muted-text">{t('checkout_coming_soon')}</p>
                </CartSummary>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
