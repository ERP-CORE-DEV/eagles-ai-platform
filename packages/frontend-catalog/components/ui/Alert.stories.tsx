import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inline persistent message. Uses role="alert" for warning/error and role="status" for info/success.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    title: 'Heads up',
    description: 'This is an informational message.',
    tone: 'info',
  },
};

export const Success: Story = {
  args: {
    title: 'Profile updated',
    description: 'Your changes have been saved.',
    tone: 'success',
  },
};

export const Warning: Story = {
  args: {
    title: 'Approaching limit',
    description: 'You have used 80% of your monthly quota.',
    tone: 'warning',
  },
};

export const Error: Story = {
  args: {
    title: 'Validation failed',
    description: 'Please fix the highlighted fields and try again.',
    tone: 'error',
  },
};

export const Dismissable: Story = {
  args: {
    title: 'Dismissable alert',
    description: 'Click the dismiss icon to remove this alert.',
    tone: 'info',
    onDismiss: () => undefined,
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Heads up',
    description: 'This is an informational message.',
    tone: 'info',
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
