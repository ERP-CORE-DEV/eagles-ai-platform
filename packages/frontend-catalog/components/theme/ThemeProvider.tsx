import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'eagles:theme';

function readInitialTheme(defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme;

  const stored = window.localStorage?.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : defaultTheme;
}

function applyThemeAttribute(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

export interface ThemeProviderProps {
  children?: ReactNode;
  defaultTheme?: Theme;
  /**
   * When true, persists theme selection to localStorage and respects the
   * user's OS preference on first load. Set false for Storybook-driven
   * toolbars where the parent owns the source of truth.
   */
  persist?: boolean;
  /**
   * Controlled theme — when provided, ThemeProvider becomes a pass-through
   * and does not manage internal state. Used by Storybook globals.
   */
  controlledTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  persist = true,
  controlledTheme,
}: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<Theme>(() =>
    persist ? readInitialTheme(defaultTheme) : defaultTheme,
  );

  const theme = controlledTheme ?? internalTheme;

  useEffect(() => {
    applyThemeAttribute(theme);
    if (persist && controlledTheme == null) {
      window.localStorage?.setItem(STORAGE_KEY, theme);
    }
  }, [theme, persist, controlledTheme]);

  const setTheme = useCallback((next: Theme) => {
    setInternalTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setInternalTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
