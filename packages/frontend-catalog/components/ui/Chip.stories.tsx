import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Data/Chip',
  component: Chip,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Chip — interactive pill with optional close button. Token-only, light + dark.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    onRemove: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: { label: 'React', tone: 'default', onRemove: fn() },
};

export const Primary: Story = {
  args: { label: 'TypeScript', tone: 'primary', onRemove: fn() },
};

export const Success: Story = {
  args: { label: 'Validé', tone: 'success', onRemove: fn() },
};

export const Warning: Story = {
  args: { label: 'À revoir', tone: 'warning', onRemove: fn() },
};

export const ErrorTone: Story = {
  args: { label: 'Bloqué', tone: 'error', onRemove: fn() },
};

export const NonRemovable: Story = {
  args: { label: 'CDI', tone: 'primary' },
};

export const Disabled: Story = {
  args: { label: 'Indisponible', tone: 'default', disabled: true, onRemove: fn() },
};

export const SkillList: Story = {
  render: () => (
    <div className="stories-row">
      <Chip label="React" tone="primary" onRemove={fn()} />
      <Chip label="TypeScript" tone="primary" onRemove={fn()} />
      <Chip label="Node.js" tone="primary" onRemove={fn()} />
      <Chip label="GraphQL" tone="primary" onRemove={fn()} />
      <Chip label="Docker" tone="primary" onRemove={fn()} />
    </div>
  ),
};

export const DarkMode: Story = {
  args: { label: 'React', tone: 'default', onRemove: fn() },
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
