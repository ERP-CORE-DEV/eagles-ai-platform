import { useId, useState } from 'react';
import './DatePicker.css';

export interface DatePickerProps {
  /** Selected date as ISO yyyy-mm-dd (controlled) */
  value?: string;
  /** Initial date (uncontrolled) */
  defaultValue?: string;
  /** Change handler — receives the new ISO date string */
  onChange?: (value: string) => void;
  /** Minimum selectable date (ISO yyyy-mm-dd) */
  min?: string;
  /** Maximum selectable date (ISO yyyy-mm-dd) */
  max?: string;
  /** Field label rendered above the input */
  label?: string;
  /** Error message — replaces hint and sets aria-invalid */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Stable id for label association (auto-generated when omitted) */
  id?: string;
  /** Optional accessible label when no visible label is provided */
  'aria-label'?: string;
}

/**
 * DatePicker — date selector built on the native HTML date input.
 *
 * Mirrors FormField label/error rendering. Works in controlled (value +
 * onChange) or uncontrolled (defaultValue) mode. Format is always ISO
 * yyyy-mm-dd as defined by the HTML date input spec.
 */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  min,
  max,
  label,
  error,
  disabled = false,
  required = false,
  id: providedId,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;

  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const rootClasses = [
    'date-picker',
    error ? 'date-picker-invalid' : '',
    disabled ? 'date-picker-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      {label && (
        <label className="date-picker-label" htmlFor={id}>
          {label}
          {required && (
            <span className="date-picker-required" aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
      )}
      <input
        id={id}
        type="date"
        className="date-picker-input"
        value={currentValue}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required || undefined}
        aria-label={label ? undefined : ariaLabel}
        onChange={(event) => handleChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="date-picker-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DatePicker;
