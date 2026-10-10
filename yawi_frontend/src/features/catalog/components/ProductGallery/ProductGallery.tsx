import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export interface ProductGalleryProps {
  images: string[];
  productName: string;
  galleryTitle: string;
  noImagesMessage: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  galleryTitle,
  noImagesMessage,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      <h3 className="text-xl sm:text-2xl font-bold text-primary-navy tracking-tight">
        {galleryTitle}
      </h3>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-card bg-surface border border-border text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-border/60 flex items-center justify-center text-muted-text">
            <ImageIcon className="w-6 h-6 opacity-60" />
          </div>
          <p className="text-sm text-muted-text max-w-sm">{noImagesMessage}</p>
        </div>
      ) : (
        <>
          <div className="w-full h-80 sm:h-96 rounded-card overflow-hidden shadow-card bg-border/30">
            <ImagePlaceholder
              src={resolveImageUrl(images[selectedIndex] ?? images[0])}
              alt={`${productName} ${selectedIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((imgUrl, index) => (
                <button
                  key={`${imgUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`${productName} ${index + 1}`}
                  aria-pressed={selectedIndex === index}
                  className={`h-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedIndex === index
                      ? 'border-primary-indigo shadow-sm'
                      : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImagePlaceholder
                    src={resolveImageUrl(imgUrl)}
                    alt={`${productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
