import type { Preview, Decorator } from '@storybook/react';
import { createElement } from 'react';
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';

/**
 * antd ConfigProvider decorator — wraps every story in French locale + violet theme.
 * Maps design-tokens.css system tokens to antd theme.token.
 */
const withAntdProvider: Decorator = (Story) =>
  createElement(
    ConfigProvider,
    {
      locale: frFR,
      theme: {
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
  );

const preview: Preview = {
  decorators: [withAntdProvider],
  parameters: {
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
