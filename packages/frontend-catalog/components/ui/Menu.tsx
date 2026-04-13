import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import './Menu.css';

export interface MenuItem {
  /** Stable identifier */
  id: string;
  /** Visible label */
  label: string;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Selection handler — fires on click and Enter/Space */
  onSelect: () => void;
}

export interface MenuProps {
  /** Trigger content (rendered inside a <button> with aria-haspopup) */
  trigger: ReactNode;
  /** Menu items */
  items: MenuItem[];
  /** Panel alignment relative to the trigger */
  align?: 'start' | 'end';
  /** Accessible label for the trigger button — required when trigger is icon-only */
  triggerLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Menu — disclosure menu (hamburger / actions).
 *
 * Trigger button toggles a role="menu" panel containing role="menuitem" entries.
 * Closes on Escape, click outside, and after item selection. Keyboard support:
 * Enter/Space activate, Escape close, ArrowDown/ArrowUp move focus.
 */
export function Menu({
  trigger,
  items,
  align = 'start',
  triggerLabel,
  className = '',
}: MenuProps) {
  const baseId = useId();
  const menuId = `${baseId}-menu`;
  const triggerId = `${baseId}-trigger`;
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    setFocusedIndex(-1);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const firstEnabledIndex = useCallback(() => {
    return items.findIndex((item) => !item.disabled);
  }, [items]);

  const lastEnabledIndex = useCallback(() => {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (!items[i].disabled) return i;
    }
    return -1;
  }, [items]);

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      if (items.length === 0) return;
      const start = focusedIndex === -1 ? (direction === 1 ? -1 : items.length) : focusedIndex;
      let next = start;
      for (let step = 0; step < items.length; step += 1) {
        next = (next + direction + items.length) % items.length;
        if (!items[next].disabled) {
          setFocusedIndex(next);
          itemRefs.current[next]?.focus();
          return;
        }
      }
    },
    [items, focusedIndex]
  );

  const openMenu = useCallback(
    (focusFirst: boolean) => {
      setOpen(true);
      if (focusFirst) {
        const idx = firstEnabledIndex();
        setFocusedIndex(idx);
        // defer to allow the menu to mount before focusing
        requestAnimationFrame(() => {
          if (idx >= 0) {
            itemRefs.current[idx]?.focus();
          }
        });
      }
    },
    [firstEnabledIndex]
  );

  const handleTriggerClick = useCallback(() => {
    if (open) {
      close(false);
    } else {
      openMenu(false);
    }
  }, [open, close, openMenu]);

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu(true);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
        const idx = lastEnabledIndex();
        setFocusedIndex(idx);
        requestAnimationFrame(() => {
          if (idx >= 0) {
            itemRefs.current[idx]?.focus();
          }
        });
      }
    },
    [openMenu, lastEnabledIndex]
  );

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'Escape': {
          event.preventDefault();
          close(true);
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          moveFocus(1);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          moveFocus(-1);
          break;
        }
        case 'Home': {
          event.preventDefault();
          const idx = firstEnabledIndex();
          if (idx >= 0) {
            setFocusedIndex(idx);
            itemRefs.current[idx]?.focus();
          }
          break;
        }
        case 'End': {
          event.preventDefault();
          const idx = lastEnabledIndex();
          if (idx >= 0) {
            setFocusedIndex(idx);
            itemRefs.current[idx]?.focus();
          }
          break;
        }
        case 'Tab': {
          close(false);
          break;
        }
        default:
          break;
      }
    },
    [close, moveFocus, firstEnabledIndex, lastEnabledIndex]
  );

  // Outside click + Escape (when focus is outside the menu)
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        close(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open, close]);

  const handleItemClick = useCallback(
    (item: MenuItem) => {
      if (item.disabled) return;
      item.onSelect();
      close(true);
    },
    [close]
  );

  const classes = [
    'menu',
    `menu-align-${align}`,
    open ? 'menu-open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} ref={containerRef}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={triggerLabel}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="menu-panel"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              role="menuitem"
              className={[
                'menu-item',
                item.disabled ? 'menu-item-disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={item.disabled}
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && (
                <span className="menu-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="menu-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;
