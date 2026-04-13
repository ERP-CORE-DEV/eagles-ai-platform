import { useCallback, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import './Tabs.css';

export interface TabItem {
  /** Stable identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Panel content */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab definitions */
  tabs: TabItem[];
  /** Controlled active tab id */
  activeId?: string;
  /** Initial uncontrolled active tab id */
  defaultActiveId?: string;
  /** Change handler — fires for both controlled and uncontrolled mode */
  onChange?: (id: string) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Tabs — accessible tablist with keyboard navigation.
 *
 * Supports controlled (activeId) and uncontrolled (defaultActiveId) modes.
 * Keyboard: Left/Right arrows move focus, Home/End jump to first/last,
 * Space/Enter activate. Disabled tabs are skipped during keyboard navigation.
 */
export function Tabs({
  tabs,
  activeId,
  defaultActiveId,
  onChange,
  className = '',
}: TabsProps) {
  const baseId = useId();
  const firstEnabled = tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? '';
  const [internalId, setInternalId] = useState<string>(defaultActiveId ?? firstEnabled);
  const currentId = activeId ?? internalId;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activate = useCallback(
    (id: string) => {
      if (activeId === undefined) {
        setInternalId(id);
      }
      onChange?.(id);
    },
    [activeId, onChange]
  );

  const focusTab = useCallback((id: string) => {
    const el = tabRefs.current[id];
    if (el) {
      el.focus();
    }
  }, []);

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      const enabled = tabs.filter((t) => !t.disabled);
      if (enabled.length === 0) return;
      const currentEnabledIndex = enabled.findIndex((t) => t.id === currentId);
      const startIndex = currentEnabledIndex === -1 ? 0 : currentEnabledIndex;
      const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
      const nextId = enabled[nextIndex].id;
      activate(nextId);
      focusTab(nextId);
    },
    [tabs, currentId, activate, focusTab]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const enabled = tabs.filter((t) => !t.disabled);
      if (enabled.length === 0) return;
      switch (event.key) {
        case 'ArrowRight': {
          event.preventDefault();
          moveFocus(1);
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          moveFocus(-1);
          break;
        }
        case 'Home': {
          event.preventDefault();
          const id = enabled[0].id;
          activate(id);
          focusTab(id);
          break;
        }
        case 'End': {
          event.preventDefault();
          const id = enabled[enabled.length - 1].id;
          activate(id);
          focusTab(id);
          break;
        }
        default:
          break;
      }
    },
    [tabs, moveFocus, activate, focusTab]
  );

  const classes = ['tabs', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div role="tablist" aria-orientation="horizontal" className="tabs-list">
        {tabs.map((tab) => {
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          const selected = tab.id === currentId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              aria-disabled={tab.disabled || undefined}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              className={[
                'tabs-tab',
                selected ? 'tabs-tab-selected' : '',
                tab.disabled ? 'tabs-tab-disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (!tab.disabled) {
                  activate(tab.id);
                }
              }}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const tabId = `${baseId}-tab-${tab.id}`;
        const panelId = `${baseId}-panel-${tab.id}`;
        const selected = tab.id === currentId;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!selected}
            tabIndex={0}
            className="tabs-panel"
          >
            {selected ? tab.content : null}
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
