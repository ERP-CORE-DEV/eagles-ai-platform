import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Single labelled checkbox. Renders a real native checkbox input with htmlFor label association. Supports indeterminate.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox label="Accept terms and conditions" checked={checked} onChange={setChecked} />
    );
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Checkbox label="Subscribe to newsletter" checked={checked} onChange={setChecked} />;
  },
};

export const Indeterminate: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="Select all rows"
        checked={checked}
        onChange={setChecked}
        indeterminate
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="stories-stack">
      <Checkbox label="Disabled unchecked" checked={false} onChange={() => undefined} disabled />
      <Checkbox label="Disabled checked" checked onChange={() => undefined} disabled />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="You must accept the terms"
        checked={checked}
        onChange={setChecked}
        invalid
      />
    );
  },
};

export const DarkMode: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox label="Accept terms and conditions" checked={checked} onChange={setChecked} />
    );
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
