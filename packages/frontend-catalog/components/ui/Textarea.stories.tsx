import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Standalone multiline input. Wrap in FormField for label + hint, or pass `aria-label` directly.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    invalid: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    'aria-label': 'Job description',
    placeholder: 'Describe the role…',
    name: 'description',
    rows: 5,
  },
};

export const Invalid: Story = {
  args: {
    'aria-label': 'Job description',
    placeholder: 'Describe the role…',
    invalid: true,
    defaultValue: 'too short',
  },
};

export const AutoResize: Story = {
  args: {
    'aria-label': 'Notes',
    placeholder: 'Type to grow…',
    autoResize: true,
    defaultValue: 'This textarea grows as you type.',
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Locked notes',
    defaultValue: 'Read-only content.',
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-stack">
      <Textarea size="small" aria-label="Small" placeholder="Small" />
      <Textarea size="medium" aria-label="Medium" placeholder="Medium" />
      <Textarea size="large" aria-label="Large" placeholder="Large" />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    'aria-label': 'Job description',
    placeholder: 'Describe the role…',
    name: 'description',
    rows: 5,
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
