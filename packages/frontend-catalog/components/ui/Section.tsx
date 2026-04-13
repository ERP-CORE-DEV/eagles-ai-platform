import { useId } from 'react';
import type { ReactNode } from 'react';
import './Section.css';

export interface SectionProps {
  /** Section title — rendered as the heading */
  title: string;
  /** Optional kicker text rendered above the title (e.g., category) */
  kicker?: string;
  /** Optional description rendered below the title */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Whether the content area has internal padding (default true) */
  padded?: boolean;
  /** Additional CSS class names for the root element */
  className?: string;
}

/**
 * Section — labeled content section with kicker, title, description, and body.
 *
 * Provides semantic <section> grouping with accessible labelled-by wiring.
 * Token-only styling, light + dark via data-theme="dark".
 */
export function Section({
  title,
  kicker,
  description,
  children,
  padded = true,
  className = '',
}: SectionProps) {
  const headingId = useId();

  const classes = [
    'section',
    padded ? 'section-padded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} aria-labelledby={headingId}>
      <header className="section-header">
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h2 id={headingId} className="section-title">
          {title}
        </h2>
        {description && <p className="section-description">{description}</p>}
      </header>
      <div className="section-body">{children}</div>
    </section>
  );
}

export default Section;
