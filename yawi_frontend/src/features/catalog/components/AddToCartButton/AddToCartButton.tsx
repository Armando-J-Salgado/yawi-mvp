import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button, showToast } from '@/components/ui';
import { useCart } from '@/features/cart';
import type { Product } from '@/types/product';

export interface AddToCartButtonProps {
  product: Product;
  label: string;
  addedMessage: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  label,
  addedMessage,
}) => {
  const { addToCart, openCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    showToast.success(addedMessage);
    openCart();
  };

  return (
    <Button variant="primary" size="lg" onClick={handleAdd} className="gap-2 w-full sm:w-auto">
      <ShoppingBag className="w-5 h-5" />
      <span>{label}</span>
    </Button>
  );
};
