import './Stat.css';

export type StatTrendDirection = 'up' | 'down' | 'flat';

export interface StatTrend {
  /** Direction of the trend */
  direction: StatTrendDirection;
  /** Display value, e.g. "+12.5%" */
  value: string;
}

export interface StatProps {
  /** Descriptive label rendered above the value */
  label: string;
  /** Big number / metric value */
  value: string | number;
  /** Optional trend delta indicator */
  trend?: StatTrend;
  /** Optional hint text rendered below */
  hint?: string;
  /** Additional CSS class names */
  className?: string;
}

const TREND_SYMBOL: Record<StatTrendDirection, string> = {
  up: '\u2191',
  down: '\u2193',
  flat: '\u2192',
};

/**
 * Stat — big number + label + optional trend delta.
 *
 * Token-only styling, light + dark via data-theme="dark".
 */
export function Stat({ label, value, trend, hint, className = '' }: StatProps) {
  const classes = ['stat', className].filter(Boolean).join(' ');
  const trendClass = trend ? `stat-trend stat-trend-${trend.direction}` : '';

  return (
    <div className={classes}>
      <div className="stat-label">{label}</div>
      <div className="stat-value-row">
        <div className="stat-value">{value}</div>
        {trend && (
          <span className={trendClass} aria-label={`Trend ${trend.direction} ${trend.value}`}>
            <span className="stat-trend-arrow" aria-hidden="true">
              {TREND_SYMBOL[trend.direction]}
            </span>
            <span className="stat-trend-value">{trend.value}</span>
          </span>
        )}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export default Stat;
