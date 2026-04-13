import type { ReactNode } from 'react';
import './Tag.css';

export type TagTone = 'default' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type TagSize = 'small' | 'default';

export interface TagProps {
  /** Tag label content */
  children: ReactNode;
  /** Visual tone */
  tone?: TagTone;
  /** Size variant */
  size?: TagSize;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Tag — small non-interactive label pill.
 *
 * Token-only styling, light + dark via data-theme="dark".
 */
export function Tag({ children, tone = 'default', size = 'default', className = '' }: TagProps) {
  const classes = ['tag', `tag-${tone}`, `tag-${size}`, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}

export default Tag;
