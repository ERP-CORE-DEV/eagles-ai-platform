import type { CSSProperties, ReactNode } from 'react';
import './ScrollArea.css';

export interface ScrollAreaProps {
  /** Maximum height before vertical scrolling — accepts any CSS length or number (px) */
  maxHeight?: string | number;
  /** Maximum width before horizontal scrolling — accepts any CSS length or number (px) */
  maxWidth?: string | number;
  /** Scrollable content */
  children: ReactNode;
  /** Additional CSS class names for the root element */
  className?: string;
}

function toCssLength(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

/**
 * ScrollArea — scrollable wrapper with optional max-height/max-width and
 * token-styled scrollbars.
 *
 * Token-only styling, light + dark via data-theme="dark". Uses CSS custom
 * properties (--scroll-area-max-height / --scroll-area-max-width) supplied
 * through a single-brace style object so the size is themable from the call
 * site without inline color or numeric literals in CSS.
 */
export function ScrollArea({
  maxHeight,
  maxWidth,
  children,
  className = '',
}: ScrollAreaProps) {
  const classes = ['scroll-area', className].filter(Boolean).join(' ');

  const cssVars: CSSProperties = {};
  const heightValue = toCssLength(maxHeight);
  const widthValue = toCssLength(maxWidth);
  if (heightValue) {
    (cssVars as Record<string, string>)['--scroll-area-max-height'] = heightValue;
  }
  if (widthValue) {
    (cssVars as Record<string, string>)['--scroll-area-max-width'] = widthValue;
  }

  return (
    <div className={classes} style={cssVars} tabIndex={0} role="region">
      {children}
    </div>
  );
}

export default ScrollArea;
