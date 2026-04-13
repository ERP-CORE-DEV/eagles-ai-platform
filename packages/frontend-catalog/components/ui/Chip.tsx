import './Chip.css';

export type ChipTone = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface ChipProps {
  /** Chip label text */
  label: string;
  /** When provided, renders a remove button with aria-label="Remove {label}" */
  onRemove?: () => void;
  /** Visual tone */
  tone?: ChipTone;
  /** Disabled state — blocks interaction */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Chip — interactive pill with optional close button.
 *
 * Token-only styling, light + dark via data-theme="dark".
 */
export function Chip({
  label,
  onRemove,
  tone = 'default',
  disabled = false,
  className = '',
}: ChipProps) {
  const classes = [
    'chip',
    `chip-${tone}`,
    disabled ? 'chip-disabled' : '',
    onRemove ? 'chip-removable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleRemove = () => {
    if (!disabled && onRemove) onRemove();
  };

  return (
    <span className={classes}>
      <span className="chip-label">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="chip-remove"
          aria-label={`Remove ${label}`}
          onClick={handleRemove}
          disabled={disabled}
        >
          <svg
            className="chip-remove-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 4 L12 12 M12 4 L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Chip;
