import type { ReactNode } from 'react';
import { Stat, type StatTrend } from './Stat';
import './MetricCard.css';

export interface MetricCardProps {
  /** Card title — passed as Stat label */
  title: string;
  /** Metric value */
  value: string | number;
  /** Optional trend delta */
  delta?: StatTrend;
  /** Optional icon slot — rendered top-right */
  icon?: ReactNode;
  /** Optional footer — rendered below the stat */
  footer?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * MetricCard — card wrapper around a Stat with icon + footer slots.
 *
 * Token-only styling, light + dark via data-theme="dark".
 */
export function MetricCard({ title, value, delta, icon, footer, className = '' }: MetricCardProps) {
  const classes = ['metric-card', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="metric-card-header">
        <div className="metric-card-stat">
          <Stat label={title} value={value} trend={delta} />
        </div>
        {icon && (
          <span className="metric-card-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      {footer && <div className="metric-card-footer">{footer}</div>}
    </div>
  );
}

export default MetricCard;
