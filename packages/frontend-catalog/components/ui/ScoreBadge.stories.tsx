import type { Meta, StoryObj } from '@storybook/react';
import { ScoreBadge } from './ScoreBadge';

const meta: Meta<typeof ScoreBadge> = {
  title: 'ERP/ScoreBadge',
  component: ScoreBadge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Circular score meter for matching results. Color shifts across error / warning / info / success thresholds.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};
export default meta;

type Story = StoryObj<typeof ScoreBadge>;

export const Default: Story = {
  args: {
    value: 87,
    label: 'Match',
    size: 'medium',
  },
};

export const Thresholds: Story = {
  render: () => (
    <div className="stories-row">
      <ScoreBadge value={32} label="Faible" />
      <ScoreBadge value={61} label="Moyen" />
      <ScoreBadge value={82} label="Bon" />
      <ScoreBadge value={95} label="Excellent" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-row">
      <ScoreBadge value={87} label="Match" size="small" />
      <ScoreBadge value={87} label="Match" size="medium" />
      <ScoreBadge value={87} label="Match" size="large" />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    value: 87,
    label: 'Match',
    size: 'medium',
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
