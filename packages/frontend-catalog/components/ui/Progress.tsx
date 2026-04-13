import './Progress.css';

export type ProgressSize = 'small' | 'medium' | 'large';
export type ProgressTone = 'default' | 'success' | 'warning' | 'error';

export interface ProgressProps {
  /** Current value, between 0 and `max`. */
  value: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Visual size — defaults to 'medium' */
  size?: ProgressSize;
  /** Visual tone — defaults to 'default' (action primary) */
  tone?: ProgressTone;
  /** Optional label rendered above the bar */
  label?: string;
  /** Show numeric percentage value next to the label */
  showValue?: boolean;
  /** Additional CSS class names */
  className?: string;
}

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  const ratio = (value / max) * 100;
  if (Number.isNaN(ratio)) return 0;
  if (ratio < 0) return 0;
  if (ratio > 100) return 100;
  return ratio;
}

/**
 * Progress — linear progress bar.
 *
 * Token-only styling, light + dark via data-theme="dark". Uses
 * `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`
 * for assistive technology.
 */
export function Progress({
  value,
  max = 100,
  size = 'medium',
  tone = 'default',
  label,
  showValue = false,
  className = '',
}: ProgressProps) {
  const percent = clampPercent(value, max);
  const percentLabel = `${Math.round(percent)}%`;

  const classes = [
    'progress',
    `progress-${size}`,
    `progress-tone-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const fillStyle = { '--progress-fill-width': `${percent}%` } as React.CSSProperties;

  return (
    <div className={classes}>
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{percentLabel}</span>}
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className="progress-fill" style={fillStyle} />
      </div>
    </div>
  );
}

export default Progress;
