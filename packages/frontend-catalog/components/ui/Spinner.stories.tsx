import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Loading spinner with role="status" and accessible label. Use for indeterminate async work that blocks an interaction.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'medium',
    label: 'Loading',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Loading',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Loading data',
  },
};

export const CustomLabel: Story = {
  args: {
    size: 'medium',
    label: 'Saving candidate profile',
  },
};

export const DarkMode: Story = {
  args: {
    size: 'medium',
    label: 'Loading',
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
