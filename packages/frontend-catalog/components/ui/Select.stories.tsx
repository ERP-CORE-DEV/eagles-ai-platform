import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Native <select> wrapper. Wrap in FormField for label, or pass `aria-label` directly.',
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

type Story = StoryObj<typeof Select>;

const CONTRACT_OPTIONS = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'cdic', label: 'CDIC' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'interim', label: 'Intérim' },
];

export const Default: Story = {
  args: {
    id: 'select-contract-default',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    placeholder: 'Select a contract type…',
    onChange: () => undefined,
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('cdi');
    return (
      <Select
        {...args}
        id="select-contract-controlled"
        name="contract"
        aria-label="Contract type"
        options={CONTRACT_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Invalid: Story = {
  args: {
    id: 'select-contract-invalid',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    placeholder: 'Select a contract type…',
    invalid: true,
    onChange: () => undefined,
  },
};

export const Disabled: Story = {
  args: {
    id: 'select-contract-disabled',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    value: 'cdi',
    disabled: true,
    onChange: () => undefined,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-stack">
      <Select
        id="select-size-small"
        name="size-small"
        aria-label="Small select"
        size="small"
        options={CONTRACT_OPTIONS}
        placeholder="Small"
        onChange={() => undefined}
      />
      <Select
        id="select-size-medium"
        name="size-medium"
        aria-label="Medium select"
        size="medium"
        options={CONTRACT_OPTIONS}
        placeholder="Medium"
        onChange={() => undefined}
      />
      <Select
        id="select-size-large"
        name="size-large"
        aria-label="Large select"
        size="large"
        options={CONTRACT_OPTIONS}
        placeholder="Large"
        onChange={() => undefined}
      />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    id: 'select-contract-dark',
    name: 'contract',
    'aria-label': 'Contract type',
    options: CONTRACT_OPTIONS,
    placeholder: 'Select a contract type…',
    onChange: () => undefined,
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
