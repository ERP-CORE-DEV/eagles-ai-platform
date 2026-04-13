import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Visual variant — maps to design token color families */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Shows loading spinner and disables interaction */
  loading?: boolean;
  /** Button content */
  children: ReactNode;
}

/**
 * Button — interactive gold reference. Token-only, light + dark.
 *
 * All colors resolved via var(--component-button-*) and var(--system-status-*).
 */
export function Button({
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg className="btn-spinner-svg" viewBox="0 0 24 24">
            <circle
              className="btn-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'btn-text-loading' : 'btn-text'}>{children}</span>
    </button>
  );
}

export default Button;
