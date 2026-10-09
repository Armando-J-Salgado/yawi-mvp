import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui';

export interface BusinessGalleryProps {
  images: string[];
  businessName: string;
  galleryTitle: string;
  noImagesMessage: string;
}

export const BusinessGallery: React.FC<BusinessGalleryProps> = ({
  images,
  businessName,
  galleryTitle,
  noImagesMessage,
}) => {
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
      ) : images.length === 1 ? (
        <div className="w-full h-80 sm:h-96 rounded-card overflow-hidden shadow-card">
          <ImagePlaceholder
            src={images[0]}
            alt={`${businessName} 1`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className="h-48 sm:h-56 rounded-card overflow-hidden shadow-card bg-border/30"
            >
              <ImagePlaceholder
                src={imgUrl}
                alt={`${businessName} ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
