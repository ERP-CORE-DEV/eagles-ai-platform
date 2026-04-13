import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Labeled content section with optional kicker, title, description, and padded body.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    title: 'Profile information',
    children: <p>Update your personal details and contact information here.</p>,
  },
};

export const WithKicker: Story = {
  args: {
    kicker: 'Account',
    title: 'Profile information',
    description: 'These details appear on your public profile.',
    children: <p>Update your personal details and contact information here.</p>,
  },
};

export const Unpadded: Story = {
  args: {
    title: 'Data table',
    description: 'Edge-to-edge content area without internal padding.',
    padded: false,
    children: <p>Table content stretched to the section edges.</p>,
  },
};

export const DarkMode: Story = {
  args: {
    kicker: 'Account',
    title: 'Profile information',
    description: 'These details appear on your public profile.',
    children: <p>Update your personal details and contact information here.</p>,
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
