import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M3 12h4l2 3h6l2-3h4M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-7z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="m20 20-3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const meta: Meta<typeof EmptyState> = {
  title: 'Data/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'EmptyState — zero-state placeholder with optional icon, title, description, and action. Token-only.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <InboxIcon />,
    title: 'Aucun candidat',
    description: 'Vous n\u2019avez pas encore de candidats dans cette offre.',
    action: <Button variant="primary">Ajouter un candidat</Button>,
  },
};

export const NoResults: Story = {
  args: {
    icon: <SearchIcon />,
    title: 'Aucun résultat',
    description: 'Essayez d\u2019ajuster vos filtres ou votre recherche.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Rien à afficher',
  },
};

export const NoIcon: Story = {
  args: {
    title: 'Boîte vide',
    description: 'Aucune notification pour le moment.',
    action: <Button variant="secondary">Actualiser</Button>,
  },
};

export const DarkMode: Story = {
  args: {
    icon: <InboxIcon />,
    title: 'Aucun candidat',
    description: 'Vous n\u2019avez pas encore de candidats dans cette offre.',
    action: <Button variant="primary">Ajouter un candidat</Button>,
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
