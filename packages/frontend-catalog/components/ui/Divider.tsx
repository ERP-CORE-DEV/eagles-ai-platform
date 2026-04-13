import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'small' | 'default' | 'large';

export interface DividerProps {
  /** Orientation — horizontal (default) or vertical */
  orientation?: DividerOrientation;
  /** Optional centered label rendered inline (horizontal only) */
  label?: string;
  /** Margin scale around the divider */
  spacing?: DividerSpacing;
  /** Additional CSS class names for the root element */
  className?: string;
}

/**
 * Divider — horizontal or vertical separator with optional centered label.
 *
 * Token-only styling, light + dark via data-theme="dark". When a label is
 * provided the root uses role="separator" with aria-orientation; otherwise
 * a semantic <hr> is rendered for horizontal mode.
 */
export function Divider({
  orientation = 'horizontal',
  label,
  spacing = 'default',
  className = '',
}: DividerProps) {
  const classes = [
    'divider',
    `divider-${orientation}`,
    `divider-spacing-${spacing}`,
    label ? 'divider-with-label' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (label && orientation === 'horizontal') {
    return (
      <div className={classes} role="separator" aria-orientation="horizontal">
        <span className="divider-line" aria-hidden="true" />
        <span className="divider-label">{label}</span>
        <span className="divider-line" aria-hidden="true" />
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <span
        className={classes}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return <hr className={classes} />;
}

export default Divider;
