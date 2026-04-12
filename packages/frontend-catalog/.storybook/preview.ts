import type { Preview, Decorator } from '@storybook/react';
import { createElement, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { ThemeProvider } from '../components/theme';
import type { Theme } from '../components/theme';
import '../dist/tokens.css';

/**
 * Antd + catalog ThemeProvider decorator. Reads the active mode from the
 * Storybook `theme` global and:
 *
 * 1. Sets `data-theme` on <html> via ThemeProvider (controlled mode).
 * 2. Swaps antd's algorithm between defaultAlgorithm and darkAlgorithm so
 *    antd components flip their own internal tokens too.
 * 3. Paints the story canvas background from `--system-background-default`
 *    so preview sandboxing matches real app chrome.
 */
const withTheme: Decorator = (Story, context) => {
  const mode = ((context.globals.theme as Theme) ?? 'light') as Theme;

  useEffect(() => {
    const body = document.body;
    if (!body) return;
    body.style.backgroundColor = 'var(--system-background-default)';
    body.style.color = 'var(--system-text-primary)';
    body.style.transition = 'background-color 200ms ease, color 200ms ease';
  }, [mode]);

  return createElement(
    ThemeProvider,
    { controlledTheme: mode, persist: false },
    createElement(
      ConfigProvider,
      {
        locale: frFR,
        theme: {
          algorithm:
            mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#7c3aed',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#f43f5e',
            colorInfo: '#3b82f6',
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
            borderRadius: 8,
          },
        },
      },
      createElement(Story),
    ),
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light / dark mode toggle',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
