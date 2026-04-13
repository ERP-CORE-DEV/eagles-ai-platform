import { useEffect, useId, useRef, useState } from 'react';
import './MultiSelect.css';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  /** Available options */
  options: MultiSelectOption[];
  /** Currently selected values (controlled) */
  value: string[];
  /** Change handler — receives the next array of selected values */
  onChange: (next: string[]) => void;
  /** Visible label rendered above the trigger */
  label: string;
  /** Placeholder shown when no options are selected */
  placeholder?: string;
  /** Marks the field as invalid */
  invalid?: boolean;
}

/**
 * MultiSelect — checkbox list presented as a dropdown.
 *
 * Trigger button uses aria-haspopup="listbox" + aria-expanded.
 * Panel uses role="listbox" with role="option" items and aria-selected.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select…',
  invalid = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const listboxId = `${reactId}-listbox`;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((existing) => existing !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedCount = value.length;
  const triggerLabel =
    selectedCount === 0
      ? placeholder
      : selectedCount === 1
        ? (options.find((option) => option.value === value[0])?.label ?? `${selectedCount} selected`)
        : `${selectedCount} selected`;

  const triggerClasses = [
    'multi-select-trigger',
    invalid ? 'multi-select-trigger-invalid' : '',
    selectedCount === 0 ? 'multi-select-trigger-placeholder' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="multi-select" ref={containerRef}>
      <span id={labelId} className="multi-select-label">
        {label}
      </span>
      <button
        type="button"
        className={triggerClasses}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-invalid={invalid ? 'true' : undefined}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="multi-select-trigger-text">{triggerLabel}</span>
        <span className="multi-select-trigger-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          id={listboxId}
          className="multi-select-panel"
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={labelId}
        >
          {options.map((option) => {
            const selected = value.includes(option.value);
            const optionId = `${listboxId}-${option.value}`;
            return (
              <li
                key={option.value}
                id={optionId}
                role="option"
                aria-selected={selected}
                className="multi-select-option"
              >
                <label className="multi-select-option-label" htmlFor={`${optionId}-cb`}>
                  <input
                    id={`${optionId}-cb`}
                    type="checkbox"
                    className="multi-select-option-checkbox"
                    checked={selected}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span className="multi-select-option-text">{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MultiSelect;
