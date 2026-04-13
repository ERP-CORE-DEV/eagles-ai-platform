import { createContext, useContext, useId, useState } from 'react';
import type { ReactNode } from 'react';
import './Radio.css';

interface RadioGroupContextValue {
  name: string;
  value: string;
  onSelect: (next: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /** Form field name shared by all radios in the group */
  name: string;
  /** Currently selected value (controlled) */
  value?: string;
  /** Initial selected value (uncontrolled) */
  defaultValue?: string;
  /** Change handler — receives the newly selected value */
  onChange?: (value: string) => void;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Optional accessible label for the group */
  'aria-label'?: string;
  /** Optional id of an external element labelling the group */
  'aria-labelledby'?: string;
  /** Radio children */
  children: ReactNode;
}

/**
 * RadioGroup — wrapper that manages name + selected value for nested Radios.
 *
 * Supports controlled (value + onChange) and uncontrolled (defaultValue) usage.
 * Renders a `role="radiogroup"` container; consumers should pass an
 * `aria-label` or `aria-labelledby`.
 */
export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  orientation = 'vertical',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  children,
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleSelect = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  return (
    <RadioGroupContext.Provider
      value={{ name, value: currentValue, onSelect: handleSelect }}
    >
      <div
        className={`radio-group radio-group-${orientation}`}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps {
  /** Value submitted when this radio is selected */
  value: string;
  /** Visible label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
  /** Stable id for label association (auto-generated when omitted) */
  id?: string;
}

/**
 * Radio — single radio button. Must be rendered inside a RadioGroup.
 *
 * Renders a real native radio input with a label `htmlFor` association.
 * Selection state is read from the surrounding RadioGroup.
 */
export function Radio({ value, label, disabled = false, id: providedId }: RadioProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const ctx = useContext(RadioGroupContext);

  if (!ctx) {
    throw new Error('Radio must be rendered inside a RadioGroup');
  }

  const checked = ctx.value === value;
  const wrapperClasses = ['radio', disabled ? 'radio-disabled' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClasses}>
      <input
        id={id}
        type="radio"
        className="radio-input"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => ctx.onSelect(value)}
      />
      <label htmlFor={id} className="radio-label">
        {label}
      </label>
    </span>
  );
}

export default Radio;
