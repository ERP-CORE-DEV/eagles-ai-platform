import type { CSSProperties } from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  /** Shape variant — defaults to 'rect' */
  variant?: SkeletonVariant;
  /** Width — any valid CSS length (e.g. '100%', '120px'). Optional. */
  width?: string;
  /** Height — any valid CSS length (e.g. '16px', '4rem'). Optional. */
  height?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Skeleton — loading placeholder with shimmer animation.
 *
 * Token-only styling, light + dark via data-theme="dark". Width and height
 * are forwarded via CSS custom properties so the component never embeds
 * raw color values via inline style.
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const classes = ['skeleton', `skeleton-${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const sizeVars: CSSProperties = {};
  if (width) {
    (sizeVars as Record<string, string>)['--skeleton-width'] = width;
  }
  if (height) {
    (sizeVars as Record<string, string>)['--skeleton-height'] = height;
  }

  return (
    <span className={classes} role="presentation" aria-hidden="true" style={sizeVars} />
  );
}

export default Skeleton;
