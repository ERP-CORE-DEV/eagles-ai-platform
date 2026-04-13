import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Transient notification with role="status" and optional auto-dismiss. Use for non-blocking confirmation feedback.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    duration: { control: { type: 'number', min: 0, step: 500 } },
  },
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    title: 'Saved successfully',
    description: 'Your changes have been recorded.',
    tone: 'info',
    duration: 0,
  },
};

export const Success: Story = {
  args: {
    title: 'Candidate approved',
    description: 'The candidate has been moved to the next stage.',
    tone: 'success',
    duration: 0,
  },
};

export const Warning: Story = {
  args: {
    title: 'Quota nearly reached',
    description: '90% of monthly job postings consumed.',
    tone: 'warning',
    duration: 0,
  },
};

export const Error: Story = {
  args: {
    title: 'Failed to save',
    description: 'Network error. Please try again.',
    tone: 'error',
    duration: 0,
  },
};

export const WithDismiss: Story = {
  args: {
    title: 'Dismissable toast',
    description: 'Click the close icon to dismiss.',
    tone: 'info',
    duration: 0,
    onClose: () => undefined,
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Saved successfully',
    description: 'Your changes have been recorded.',
    tone: 'info',
    duration: 0,
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
