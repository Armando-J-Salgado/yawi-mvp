import React from 'react';

export interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'default' | 'surface' | 'navy';
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = '',
  id,
  background = 'default',
}) => {
  const bgStyles = {
    default: 'bg-background text-primary-text',
    surface: 'bg-surface text-primary-text',
    navy: 'bg-primary-navy text-white',
  };

  return (
    <section
      id={id}
      className={`py-16 md:py-24 transition-colors duration-200 ${bgStyles[background]} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">{children}</div>
    </section>
  );
};
