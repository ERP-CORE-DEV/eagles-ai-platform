import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Standalone text input. Wrap in FormField for label + hint, or pass `aria-label` directly.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    'aria-label': 'Email',
    placeholder: 'you@example.com',
    name: 'email',
  },
};

export const Invalid: Story = {
  args: {
    'aria-label': 'Email',
    placeholder: 'you@example.com',
    invalid: true,
    defaultValue: 'not-an-email',
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Employee ID',
    defaultValue: 'EMP-00421',
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-stack">
      <Input size="small" aria-label="Small input" placeholder="Small" />
      <Input size="medium" aria-label="Medium input" placeholder="Medium" />
      <Input size="large" aria-label="Large input" placeholder="Large" />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    'aria-label': 'Email',
    placeholder: 'you@example.com',
    name: 'email',
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
