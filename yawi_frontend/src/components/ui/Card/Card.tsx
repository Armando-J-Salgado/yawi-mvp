import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  const hoverStyles = hoverable
    ? 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer transition-all duration-300'
    : 'transition-shadow duration-200';

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-card border border-border p-6 shadow-card ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};
