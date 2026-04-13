import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Accessible tablist with full keyboard navigation. Supports controlled and uncontrolled modes.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const baseTabs = [
  {
    id: 'profile',
    label: 'Profil',
    content: <p>Informations personnelles du candidat.</p>,
  },
  {
    id: 'experience',
    label: 'Expérience',
    content: <p>Historique professionnel et compétences.</p>,
  },
  {
    id: 'documents',
    label: 'Documents',
    content: <p>CV, lettres de motivation et certifications.</p>,
  },
];

export const Default: Story = {
  args: {
    tabs: baseTabs,
    defaultActiveId: 'profile',
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      ...baseTabs,
      {
        id: 'archived',
        label: 'Archivé',
        content: <p>Données archivées.</p>,
        disabled: true,
      },
    ],
    defaultActiveId: 'profile',
  },
};

export const StartOnSecondTab: Story = {
  args: {
    tabs: baseTabs,
    defaultActiveId: 'experience',
  },
};

export const DarkMode: Story = {
  args: {
    tabs: baseTabs,
    defaultActiveId: 'profile',
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
