import { Fragment } from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  /** Visible label */
  label: string;
  /** Optional href — if omitted and not last, item is rendered as plain text */
  href?: string;
  /** Optional click handler — used when href is not present */
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb items. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Separator character between items */
  separator?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Breadcrumb — navigation chain showing the user's location in a hierarchy.
 *
 * The last item is rendered as the current page (aria-current="page", not a link).
 * All preceding items are links if href is provided.
 */
export function Breadcrumb({
  items,
  separator = '/',
  className = '',
}: BreadcrumbProps) {
  const classes = ['breadcrumb', className].filter(Boolean).join(' ');

  return (
    <nav aria-label="Breadcrumb" className={classes}>
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${index}`;

          return (
            <Fragment key={key}>
              <li className="breadcrumb-item">
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a className="breadcrumb-link" href={item.href}>
                    {item.label}
                  </a>
                ) : item.onClick ? (
                  <button
                    type="button"
                    className="breadcrumb-link breadcrumb-link-button"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="breadcrumb-text">{item.label}</span>
                )}
              </li>
              {!isLast && (
                <li
                  className="breadcrumb-separator"
                  aria-hidden="true"
                  role="presentation"
                >
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
