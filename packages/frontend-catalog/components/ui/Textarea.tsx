import { useEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import './Textarea.css';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Marks the textarea as invalid (sets aria-invalid + error border) */
  invalid?: boolean;
  /** Auto-grow height to fit content */
  autoResize?: boolean;
}

/**
 * Textarea — standalone multiline input.
 *
 * Has no built-in label. Consumers must provide either an `aria-label`
 * or wrap this component in a FormField. Forwards all native textarea props.
 */
export function Textarea({
  size = 'medium',
  invalid = false,
  autoResize = false,
  className = '',
  value,
  defaultValue,
  onChange,
  ...textareaProps
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!autoResize) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize, value, defaultValue]);

  const classes = [
    'textarea',
    `textarea-${size}`,
    invalid ? 'textarea-invalid' : '',
    autoResize ? 'textarea-auto-resize' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      ref={ref}
      className={classes}
      aria-invalid={invalid ? 'true' : undefined}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        if (autoResize && ref.current) {
          ref.current.style.height = 'auto';
          ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
        onChange?.(event);
      }}
      {...textareaProps}
    />
  );
}

export default Textarea;
