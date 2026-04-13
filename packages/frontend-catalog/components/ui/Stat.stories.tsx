import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = {
  title: 'Data/Stat',
  component: Stat,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Stat — big number + label with optional trend delta. Token-only.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  args: {
    label: 'Candidats actifs',
    value: 1284,
    trend: { direction: 'up', value: '+12.5%' },
    hint: 'vs. mois précédent',
  },
};

export const TrendDown: Story = {
  args: {
    label: 'Délai moyen',
    value: '14 jours',
    trend: { direction: 'down', value: '-3 jours' },
    hint: 'vs. trimestre précédent',
  },
};

export const TrendFlat: Story = {
  args: {
    label: 'Taux de conversion',
    value: '23%',
    trend: { direction: 'flat', value: '0%' },
  },
};

export const NoTrend: Story = {
  args: {
    label: 'Total CDI',
    value: 421,
  },
};

export const StringValue: Story = {
  args: {
    label: 'Salaire moyen',
    value: '52 400 €',
    trend: { direction: 'up', value: '+4.2%' },
  },
};

export const Grid: Story = {
  render: () => (
    <div className="stories-row">
      <Stat label="Candidats" value={1284} trend={{ direction: 'up', value: '+12%' }} />
      <Stat label="Offres" value={42} trend={{ direction: 'up', value: '+5' }} />
      <Stat label="Délai" value="14 j" trend={{ direction: 'down', value: '-3 j' }} />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    label: 'Candidats actifs',
    value: 1284,
    trend: { direction: 'up', value: '+12.5%' },
    hint: 'vs. mois précédent',
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
