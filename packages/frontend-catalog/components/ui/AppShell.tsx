import type { ReactNode } from 'react';
import './AppShell.css';

export interface AppShellProps {
  /** Optional sidebar slot — typically a navigation component */
  sidebar?: ReactNode;
  /** Optional header slot — typically a top bar with branding and actions */
  header?: ReactNode;
  /** Main content area children */
  children: ReactNode;
  /** Additional CSS class names for the root element */
  className?: string;
}

/**
 * AppShell — top-level page shell with sidebar, header, and main content slots.
 *
 * Provides the canonical layout grid for full application screens. Token-only
 * styling, light + dark via data-theme="dark".
 */
export function AppShell({ sidebar, header, children, className = '' }: AppShellProps) {
  const classes = [
    'app-shell',
    sidebar ? 'app-shell-with-sidebar' : '',
    header ? 'app-shell-with-header' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {sidebar && (
        <aside className="app-shell-sidebar" aria-label="Primary navigation">
          {sidebar}
        </aside>
      )}
      <div className="app-shell-body">
        {header && <header className="app-shell-header">{header}</header>}
        <main className="app-shell-main">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
