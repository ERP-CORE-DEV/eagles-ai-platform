import { useId, useState } from 'react';
import './Switch.css';

export interface SwitchProps {
  /** Checked state (controlled) */
  checked?: boolean;
  /** Initial checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler — receives the next boolean state */
  onChange?: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Visible label rendered next to the switch */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Stable id for label association (auto-generated when omitted) */
  id?: string;
  /** Optional accessible label when no visible label is provided */
  'aria-label'?: string;
}

/**
 * Switch — toggle switch with custom track + thumb styling.
 *
 * Renders a real native checkbox input with role="switch" for accessibility.
 * Supports controlled (checked + onChange) and uncontrolled (defaultChecked)
 * usage. Provide either `label` or `aria-label`.
 */
export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  label,
  size = 'medium',
  id: providedId,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleChange = (next: boolean) => {
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  const wrapperClasses = [
    'switch',
    `switch-${size}`,
    currentChecked ? 'switch-checked' : '',
    disabled ? 'switch-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClasses}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="switch-input"
        checked={currentChecked}
        disabled={disabled}
        aria-label={label ? undefined : ariaLabel}
        aria-checked={currentChecked}
        onChange={(event) => handleChange(event.target.checked)}
      />
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      {label && (
        <label htmlFor={id} className="switch-label">
          {label}
        </label>
      )}
    </span>
  );
}

export default Switch;
