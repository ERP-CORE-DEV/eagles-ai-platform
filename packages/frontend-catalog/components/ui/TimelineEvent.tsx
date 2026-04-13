import type { ReactNode } from 'react';
import './TimelineEvent.css';

export type TimelineEventTone = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface TimelineEventProps {
  /** Pre-formatted timestamp label (e.g. "12 mars 2026 — 14:32") */
  time: string;
  /** Event title — primary headline */
  title: string;
  /** Optional description / supporting body text */
  description?: string;
  /** Visual tone — colors the marker dot and connector */
  tone?: TimelineEventTone;
  /** Optional icon rendered inside the marker circle */
  icon?: ReactNode;
  /** When true, hides the trailing connector line (use on the final item) */
  isLast?: boolean;
}

/**
 * TimelineEvent — single event in a vertical timeline.
 *
 * Renders as a `<li>` with a circular marker, a vertical connector line,
 * and a content block. Wrap multiple events in a `<ol role="list">` to form
 * the full timeline. Token-only styling, light + dark.
 */
export function TimelineEvent({
  time,
  title,
  description,
  tone = 'default',
  icon,
  isLast = false,
}: TimelineEventProps) {
  const classes = [
    'timeline-event',
    `timeline-event-${tone}`,
    isLast ? 'timeline-event-last' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      <div className="timeline-event-marker-col" aria-hidden="true">
        <span className="timeline-event-marker">
          {icon && <span className="timeline-event-icon">{icon}</span>}
        </span>
        {!isLast && <span className="timeline-event-connector" />}
      </div>
      <div className="timeline-event-content">
        <time className="timeline-event-time">{time}</time>
        <p className="timeline-event-title">{title}</p>
        {description && <p className="timeline-event-description">{description}</p>}
      </div>
    </li>
  );
}

export default TimelineEvent;
