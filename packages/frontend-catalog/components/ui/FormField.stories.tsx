import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Forms/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Composed input with label, hint, and error state. Gold reference for the composed-component pattern.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    hint: "We'll never share your email.",
  },
};

export const Required: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Jane Doe',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: 'Password must be at least 12 characters.',
    defaultValue: 'short',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Employee ID',
    defaultValue: 'EMP-00421',
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-stack">
      <FormField size="small" label="Small" placeholder="Compact field" />
      <FormField size="medium" label="Medium" placeholder="Default field" />
      <FormField size="large" label="Large" placeholder="Emphasis field" />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    hint: "We'll never share your email.",
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
