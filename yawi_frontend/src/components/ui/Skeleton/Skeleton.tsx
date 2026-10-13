import React from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
}) => {
  const customStyles: React.CSSProperties = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
  };

  return (
    <div
      style={customStyles}
      className={`animate-pulse bg-border/80 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};
