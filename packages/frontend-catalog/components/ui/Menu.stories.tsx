import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'Navigation/Menu',
  component: Menu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Disclosure menu with role="menu" panel. Closes on Escape, outside click, and item selection.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Menu>;

const baseItems = [
  {
    id: 'edit',
    label: 'Modifier',
    onSelect: () => {
      // eslint-disable-next-line no-console
      console.log('Modifier');
    },
  },
  {
    id: 'duplicate',
    label: 'Dupliquer',
    onSelect: () => {
      // eslint-disable-next-line no-console
      console.log('Dupliquer');
    },
  },
  {
    id: 'archive',
    label: 'Archiver',
    onSelect: () => {
      // eslint-disable-next-line no-console
      console.log('Archiver');
    },
  },
  {
    id: 'delete',
    label: 'Supprimer',
    onSelect: () => {
      // eslint-disable-next-line no-console
      console.log('Supprimer');
    },
  },
];

export const Default: Story = {
  args: {
    trigger: 'Actions',
    items: baseItems,
    triggerLabel: 'Ouvrir le menu des actions',
  },
};

export const AlignedEnd: Story = {
  args: {
    trigger: 'Options',
    items: baseItems,
    align: 'end',
    triggerLabel: 'Ouvrir le menu des options',
  },
};

export const WithDisabledItem: Story = {
  args: {
    trigger: 'Actions',
    triggerLabel: 'Ouvrir le menu des actions',
    items: [
      ...baseItems.slice(0, 2),
      {
        id: 'export',
        label: 'Exporter (verrouillé)',
        disabled: true,
        onSelect: () => {
          // noop
        },
      },
      ...baseItems.slice(2),
    ],
  },
};

export const HamburgerTrigger: Story = {
  args: {
    trigger: '☰',
    triggerLabel: 'Ouvrir le menu principal',
    items: [
      {
        id: 'home',
        label: 'Accueil',
        onSelect: () => {
          // noop
        },
      },
      {
        id: 'candidates',
        label: 'Candidats',
        onSelect: () => {
          // noop
        },
      },
      {
        id: 'settings',
        label: 'Paramètres',
        onSelect: () => {
          // noop
        },
      },
    ],
  },
};

export const DarkMode: Story = {
  args: {
    trigger: 'Actions',
    items: baseItems,
    triggerLabel: 'Ouvrir le menu des actions',
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
