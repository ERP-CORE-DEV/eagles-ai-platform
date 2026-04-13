import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Horizontal or vertical separator with optional centered label. Token-only styling.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const WithLabel: Story = {
  args: {
    orientation: 'horizontal',
    label: 'or continue with',
  },
};

export const Vertical: Story = {
  render: (args) => (
    <div style={cssVarsRowStyle}>
      <span>Left</span>
      <Divider {...args} />
      <span>Right</span>
    </div>
  ),
  args: {
    orientation: 'vertical',
  },
};

export const SmallSpacing: Story = {
  args: {
    orientation: 'horizontal',
    spacing: 'small',
    label: 'tight',
  },
};

export const LargeSpacing: Story = {
  args: {
    orientation: 'horizontal',
    spacing: 'large',
    label: 'roomy',
  },
};

export const DarkMode: Story = {
  args: {
    orientation: 'horizontal',
    label: 'or continue with',
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

const cssVarsRowStyle = {
  display: 'flex',
  flexDirection: 'row' as const,
  alignItems: 'center',
  height: 'var(--spacing-32)',
};
