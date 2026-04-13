import { useId } from 'react';
import type { ReactNode } from 'react';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  /** Whether the modal is currently open and rendered */
  open: boolean;
  /** Callback fired when the user requests close (backdrop click or close button) */
  onClose: () => void;
  /** Optional title rendered in the modal header */
  title?: string;
  /** Modal body content */
  children: ReactNode;
  /** Size variant — controls the modal dialog width */
  size?: ModalSize;
  /** Additional CSS class names for the dialog element */
  className?: string;
}

/**
 * Modal — centered dialog with backdrop.
 *
 * Renders only when `open` is true. Uses fixed positioning with a backdrop —
 * no portal. Sets role="dialog", aria-modal="true", and aria-labelledby on
 * the title. Token-only styling, light + dark via data-theme="dark".
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: ModalProps) {
  const titleId = useId();

  if (!open) {
    return null;
  }

  const classes = ['modal-dialog', `modal-dialog-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="modal-root">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <header className="modal-header">
            <h2 id={titleId} className="modal-title">
              {title}
            </h2>
            <button
              type="button"
              className="modal-close"
              aria-label="Close modal"
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
