import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  as = 'button',
  href,
  target,
  rel,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-button transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo focus-visible:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-primary-navy text-white hover:bg-primary-indigo active:brightness-95 disabled:bg-muted-text/40 shadow-sm',
    secondary:
      'bg-transparent text-primary-navy border border-primary-navy hover:bg-primary-navy/5 active:bg-primary-navy/10',
    ghost: 'bg-transparent text-primary-navy hover:bg-primary-navy/10 active:bg-primary-navy/15',
    cta: 'bg-peach-accent text-primary-navy hover:brightness-95 active:brightness-90 shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-7 py-3.5 text-base',
    lg: 'px-9 py-4 text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : '';

  const classes =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`.trim();

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        target={target}
        rel={rel}
        aria-disabled={disabled}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
