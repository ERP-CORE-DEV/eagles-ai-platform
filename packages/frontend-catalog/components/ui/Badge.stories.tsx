import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { Avatar } from './Avatar';

const meta: Meta<typeof Badge> = {
  title: 'Data/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Badge — generic numeric/count overlay. Distinct from StatusBadge (which is for HR status taxonomies). Token-only.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    count: 5,
    tone: 'error',
  },
};

export const Inline: Story = {
  args: {
    count: 12,
    tone: 'info',
  },
};

export const OverflowMax: Story = {
  args: {
    count: 250,
    max: 99,
    tone: 'error',
  },
};

export const Dot: Story = {
  args: {
    dot: true,
    tone: 'success',
  },
};

export const AnchoredCount: Story = {
  render: () => (
    <Badge count={3} tone="error">
      <Avatar name="Marie Dupont" size="large" />
    </Badge>
  ),
};

export const AnchoredDot: Story = {
  render: () => (
    <Badge dot tone="success">
      <Avatar name="Jean Martin" size="large" />
    </Badge>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="stories-row">
      <Badge count={1} tone="default" />
      <Badge count={2} tone="info" />
      <Badge count={3} tone="success" />
      <Badge count={4} tone="warning" />
      <Badge count={5} tone="error" />
    </div>
  ),
};

export const ZeroIsHidden: Story = {
  args: {
    count: 0,
    tone: 'error',
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="stories-row">
      <Badge count={5} tone="error">
        <Avatar name="Marie Dupont" size="large" />
      </Badge>
      <Badge dot tone="success">
        <Avatar name="Jean Martin" size="large" />
      </Badge>
      <Badge count={42} tone="info" />
    </div>
  ),
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
