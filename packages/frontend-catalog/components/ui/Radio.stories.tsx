import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/Radio',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Radio + RadioGroup. RadioGroup manages name + selected value; Radio renders a real native radio input with htmlFor label association.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('cdi');
    return (
      <RadioGroup
        name="contract-type"
        value={value}
        onChange={setValue}
        aria-label="Contract type"
      >
        <Radio value="cdi" label="CDI — permanent" />
        <Radio value="cdd" label="CDD — fixed term" />
        <Radio value="freelance" label="Freelance" />
      </RadioGroup>
    );
  },
};

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('remote');
    return (
      <RadioGroup
        name="work-mode"
        value={value}
        onChange={setValue}
        orientation="horizontal"
        aria-label="Work mode"
      >
        <Radio value="remote" label="Remote" />
        <Radio value="hybrid" label="Hybrid" />
        <Radio value="onsite" label="On-site" />
      </RadioGroup>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup name="status" defaultValue="active" aria-label="Status">
      <Radio value="active" label="Active" />
      <Radio value="paused" label="Paused" disabled />
      <Radio value="closed" label="Closed" disabled />
    </RadioGroup>
  ),
};

export const DarkMode: Story = {
  render: () => {
    const [value, setValue] = useState('cdi');
    return (
      <RadioGroup
        name="contract-type-dark"
        value={value}
        onChange={setValue}
        aria-label="Contract type"
      >
        <Radio value="cdi" label="CDI — permanent" />
        <Radio value="cdd" label="CDD — fixed term" />
        <Radio value="freelance" label="Freelance" />
      </RadioGroup>
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
