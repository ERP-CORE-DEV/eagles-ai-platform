import React from 'react';
import { Tag } from 'antd';

type StatusColor = 'default' | 'processing' | 'success' | 'error' | 'warning';

export const STATE_COLORS: Record<string, StatusColor> = {
  Draft: 'default',
  PendingReview: 'processing',
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
  Scheduled: 'processing',
  Cancelled: 'error',
  InProgress: 'processing',
} as const;

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
  /** Status key — maps to STATE_COLORS and FRENCH_LABELS */
  status: string;
  /** Badge size */
  size?: 'small' | 'default';
  /** Show status dot indicator */
  showDot?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * StatusBadge — displays a colored tag for 15 French HR statuses.
 *
 * Uses antd Tag with STATE_COLORS mapping and FRENCH_LABELS for i18n.
 * DAT Reference: [DAT 5.1] Status display components
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'default',
  showDot = true,
  className = '',
}) => {
  const color = STATE_COLORS[status] ?? 'default';
  const label = FRENCH_LABELS[status] ?? status;

  return (
    <Tag
      color={color}
      className={`status-badge ${className}`}
      style={{
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        borderRadius: '9999px',
        padding: size === 'small' ? '0 8px' : '2px 12px',
        fontWeight: 500,
        lineHeight: size === 'small' ? '20px' : '24px',
        margin: 0,
      }}
    >
      {showDot && <span style={{ marginRight: '6px', fontSize: '8px' }}>●</span>}
      {label}
    </Tag>
  );
};

export default StatusBadge;
