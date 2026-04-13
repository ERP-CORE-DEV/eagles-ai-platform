import { useId } from 'react';
import type { ReactNode } from 'react';
import './Card.css';

export type CardPadding = 'none' | 'small' | 'default' | 'large';

export interface CardProps {
  /** Optional title rendered in the card header */
  title?: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  /** Optional actions slot — typically buttons aligned to the right of the header */
  actions?: ReactNode;
  /** Optional footer slot rendered below the body */
  footer?: ReactNode;
  /** Internal padding scale applied to header, body, and footer */
  padding?: CardPadding;
  /** Whether the card renders a border (default true) */
  bordered?: boolean;
  /** Card body content */
  children: ReactNode;
  /** Additional CSS class names for the root element */
  className?: string;
}

/**
 * Card — surface container with optional header (title + subtitle + actions),
 * body, and optional footer.
 *
 * Token-only styling, light + dark via data-theme="dark". When a title is
 * provided the card is wired with aria-labelledby.
 */
export function Card({
  title,
  subtitle,
  actions,
  footer,
  padding = 'default',
  bordered = true,
  children,
  className = '',
}: CardProps) {
  const titleId = useId();
  const hasHeader = Boolean(title || subtitle || actions);

  const classes = [
    'card',
    `card-padding-${padding}`,
    bordered ? 'card-bordered' : 'card-borderless',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={classes}
      aria-labelledby={title ? titleId : undefined}
    >
      {hasHeader && (
        <header className="card-header">
          <div className="card-header-text">
            {title && (
              <h3 id={titleId} className="card-title">
                {title}
              </h3>
            )}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  );
}

export default Card;
