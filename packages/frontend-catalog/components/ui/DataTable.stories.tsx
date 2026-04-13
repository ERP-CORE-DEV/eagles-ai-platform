import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DataTable, type DataTableColumn } from './DataTable';

interface Candidate {
  id: string;
  name: string;
  role: string;
  contract: string;
  salary: number;
}

const SAMPLE_ROWS: Candidate[] = [
  { id: 'c1', name: 'Alice Martin', role: 'Developer', contract: 'CDI', salary: 52000 },
  { id: 'c2', name: 'Bob Dupont', role: 'Designer', contract: 'CDD', salary: 48000 },
  { id: 'c3', name: 'Claire Leroy', role: 'Product Manager', contract: 'CDI', salary: 65000 },
  { id: 'c4', name: 'David Bernard', role: 'DevOps', contract: 'Freelance', salary: 75000 },
];

const COLUMNS: DataTableColumn<Candidate>[] = [
  { key: 'name', header: 'Nom', align: 'left' },
  { key: 'role', header: 'Poste', align: 'left' },
  { key: 'contract', header: 'Contrat', align: 'center' },
  {
    key: 'salary',
    header: 'Salaire',
    align: 'right',
    render: (row) => `${row.salary.toLocaleString('fr-FR')} \u20AC`,
  },
];

const meta: Meta<typeof DataTable<Candidate>> = {
  title: 'Data/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'DataTable — typed generic table with semantic <table> markup.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DataTable<Candidate>>;

export const Default: Story = {
  args: {
    columns: COLUMNS,
    rows: SAMPLE_ROWS,
    rowKey: (row: Candidate) => row.id,
  },
};

export const Clickable: Story = {
  args: {
    columns: COLUMNS,
    rows: SAMPLE_ROWS,
    rowKey: (row: Candidate) => row.id,
    onRowClick: fn(),
  },
};

export const Empty: Story = {
  args: {
    columns: COLUMNS,
    rows: [],
    rowKey: (row: Candidate) => row.id,
    empty: 'Aucun candidat trouvé',
  },
};

export const SingleRow: Story = {
  args: {
    columns: COLUMNS,
    rows: [SAMPLE_ROWS[0]],
    rowKey: (row: Candidate) => row.id,
  },
};

export const DarkMode: Story = {
  args: {
    columns: COLUMNS,
    rows: SAMPLE_ROWS,
    rowKey: (row: Candidate) => row.id,
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
