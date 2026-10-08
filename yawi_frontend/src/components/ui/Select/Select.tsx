import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Label text */
  label?: string;
  /** Placeholder shown when no value selected */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Available options */
  options: SelectOption[];
  /** Error message (already translated) */
  error?: string;
  /** HTML name attribute */
  name?: string;
  /** HTML id attribute */
  id?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  name,
  id,
  disabled = false,
  className = '',
}) => {
  const selectId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-primary-text">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`
            w-full px-4 py-3 pr-10 rounded-2xl border bg-surface text-primary-text
            text-base font-normal leading-relaxed appearance-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-indigo/40 focus:border-primary-indigo
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!value ? 'text-muted-text/60' : ''}
            ${
              error
                ? 'border-red-400 ring-1 ring-red-400/30 focus:ring-red-400/40 focus:border-red-400'
                : 'border-border hover:border-primary-indigo/40'
            }
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
