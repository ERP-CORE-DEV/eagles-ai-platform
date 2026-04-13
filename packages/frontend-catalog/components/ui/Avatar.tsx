import './Avatar.css';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps {
  /** Full name — used for alt text and initials fallback */
  name: string;
  /** Optional image URL. When omitted or fails, initials are shown. */
  src?: string;
  /** Visual size — defaults to 'medium' */
  size?: AvatarSize;
  /** Optional presence indicator dot in the corner */
  status?: AvatarStatus;
  /** Shape — circle (default) or square with rounded corners */
  shape?: AvatarShape;
  /** Additional CSS class names */
  className?: string;
}

const STATUS_LABELS: Record<AvatarStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  away: 'Away',
};

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return (first + last).toUpperCase();
}

/**
 * Avatar — circular portrait with initials fallback.
 *
 * Token-only styling, light + dark via data-theme="dark". Auto-derives initials
 * from `name` when no `src` is provided. Optional status dot in the corner.
 */
export function Avatar({
  name,
  src,
  size = 'medium',
  status,
  shape = 'circle',
  className = '',
}: AvatarProps) {
  const classes = [
    'avatar',
    `avatar-${size}`,
    `avatar-${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const initials = deriveInitials(name);

  return (
    <span className={classes} role="img" aria-label={name}>
      {src ? (
        <img className="avatar-image" src={src} alt={name} />
      ) : (
        <span className="avatar-initials" aria-hidden="true">
          {initials}
        </span>
      )}
      {status && (
        <span
          className={`avatar-status avatar-status-${status}`}
          aria-label={STATUS_LABELS[status]}
        />
      )}
    </span>
  );
}

export default Avatar;
