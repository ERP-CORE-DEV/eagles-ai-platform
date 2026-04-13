import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './FormField.css';

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label — rendered above the input */
  label: string;
  /** Optional hint text below the input */
  hint?: string;
  /** Error message — replaces hint and sets aria-invalid */
  error?: string;
  /** Whether the field is required (adds visual indicator) */
  required?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Leading slot (icon, prefix) */
  leading?: ReactNode;
  /** Trailing slot (icon, suffix) */
  trailing?: ReactNode;
}

/**
 * FormField — composed input with label, hint, and error state.
 *
 * Gold reference for the composed-component pattern. Uses design tokens
 * exclusively (no hex, no rgb, no named colors). Light + dark via
 * data-theme attribute on the root element.
 */
export function FormField({
  label,
  hint,
  error,
  required = false,
  size = 'medium',
  leading,
  trailing,
  className = '',
  id: providedId,
  disabled,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const rootClasses = [
    'form-field',
    `form-field-${size}`,
    error ? 'form-field-invalid' : '',
    disabled ? 'form-field-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <label className="form-field-label" htmlFor={id}>
        {label}
        {required && (
          <span className="form-field-required" aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>

      <div className="form-field-control">
        {leading && <span className="form-field-leading">{leading}</span>}
        <input
          id={id}
          className="form-field-input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          disabled={disabled}
          {...inputProps}
        />
        {trailing && <span className="form-field-trailing">{trailing}</span>}
      </div>

      {error ? (
        <p id={errorId} className="form-field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="form-field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
