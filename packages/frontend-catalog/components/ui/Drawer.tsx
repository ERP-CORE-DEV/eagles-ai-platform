import { useId } from 'react';
import type { ReactNode } from 'react';
import './Drawer.css';

export type DrawerWidth = 'sm' | 'md' | 'lg';

export interface DrawerProps {
  /** Whether the drawer is currently open and rendered */
  open: boolean;
  /** Callback fired when the user requests close (backdrop click or close button) */
  onClose: () => void;
  /** Optional title rendered in the drawer header */
  title?: string;
  /** Drawer body content */
  children: ReactNode;
  /** Width variant — controls the drawer panel size */
  width?: DrawerWidth;
  /** Additional CSS class names for the drawer panel */
  className?: string;
}

/**
 * Drawer — side sheet that slides in from the right.
 *
 * Renders only when `open` is true. Uses fixed positioning with a backdrop —
 * no portal. Sets role="dialog" and aria-modal="true". Token-only styling,
 * light + dark via data-theme="dark".
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 'md',
  className = '',
}: DrawerProps) {
  const titleId = useId();

  if (!open) {
    return null;
  }

  const classes = ['drawer-panel', `drawer-panel-${width}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <header className="drawer-header">
            <h2 id={titleId} className="drawer-title">
              {title}
            </h2>
            <button
              type="button"
              className="drawer-close"
              aria-label="Close drawer"
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
        )}
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;
