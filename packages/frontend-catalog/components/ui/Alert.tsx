import type { ReactNode } from 'react';
import './Alert.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Alert title — primary message */
  title: string;
  /** Optional description — supporting body text */
  description?: string;
  /** Visual tone — defaults to 'info' */
  tone?: AlertTone;
  /** Optional leading icon node */
  icon?: ReactNode;
  /** Called when the dismiss button is clicked. Omit to render a non-dismissable alert. */
  onDismiss?: () => void;
}

/**
 * Alert — inline persistent message.
 *
 * Uses role="alert" for warning/error tones (assertive) and role="status"
 * for info/success (polite). Token-only styling, light + dark.
 */
export function Alert({
  title,
  description,
  tone = 'info',
  icon,
  onDismiss,
}: AlertProps) {
  const isAssertive = tone === 'error' || tone === 'warning';
  const role = isAssertive ? 'alert' : 'status';
  const classes = ['alert', `alert-${tone}`].join(' ');

  return (
    <div className={classes} role={role}>
      {icon && (
        <span className="alert-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="alert-body">
        <p className="alert-title">{title}</p>
        {description && <p className="alert-description">{description}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <svg
            className="alert-dismiss-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6 6 L18 18 M18 6 L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Alert;
