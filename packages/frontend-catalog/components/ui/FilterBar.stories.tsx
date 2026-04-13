import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './FilterBar';
import type { FilterItem } from './FilterBar';

const meta: Meta<typeof FilterBar> = {
  title: 'ERP/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Horizontal filter toolbar. Each pill toggles its aria-pressed state. Optional clear-all button.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

const INITIAL_FILTERS: FilterItem[] = [
  { id: 'cdi', label: 'CDI', active: true },
  { id: 'cdd', label: 'CDD', active: false },
  { id: 'freelance', label: 'Freelance', active: true },
  { id: 'paris', label: 'Paris', active: false },
  { id: 'lyon', label: 'Lyon', active: false },
  { id: 'remote', label: 'Télétravail', active: false },
  { id: 'senior', label: 'Senior', active: false },
];

function StatefulFilterBar() {
  const [filters, setFilters] = useState<FilterItem[]>(INITIAL_FILTERS);

  const handleToggle = (id: string) => {
    setFilters((current) =>
      current.map((filter) =>
        filter.id === id ? { ...filter, active: !filter.active } : filter,
      ),
    );
  };

  const handleClearAll = () => {
    setFilters((current) => current.map((filter) => ({ ...filter, active: false })));
  };

  return <FilterBar filters={filters} onToggle={handleToggle} onClearAll={handleClearAll} />;
}

export const Default: Story = {
  render: () => <StatefulFilterBar />,
};

export const NoActive: Story = {
  args: {
    filters: INITIAL_FILTERS.map((filter) => ({ ...filter, active: false })),
    onToggle: () => undefined,
    onClearAll: () => undefined,
  },
};

export const AllActive: Story = {
  args: {
    filters: INITIAL_FILTERS.map((filter) => ({ ...filter, active: true })),
    onToggle: () => undefined,
    onClearAll: () => undefined,
  },
};

export const DarkMode: Story = {
  render: () => <StatefulFilterBar />,
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
