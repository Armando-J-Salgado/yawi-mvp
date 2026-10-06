import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '../Skeleton';

export interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  borderRadius,
  objectFit = 'cover',
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const containerStyle: React.CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(borderRadius !== undefined ? { borderRadius } : {}),
  };

  // If no source provided or error loading image
  if (!src || hasError) {
    return (
      <div
        style={containerStyle}
        className={`relative flex items-center justify-center bg-border/60 overflow-hidden ${className}`}
        role="img"
        aria-label={alt}
      >
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 flex flex-col items-center justify-center p-3 text-muted-text/70">
          <ImageIcon className="w-8 h-8 md:w-10 md:h-10 opacity-60" />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={`relative overflow-hidden ${className}`}>
      {!hasLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-border/60">
          <Skeleton className="w-full h-full" />
          <ImageIcon className="absolute z-20 w-8 h-8 text-muted-text/50 animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setHasLoaded(true)}
        onError={() => setHasError(true)}
        style={{ objectFit }}
        className={`w-full h-full transition-opacity duration-300 ${
          hasLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
