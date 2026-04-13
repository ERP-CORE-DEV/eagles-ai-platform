import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'Draft',
        'PendingReview',
        'Approved',
        'Rejected',
        'Published',
        'Active',
        'Paused',
        'Completed',
        'Closed',
        'Archived',
        'Open',
        'Expired',
        'Scheduled',
        'Cancelled',
        'InProgress',
      ],
    },
    size: { control: 'select', options: ['small', 'default'] },
    showDot: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: { status: 'Active' },
};

export const Draft: Story = { args: { status: 'Draft' } };
export const PendingReview: Story = { args: { status: 'PendingReview' } };
export const Approved: Story = { args: { status: 'Approved' } };
export const Rejected: Story = { args: { status: 'Rejected' } };
export const Paused: Story = { args: { status: 'Paused' } };
export const Small: Story = { args: { status: 'Active', size: 'small' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="stories-row">
      {['Draft', 'PendingReview', 'Approved', 'Rejected', 'Published', 'Active', 'Paused', 'Completed', 'Open', 'Expired', 'Scheduled', 'Cancelled', 'InProgress'].map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};

export const DarkMode: Story = {
  args: { status: 'Active' },
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
