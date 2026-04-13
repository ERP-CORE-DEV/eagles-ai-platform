import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Breadcrumb navigation showing the user position in a hierarchy. Last item is the current page.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

const baseItems = [
  { label: 'Accueil', href: '/' },
  { label: 'Candidats', href: '/candidates' },
  { label: 'Jane Doe' },
];

export const Default: Story = {
  args: {
    items: baseItems,
  },
};

export const WithCustomSeparator: Story = {
  args: {
    items: baseItems,
    separator: '›',
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Tableau de bord' }],
  },
};

export const DeepHierarchy: Story = {
  args: {
    items: [
      { label: 'Accueil', href: '/' },
      { label: 'RH', href: '/rh' },
      { label: 'Recrutement', href: '/rh/recrutement' },
      { label: 'Offres', href: '/rh/recrutement/offres' },
      { label: 'Développeur Senior' },
    ],
  },
};

export const DarkMode: Story = {
  args: {
    items: baseItems,
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
