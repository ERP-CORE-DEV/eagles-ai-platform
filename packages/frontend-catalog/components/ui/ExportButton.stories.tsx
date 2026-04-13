import type { Meta, StoryObj } from '@storybook/react';
import { ExportButton } from './ExportButton';

const meta: Meta<typeof ExportButton> = {
  title: 'ERP/ExportButton',
  component: ExportButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Composes the base Button. Click opens a popover with the available formats; selection invokes onExport and shows a transient loading state.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ExportButton>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const Default: Story = {
  args: {
    label: 'Exporter la liste candidats',
    onExport: async (format) => {
      await delay(800);
      // eslint-disable-next-line no-console
      console.log('Exported as', format);
    },
  },
};

export const CsvOnly: Story = {
  args: {
    label: 'Exporter (CSV)',
    formats: ['csv'],
    onExport: async (format) => {
      await delay(500);
      // eslint-disable-next-line no-console
      console.log('Exported as', format);
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Exporter',
    disabled: true,
    onExport: () => undefined,
  },
};

export const DarkMode: Story = {
  args: {
    label: 'Exporter la liste candidats',
    onExport: async (format) => {
      await delay(800);
      // eslint-disable-next-line no-console
      console.log('Exported as', format);
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      return <Story />;
    },
  ],
};
