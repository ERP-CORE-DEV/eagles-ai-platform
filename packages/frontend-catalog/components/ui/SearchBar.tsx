import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import './SearchBar.css';

export interface SearchBarProps {
  /** Controlled value — if provided, the component is controlled */
  value?: string;
  /** Initial value for the uncontrolled mode */
  defaultValue?: string;
  /** Called after the debounce window with the latest query */
  onSearch?: (query: string) => void;
  /** Called synchronously on every keystroke (no debounce) */
  onChange?: (query: string) => void;
  /** Placeholder text — defaults to French "Rechercher…" */
  placeholder?: string;
  /** Debounce window in milliseconds — defaults to 300 */
  debounceMs?: number;
  /** Disables the input and clear button */
  disabled?: boolean;
  /** Accessible label for the input — defaults to the placeholder */
  ariaLabel?: string;
}

/**
 * SearchBar — debounced search input with leading icon and clear button.
 *
 * Supports both controlled (`value`) and uncontrolled (`defaultValue`) modes.
 * `onSearch` is debounced via setTimeout inside useEffect; `onChange` fires
 * synchronously on every keystroke. The clear button only appears when the
 * value is non-empty. Token-only styling, light + dark.
 */
export function SearchBar({
  value,
  defaultValue = '',
  onSearch,
  onChange,
  placeholder = 'Rechercher…',
  debounceMs = 300,
  disabled = false,
  ariaLabel,
}: SearchBarProps) {
  const inputId = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const currentValue = isControlled ? (value ?? '') : internalValue;
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounced onSearch
  useEffect(() => {
    if (!onSearch) return undefined;
    const handle = setTimeout(() => {
      onSearch(currentValue);
    }, debounceMs);
    return () => {
      clearTimeout(handle);
    };
  }, [currentValue, debounceMs, onSearch]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      if (!isControlled) {
        setInternalValue(next);
      }
      if (onChange) {
        onChange(next);
      }
    },
    [isControlled, onChange]
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  }, [isControlled, onChange]);

  const showClear = currentValue.length > 0 && !disabled;

  return (
    <div className={`search-bar${disabled ? ' search-bar-disabled' : ''}`}>
      <span className="search-bar-icon" aria-hidden="true">
        <svg
          className="search-bar-icon-svg"
          viewBox="0 0 24 24"
          focusable="false"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 20 L16 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        className="search-bar-input"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
      />
      {showClear && (
        <button
          type="button"
          className="search-bar-clear"
          aria-label="Effacer la recherche"
          onClick={handleClear}
        >
          <svg
            className="search-bar-clear-icon"
            viewBox="0 0 24 24"
            focusable="false"
            aria-hidden="true"
          >
            <path
              d="M6 6 L18 18 M18 6 L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
