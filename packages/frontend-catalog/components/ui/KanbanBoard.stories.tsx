import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from './KanbanBoard';
import type { KanbanColumn } from './KanbanBoard';

const meta: Meta<typeof KanbanBoard> = {
  title: 'ERP/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Column-based task board for recruitment pipelines. Section-per-column, article-per-card. Drag-drop is not wired in this baseline.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof KanbanBoard>;

const RECRUITMENT_PIPELINE: KanbanColumn[] = [
  {
    id: 'sourced',
    title: 'À contacter',
    cards: [
      {
        id: 'c-1',
        title: 'Amélie Dubois',
        subtitle: 'Développeuse Full-Stack — 8 ans',
        tag: 'CDI',
      },
      {
        id: 'c-2',
        title: 'Mathieu Lefèvre',
        subtitle: 'Consultant DevOps — 12 ans',
        tag: 'Freelance',
      },
      {
        id: 'c-3',
        title: 'Inès Petit',
        subtitle: 'Designer UX — 5 ans',
        tag: 'Portage',
      },
    ],
  },
  {
    id: 'screening',
    title: 'Pré-qualification',
    cards: [
      {
        id: 'c-4',
        title: 'Léa Martin',
        subtitle: 'Data Scientist — 6 ans',
        tag: 'CDI',
      },
      {
        id: 'c-5',
        title: 'Hugo Bernard',
        subtitle: 'Ingénieur QA — 3 ans',
        tag: 'Interim',
      },
    ],
  },
  {
    id: 'interview',
    title: 'Entretien',
    cards: [
      {
        id: 'c-6',
        title: 'Sophie Marchand',
        subtitle: 'Chargée de recrutement — 4 ans',
        tag: 'CDD',
      },
    ],
  },
  {
    id: 'offer',
    title: 'Offre envoyée',
    cards: [
      {
        id: 'c-7',
        title: 'Julien Roux',
        subtitle: 'Architecte Cloud — 10 ans',
        tag: 'CDI',
      },
    ],
  },
  {
    id: 'hired',
    title: 'Embauché',
    cards: [],
  },
];

export const Default: Story = {
  args: {
    columns: RECRUITMENT_PIPELINE,
    onCardMove: () => undefined,
  },
};

export const EmptyBoard: Story = {
  args: {
    columns: RECRUITMENT_PIPELINE.map((column) => ({ ...column, cards: [] })),
    onCardMove: () => undefined,
  },
};

export const DarkMode: Story = {
  args: {
    columns: RECRUITMENT_PIPELINE,
    onCardMove: () => undefined,
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
