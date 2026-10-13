import React from 'react';

export interface InputProps {
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Error message (already translated). Shows error state when present. */
  error?: string;
  /** HTML name attribute */
  name?: string;
  /** HTML id attribute */
  id?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  name,
  id,
  disabled = false,
  className = '',
  autoComplete,
}) => {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-primary-text">
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full px-4 py-3 rounded-2xl border bg-surface text-primary-text
          text-base font-normal leading-relaxed
          placeholder:text-muted-text/60
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-indigo/40 focus:border-primary-indigo
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-400 ring-1 ring-red-400/30 focus:ring-red-400/40 focus:border-red-400'
              : 'border-border hover:border-primary-indigo/40'
          }
        `}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
