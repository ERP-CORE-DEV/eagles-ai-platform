import type { SelectHTMLAttributes } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange' | 'value'> {
  /** Options to render */
  options: SelectOption[];
  /** Currently selected value (controlled) */
  value?: string;
  /** Change handler — receives the new value directly */
  onChange: (value: string) => void;
  /** Placeholder option label (renders a disabled empty option) */
  placeholder?: string;
  /** Marks the select as invalid (sets aria-invalid + error border) */
  invalid?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Required: stable id for label association */
  id: string;
  /** Required: form field name */
  name: string;
}

/**
 * Select — native <select> wrapper.
 *
 * Has no built-in label. Consumers must provide either an `aria-label`
 * or wrap the select in a FormField using the same `id`.
 */
export function Select({
  options,
  value,
  onChange,
  placeholder,
  invalid = false,
  size = 'medium',
  className = '',
  id,
  name,
  disabled,
  ...rest
}: SelectProps) {
  const classes = [
    'select',
    `select-${size}`,
    invalid ? 'select-invalid' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`select-wrapper select-wrapper-${size}`}>
      <select
        id={id}
        name={name}
        className={classes}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid ? 'true' : undefined}
        disabled={disabled}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="select-chevron" aria-hidden="true">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
          <path
            d="M5 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

export default Select;
