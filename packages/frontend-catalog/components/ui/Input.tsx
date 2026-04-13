import type { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Marks the input as invalid (sets aria-invalid + error border) */
  invalid?: boolean;
}

/**
 * Input — standalone text input.
 *
 * Has no built-in label. Consumers must provide either an `aria-label`
 * or wrap this component in a FormField (which renders the `<label htmlFor>`).
 * Forwards all native input props.
 */
export function Input({
  size = 'medium',
  invalid = false,
  className = '',
  type = 'text',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...inputProps
}: InputProps) {
  const classes = [
    'input',
    `input-${size}`,
    invalid ? 'input-invalid' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      id={id}
      type={type}
      className={classes}
      aria-invalid={invalid ? 'true' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      {...inputProps}
    />
  );
}

export default Input;
