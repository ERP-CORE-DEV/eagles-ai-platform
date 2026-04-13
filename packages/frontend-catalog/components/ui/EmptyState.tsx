import type { ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  /** Optional icon or illustration rendered above the title */
  icon?: ReactNode;
  /** Title — required, conveys the empty condition */
  title: string;
  /** Optional secondary text explaining the state */
  description?: string;
  /** Optional action node — typically a Button */
  action?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * EmptyState — zero-state placeholder with icon, title, description, and action.
 *
 * Token-only styling, light + dark via data-theme="dark". Centered layout for
 * use inside cards, panels, or full-page empty regions.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const classes = ['empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
