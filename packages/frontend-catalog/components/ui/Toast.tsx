import { useEffect } from 'react';
import './Toast.css';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  /** Toast title — primary message */
  title: string;
  /** Optional description — supporting text below the title */
  description?: string;
  /** Visual tone — defaults to 'info' */
  tone?: ToastTone;
  /** Called when the close button is clicked or the auto-dismiss timer fires */
  onClose?: () => void;
  /** Auto-dismiss duration in ms. 0 disables auto-dismiss. Defaults to 5000. */
  duration?: number;
}

/**
 * Toast — transient notification.
 *
 * Token-only styling, light + dark via data-theme="dark". Auto-dismisses
 * after `duration` ms (default 5000). Set `duration={0}` to disable.
 */
export function Toast({
  title,
  description,
  tone = 'info',
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0 || !onClose) {
      return undefined;
    }
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const classes = ['toast', `toast-${tone}`].join(' ');

  return (
    <div className={classes} role="status" aria-live="polite">
      <div className="toast-body">
        <p className="toast-title">{title}</p>
        {description && <p className="toast-description">{description}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <svg
            className="toast-close-icon"
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

export default Toast;
