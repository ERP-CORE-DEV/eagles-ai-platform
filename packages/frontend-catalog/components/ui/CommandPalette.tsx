import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import './CommandPalette.css';

export interface CommandPaletteCommand {
  /** Stable identifier */
  id: string;
  /** Visible command label */
  label: string;
  /** Optional inline hint (shortcut, category, etc.) */
  hint?: string;
  /** Optional group label used for visual section headers */
  group?: string;
  /** Handler invoked when the command is selected */
  onRun: () => void;
}

export interface CommandPaletteProps {
  /** Whether the palette is open and rendered */
  open: boolean;
  /** Called when the user requests close (Escape, backdrop, or after run) */
  onClose: () => void;
  /** Command list — filtered by case-insensitive substring match on label */
  commands: CommandPaletteCommand[];
  /** Input placeholder — defaults to French "Tapez une commande…" */
  placeholder?: string;
}

/**
 * CommandPalette — modal-style command launcher (Cmd+K UX).
 *
 * Filters commands by case-insensitive substring match on label. Keyboard:
 * ArrowDown/ArrowUp to navigate, Enter to run, Escape to close. Renders as
 * a centered overlay with role="dialog" aria-modal="true". Token-only
 * styling, light + dark.
 */
export function CommandPalette({
  open,
  onClose,
  commands,
  placeholder = 'Tapez une commande…',
}: CommandPaletteProps) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const [query, setQuery] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return commands;
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(needle));
  }, [commands, query]);

  // Reset state every time the palette opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Defer focus until after the input is mounted
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Clamp active index when the filtered list shrinks
  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(filtered.length > 0 ? filtered.length - 1 : 0);
    }
  }, [filtered, activeIndex]);

  // Scroll the active item into view
  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const runCommand = useCallback(
    (cmd: CommandPaletteCommand) => {
      cmd.onRun();
      onClose();
    },
    [onClose]
  );

  const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'Escape': {
          event.preventDefault();
          onClose();
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          if (filtered.length > 0) {
            setActiveIndex((prev) => (prev + 1) % filtered.length);
          }
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          if (filtered.length > 0) {
            setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
          }
          break;
        }
        case 'Enter': {
          event.preventDefault();
          const cmd = filtered[activeIndex];
          if (cmd) {
            runCommand(cmd);
          }
          break;
        }
        default:
          break;
      }
    },
    [filtered, activeIndex, runCommand, onClose]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="command-palette-root">
      <button
        type="button"
        className="command-palette-backdrop"
        aria-label="Fermer la palette de commandes"
        onClick={onClose}
      />
      <div
        className="command-palette-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
      >
        <div className="command-palette-input-row">
          <span className="command-palette-input-icon" aria-hidden="true">
            <svg
              className="command-palette-input-svg"
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
            type="text"
            className="command-palette-input"
            value={query}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-controls={listId}
            aria-activedescendant={
              filtered[activeIndex] ? `${baseId}-item-${filtered[activeIndex].id}` : undefined
            }
            autoComplete="off"
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="command-palette-empty">Aucun résultat</p>
        ) : (
          <ul id={listId} role="listbox" className="command-palette-list">
            {filtered.map((cmd, index) => {
              const isActive = index === activeIndex;
              const itemId = `${baseId}-item-${cmd.id}`;
              return (
                <li
                  key={cmd.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  id={itemId}
                  role="option"
                  aria-selected={isActive}
                  className={`command-palette-item${isActive ? ' command-palette-item-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(cmd)}
                >
                  <span className="command-palette-item-label">{cmd.label}</span>
                  {cmd.hint && <span className="command-palette-item-hint">{cmd.hint}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CommandPalette;
