import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ElementType;
    bgClass: string;
    borderClass: string;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    iconClass: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    iconClass: 'text-red-600',
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    iconClass: 'text-blue-600',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-card
        max-w-sm w-full pointer-events-auto
        transition-all duration-300 ease-out
        ${config.bgClass} ${config.borderClass}
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.iconClass}`} />
      <p className="text-sm text-primary-text flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="p-1 rounded-full hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-text" />
      </button>
    </div>
  );
};
