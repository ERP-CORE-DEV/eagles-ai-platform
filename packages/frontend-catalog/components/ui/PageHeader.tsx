import type { ReactNode } from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  /** Optional actions slot — typically buttons aligned to the right */
  actions?: ReactNode;
  /** Optional breadcrumb slot rendered above the title */
  breadcrumb?: ReactNode;
  /** Additional CSS class names for the root element */
  className?: string;
}

/**
 * PageHeader — title, subtitle, breadcrumb, and actions slot for top-of-page composition.
 *
 * Token-only styling, light + dark via data-theme="dark".
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  className = '',
}: PageHeaderProps) {
  const classes = ['page-header', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {breadcrumb && <div className="page-header-breadcrumb">{breadcrumb}</div>}
      <div className="page-header-row">
        <div className="page-header-text">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
