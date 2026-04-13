import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Layout/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Surface container with optional header (title, subtitle, actions slot), body, and optional footer.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Candidate summary',
    subtitle: 'Last updated 2 hours ago',
    children: <p>Surface container body content with token-only styling.</p>,
  },
};

export const WithActionsAndFooter: Story = {
  args: {
    title: 'Job posting',
    subtitle: 'Senior backend engineer — Paris',
    actions: (
      <button type="button" aria-label="Open menu">
        Edit
      </button>
    ),
    footer: <span>Last reviewed by Hatim</span>,
    children: <p>Card body with header actions and footer slot populated.</p>,
  },
};

export const Borderless: Story = {
  args: {
    title: 'Borderless card',
    bordered: false,
    children: <p>No outer border, only the surface shadow.</p>,
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Spacious card',
    subtitle: 'Large padding scale',
    padding: 'large',
    children: <p>Generous internal spacing for hero-style surfaces.</p>,
  },
};

export const BodyOnly: Story = {
  args: {
    children: <p>Card with no header or footer — just a padded body.</p>,
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Candidate summary',
    subtitle: 'Last updated 2 hours ago',
    actions: (
      <button type="button" aria-label="Open menu">
        Edit
      </button>
    ),
    footer: <span>Last reviewed by Hatim</span>,
    children: <p>Surface container body content rendered in dark theme.</p>,
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
