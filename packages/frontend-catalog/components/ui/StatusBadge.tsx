import './StatusBadge.css';

export type StatusTone = 'default' | 'info' | 'success' | 'warning' | 'error';

export const STATE_TONES: Record<string, StatusTone> = {
  Draft: 'default',
  PendingReview: 'info',
  Approved: 'success',
  Rejected: 'error',
  Published: 'success',
  Active: 'success',
  Paused: 'warning',
  Completed: 'default',
  Closed: 'default',
  Archived: 'default',
  Open: 'success',
  Expired: 'warning',
  Scheduled: 'info',
  Cancelled: 'error',
  InProgress: 'info',
};

export const FRENCH_LABELS: Record<string, string> = {
  Draft: 'Brouillon',
  PendingReview: 'En révision',
  Approved: 'Approuvé',
  Rejected: 'Rejeté',
  Published: 'Publié',
  Active: 'Actif',
  Paused: 'En pause',
  Completed: 'Terminé',
  Closed: 'Fermé',
  Archived: 'Archivé',
  Open: 'Ouvert',
  Expired: 'Expiré',
  Scheduled: 'Planifié',
  Cancelled: 'Annulé',
  InProgress: 'En cours',
};

export interface StatusBadgeProps {
  /** Status key — maps to STATE_TONES and FRENCH_LABELS */
  status: string;
  /** Badge size */
  size?: 'small' | 'default';
  /** Show status dot indicator */
  showDot?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * StatusBadge — display-component gold reference.
 *
 * Renders a colored tag for 15 French HR statuses. Token-only styling,
 * light + dark via data-theme="dark".
 */
export function StatusBadge({
  status,
  size = 'default',
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const tone = STATE_TONES[status] ?? 'default';
  const label = FRENCH_LABELS[status] ?? status;

  const classes = [
    'status-badge',
    `status-badge-${tone}`,
    `status-badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} role="status" aria-label={label}>
      {showDot && <span className="status-badge-dot" aria-hidden="true" />}
      <span className="status-badge-label">{label}</span>
    </span>
  );
}

export default StatusBadge;
