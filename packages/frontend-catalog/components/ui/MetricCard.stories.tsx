import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard';

const meta: Meta<typeof MetricCard> = {
  title: 'Data/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'MetricCard — card wrapper around a Stat with icon and footer slots.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof MetricCard>;

const UsersIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Default: Story = {
  args: {
    title: 'Candidats actifs',
    value: 1284,
    delta: { direction: 'up', value: '+12.5%' },
    icon: UsersIcon,
    footer: 'Mis à jour il y a 5 minutes',
  },
};

export const NoIcon: Story = {
  args: {
    title: 'Offres ouvertes',
    value: 42,
    delta: { direction: 'up', value: '+5' },
  },
};

export const NoFooter: Story = {
  args: {
    title: 'Délai moyen',
    value: '14 jours',
    delta: { direction: 'down', value: '-3 jours' },
    icon: UsersIcon,
  },
};

export const Minimal: Story = {
  args: {
    title: 'Total candidats',
    value: 9421,
  },
};

export const Grid: Story = {
  render: () => (
    <div className="stories-row">
      <MetricCard
        title="Candidats"
        value={1284}
        delta={{ direction: 'up', value: '+12%' }}
        icon={UsersIcon}
      />
      <MetricCard
        title="Offres"
        value={42}
        delta={{ direction: 'up', value: '+5' }}
        icon={UsersIcon}
      />
      <MetricCard
        title="Délai"
        value="14 j"
        delta={{ direction: 'down', value: '-3 j' }}
        icon={UsersIcon}
      />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    title: 'Candidats actifs',
    value: 1284,
    delta: { direction: 'up', value: '+12.5%' },
    icon: UsersIcon,
    footer: 'Mis à jour il y a 5 minutes',
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
