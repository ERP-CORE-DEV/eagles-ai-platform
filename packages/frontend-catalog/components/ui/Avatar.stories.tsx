import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Data/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Avatar — circular portrait with initials fallback, status dot, and circle/square shapes. Token-only.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'Marie Dupont',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Jean Martin',
    src: 'https://i.pravatar.cc/80?u=jean',
  },
};

export const WithStatusOnline: Story = {
  args: {
    name: 'Claire Bernard',
    status: 'online',
  },
};

export const WithStatusBusy: Story = {
  args: {
    name: 'Paul Lefevre',
    status: 'busy',
  },
};

export const Square: Story = {
  args: {
    name: 'Sophie Garnier',
    shape: 'square',
    status: 'away',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-row">
      <Avatar name="A B" size="small" />
      <Avatar name="A B" size="medium" />
      <Avatar name="A B" size="large" />
      <Avatar name="A B" size="xlarge" />
    </div>
  ),
};

export const SingleName: Story = {
  args: {
    name: 'Madonna',
    size: 'large',
  },
};

export const DarkMode: Story = {
  args: {
    name: 'Marie Dupont',
    status: 'online',
    size: 'large',
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
