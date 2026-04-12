import React from 'react';
import './Button.css';

export interface ButtonProps {
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Visual variant — maps to design token color families */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  /** Button size — small/medium/large */
  size?: 'small' | 'medium' | 'large';
  /** Shows loading spinner and disables interaction */
  loading?: boolean;
  /** Disables the button */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button component with multiple variants and loading states.
 *
 * Uses RH-OptimERP design tokens (violet primary).
 * DAT Reference: [DAT 5.1] Interactive UI components
 */
const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const buttonClass = [
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
      className={buttonClass}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'btn-text-loading' : 'btn-text'}>
        {children}
      </span>
    </button>
  );
};

export default Button;
