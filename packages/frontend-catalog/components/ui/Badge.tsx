import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  /** Numeric count to display. Ignored when `dot` is true. */
  count?: number;
  /** Maximum count before showing "{max}+". Defaults to 99. */
  max?: number;
  /** Render a small dot instead of a count. */
  dot?: boolean;
  /** Visual tone */
  tone?: BadgeTone;
  /** Optional anchor child — badge is overlaid on its top-right corner. */
  children?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

const DEFAULT_MAX = 99;

function formatCount(count: number, max: number): string {
  if (count > max) return `${max}+`;
  return String(count);
}

/**
 * Badge — generic numeric/count overlay (distinct from StatusBadge for HR statuses).
 *
 * Token-only styling, light + dark via data-theme="dark". Used standalone as an
 * inline pill, or wrapping a child to anchor the badge to its top-right corner.
 */
export function Badge({
  count,
  max = DEFAULT_MAX,
  dot = false,
  tone = 'default',
  children,
  className = '',
}: BadgeProps) {
  const hasAnchor = children !== undefined && children !== null;
  const showBadge = dot || (typeof count === 'number' && count > 0);

  const indicatorClasses = [
    'badge-indicator',
    `badge-tone-${tone}`,
    dot ? 'badge-dot' : 'badge-count',
    hasAnchor ? 'badge-anchored' : 'badge-inline',
  ].join(' ');

  const label = dot
    ? 'Notification'
    : typeof count === 'number'
      ? `${count} notifications`
      : 'Badge';

  if (hasAnchor) {
    const wrapperClasses = ['badge-wrapper', className].filter(Boolean).join(' ');
    return (
      <span className={wrapperClasses}>
        {children}
        {showBadge && (
          <span className={indicatorClasses} role="status" aria-label={label}>
            {!dot && typeof count === 'number' && (
              <span className="badge-text">{formatCount(count, max)}</span>
            )}
          </span>
        )}
      </span>
    );
  }

  if (!showBadge) return null;

  const standaloneClasses = [indicatorClasses, className].filter(Boolean).join(' ');
  return (
    <span className={standaloneClasses} role="status" aria-label={label}>
      {!dot && typeof count === 'number' && (
        <span className="badge-text">{formatCount(count, max)}</span>
      )}
    </span>
  );
}

export default Badge;
