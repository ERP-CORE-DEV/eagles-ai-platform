import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Data/Tag',
  component: Tag,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tag — small non-interactive label pill. Token-only, light + dark.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'error', 'neutral'],
    },
    size: { control: 'select', options: ['small', 'default'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: { children: 'CDI', tone: 'default' },
};

export const Info: Story = {
  args: { children: 'Nouveau', tone: 'info' },
};

export const Success: Story = {
  args: { children: 'Approuvé', tone: 'success' },
};

export const Warning: Story = {
  args: { children: 'En attente', tone: 'warning' },
};

export const Error: Story = {
  args: { children: 'Rejeté', tone: 'error' },
};

export const Neutral: Story = {
  args: { children: 'Brouillon', tone: 'neutral' },
};

export const Small: Story = {
  args: { children: 'Petit', tone: 'info', size: 'small' },
};

export const AllTones: Story = {
  render: () => (
    <div className="stories-row">
      <Tag tone="default">default</Tag>
      <Tag tone="neutral">neutral</Tag>
      <Tag tone="info">info</Tag>
      <Tag tone="success">success</Tag>
      <Tag tone="warning">warning</Tag>
      <Tag tone="error">error</Tag>
    </div>
  ),
};

export const DarkMode: Story = {
  args: { children: 'CDI', tone: 'default' },
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
