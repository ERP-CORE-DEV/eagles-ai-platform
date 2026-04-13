import { useEffect, useId, useRef } from 'react';
import './Checkbox.css';

export interface CheckboxProps {
  /** Visible label rendered next to the checkbox */
  label: string;
  /** Whether the checkbox is checked (controlled) */
  checked: boolean;
  /** Change handler — receives the next boolean state */
  onChange: (next: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Indeterminate state (visual only — checked still drives value) */
  indeterminate?: boolean;
  /** Stable id for label association (auto-generated when omitted) */
  id?: string;
  /** Marks the checkbox as invalid */
  invalid?: boolean;
}

/**
 * Checkbox — single labelled checkbox.
 *
 * Always renders a real native checkbox input with a label htmlFor
 * association. Supports indeterminate (e.g. select-all rows).
 */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
  id: providedId,
  invalid = false,
}: CheckboxProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const wrapperClasses = [
    'checkbox',
    disabled ? 'checkbox-disabled' : '',
    invalid ? 'checkbox-invalid' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClasses}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid ? 'true' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id} className="checkbox-label">
        {label}
      </label>
    </span>
  );
}

export default Checkbox;
