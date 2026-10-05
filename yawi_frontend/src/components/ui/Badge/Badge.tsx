import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-soft-lavender/30 text-primary-navy',
    accent: 'bg-peach-accent text-primary-navy',
    outline: 'bg-transparent border border-border text-muted-text',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
