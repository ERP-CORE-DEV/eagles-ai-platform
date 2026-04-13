import { cloneElement, isValidElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** Trigger element — must be a single React element that accepts aria-describedby */
  children: ReactNode;
  /** Placement relative to the trigger — defaults to 'top' */
  placement?: TooltipPlacement;
}

/**
 * Tooltip — hover/focus tooltip.
 *
 * Shows on :hover and :focus-within of a wrapper using pure CSS, so no
 * stateful JavaScript is required. Wires aria-describedby on the trigger
 * via useId so the tooltip text is announced by assistive tech.
 */
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const tooltipId = useId();

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': tooltipId,
      })
    : children;

  return (
    <span className="tooltip-wrapper">
      {child}
      <span
        id={tooltipId}
        role="tooltip"
        className={`tooltip tooltip-${placement}`}
      >
        {content}
      </span>
    </span>
  );
}

export default Tooltip;
