'use client';

import { ReactNode } from 'react';

interface AccessibleFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  title: string;
  description?: string;
  error?: string | null;
  loading?: boolean;
}

/**
 * Accessible form component with proper ARIA labels, error handling, and focus management.
 */
export default function AccessibleForm({
  onSubmit,
  children,
  title,
  description,
  error,
  loading,
}: AccessibleFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      aria-label={title}
      role="form"
      className="space-y-4"
      noValidate
    >
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      {description && <p className="text-gray-600 mb-4">{description}</p>}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {error}
        </div>
      )}

      {children}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
}

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

/**
 * Accessible input component with proper labels and error states.
 */
export function AccessibleInput({
  label,
  error,
  required,
  id,
  ...props
}: AccessibleInputProps) {
  const inputId = id || `input-${label}`;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block font-semibold mb-2">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={inputId}
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {error && (
        <p id={`${inputId}-error`} className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
