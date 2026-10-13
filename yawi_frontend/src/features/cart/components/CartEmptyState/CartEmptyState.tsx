import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';

export interface CartEmptyStateProps {
  /** Acción adicional (p. ej. cerrar el drawer) antes de navegar al catálogo. */
  onExplore?: () => void;
}

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({ onExplore }) => {
  const { t } = useTranslation('cart');
  const navigate = useNavigate();

  const handleExplore = () => {
    onExplore?.();
    navigate('/products');
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-soft-lavender/30 flex items-center justify-center text-primary-navy">
        <ShoppingBag className="w-7 h-7" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-lg font-bold text-primary-navy">{t('empty_title')}</h3>
        <p className="text-sm text-muted-text">{t('empty_message')}</p>
      </div>
      <Button variant="primary" size="md" onClick={handleExplore}>
        {t('empty_cta')}
      </Button>
    </div>
  );
};
