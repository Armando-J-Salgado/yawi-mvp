import React from 'react';
import { Quote } from 'lucide-react';
import { Card, ImagePlaceholder, Badge } from '../../../../components/ui';

export interface TestimonialCardProps {
  avatarSrc?: string;
  name: string;
  roleLabel: string;
  roleType: 'buyer' | 'artisan';
  subtitle?: string;
  quote: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  avatarSrc,
  name,
  roleLabel,
  roleType,
  subtitle,
  quote,
}) => {
  return (
    <Card
      hoverable
      className="flex flex-col justify-between p-8 bg-surface border border-border h-full shadow-card hover:shadow-card-hover"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Quote className="w-8 h-8 text-soft-lavender" />
          <Badge variant={roleType === 'artisan' ? 'accent' : 'default'}>
            {roleLabel}
          </Badge>
        </div>

        <p className="text-base sm:text-lg text-primary-navy/90 italic leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-4 pt-6 mt-6 border-t border-border">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-soft-lavender/30 shrink-0 border border-border">
          <ImagePlaceholder
            src={avatarSrc}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="truncate">
          <h4 className="text-base font-bold text-primary-navy truncate">
            {name}
          </h4>
          {subtitle && (
            <p className="text-xs text-muted-text truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
