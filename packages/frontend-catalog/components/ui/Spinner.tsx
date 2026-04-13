import './Spinner.css';

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerProps {
  /** Visual size — defaults to 'medium' */
  size?: SpinnerSize;
  /** Accessible label exposed via aria-label. Defaults to 'Loading'. */
  label?: string;
}

/**
 * Spinner — loading indicator.
 *
 * Token-only styling, light + dark via data-theme="dark". Uses role="status"
 * with aria-label set from the label prop so assistive tech announces it.
 */
export function Spinner({ size = 'medium', label = 'Loading' }: SpinnerProps) {
  const classes = ['spinner', `spinner-${size}`].join(' ');

  return (
    <span className={classes} role="status" aria-label={label}>
      <svg className="spinner-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle
          className="spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
        />
        <circle
          className="spinner-head"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default Spinner;
