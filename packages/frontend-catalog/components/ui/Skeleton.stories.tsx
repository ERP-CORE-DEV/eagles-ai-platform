import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Loading placeholder with shimmer animation. Use while async content is loading to reduce perceived wait.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'rect', 'circle'] },
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: 'rect',
    width: '320px',
    height: '120px',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    width: '240px',
    height: '14px',
  },
};

export const Circle: Story = {
  args: {
    variant: 'circle',
    width: '48px',
    height: '48px',
  },
};

export const Composition: Story = {
  render: () => (
    <div className="stories-stack">
      <Skeleton variant="circle" width="56px" height="56px" />
      <Skeleton variant="text" width="220px" height="14px" />
      <Skeleton variant="text" width="180px" height="14px" />
      <Skeleton variant="rect" width="320px" height="120px" />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    variant: 'rect',
    width: '320px',
    height: '120px',
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
