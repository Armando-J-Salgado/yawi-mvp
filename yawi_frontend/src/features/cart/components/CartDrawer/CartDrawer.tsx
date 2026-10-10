import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCart } from '../../hooks/useCart';
import { CartItemRow } from '../CartItemRow';
import { CartSummary } from '../CartSummary';
import { CartEmptyState } from '../CartEmptyState';

/**
 * Panel lateral del carrito, disponible en móvil y escritorio.
 * Se monta globalmente en `App.tsx` y se abre desde el Navbar (`openCart`).
 */
export const CartDrawer: React.FC = () => {
  const { t } = useTranslation('cart');
  const { items, subtotal, isOpen, closeCart, increment, decrement, remove, clear } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-primary-navy/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className={`fixed top-0 right-0 z-50 h-screen h-[100dvh] w-full sm:w-[420px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2 text-primary-navy">
            <ShoppingBag className="w-5 h-5 text-primary-indigo" />
            <h2 className="text-lg font-extrabold tracking-tight">{t('title')}</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label={t('close')}
            className="p-2 rounded-full text-primary-navy hover:bg-border/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <CartEmptyState onExplore={closeCart} />
          ) : (
            <div className="divide-y divide-border/70">
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
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border shrink-0 space-y-4">
            <CartSummary subtotal={subtotal}>
              <Button variant="primary" size="md" disabled className="w-full">
                {t('checkout')}
              </Button>
              <p className="text-center text-xs text-muted-text">{t('checkout_coming_soon')}</p>
              <Link
                to="/cart"
                onClick={closeCart}
                className="block text-center text-sm font-semibold text-primary-indigo hover:text-primary-navy transition-colors"
              >
                {t('view_full_cart')}
              </Link>
              <button
                type="button"
                onClick={clear}
                className="block w-full text-center text-xs font-medium text-muted-text hover:text-peach-accent transition-colors cursor-pointer"
              >
                {t('clear')}
              </button>
            </CartSummary>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};
