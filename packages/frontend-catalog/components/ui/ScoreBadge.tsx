import './ScoreBadge.css';

export type ScoreBadgeSize = 'small' | 'medium' | 'large';

export interface ScoreBadgeProps {
  /** Score value 0-100 */
  value: number;
  /** Optional label rendered below the value */
  label?: string;
  /** Visual size */
  size?: ScoreBadgeSize;
  /** Additional CSS class names */
  className?: string;
}

const SIZE_DIMENSIONS: Record<ScoreBadgeSize, { box: number; stroke: number; font: string }> = {
  small: { box: 48, stroke: 4, font: 'score-badge-font-small' },
  medium: { box: 72, stroke: 6, font: 'score-badge-font-medium' },
  large: { box: 104, stroke: 8, font: 'score-badge-font-large' },
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function toneFor(value: number): 'error' | 'warning' | 'info' | 'success' {
  if (value < 50) return 'error';
  if (value < 75) return 'warning';
  if (value < 90) return 'info';
  return 'success';
}

/**
 * ScoreBadge — circular score visualization for matching results.
 *
 * SVG ring with stroke-dasharray progress. Token-only colors that
 * shift across error, warning, info, and success based on the value.
 */
export function ScoreBadge({
  value,
  label,
  size = 'medium',
  className = '',
}: ScoreBadgeProps) {
  const safeValue = clamp(Math.round(value), 0, 100);
  const tone = toneFor(safeValue);
  const dims = SIZE_DIMENSIONS[size];

  const radius = (dims.box - dims.stroke) / 2;
  const center = dims.box / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeValue / 100) * circumference;

  const classes = [
    'score-badge',
    `score-badge-${size}`,
    `score-badge-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = label ? `${label}: ${safeValue} sur 100` : `Score ${safeValue} sur 100`;

  return (
    <div
      className={classes}
      role="meter"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <svg
        className="score-badge-svg"
        width={dims.box}
        height={dims.box}
        viewBox={`0 0 ${dims.box} ${dims.box}`}
        aria-hidden="true"
      >
        <circle
          className="score-badge-track"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={dims.stroke}
        />
        <circle
          className="score-badge-progress"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={dims.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className={`score-badge-content ${dims.font}`}>
        <span className="score-badge-value">{safeValue}</span>
        {label && <span className="score-badge-label">{label}</span>}
      </div>
    </div>
  );
}

export default ScoreBadge;
