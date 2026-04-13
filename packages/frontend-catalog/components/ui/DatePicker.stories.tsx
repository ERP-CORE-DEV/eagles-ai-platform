import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Date selector built on the native HTML date input. Mirrors FormField label/error rendering. Format is ISO yyyy-mm-dd.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('2026-04-15');
    return <DatePicker label="Start date" value={value} onChange={setValue} />;
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [value, setValue] = useState('2026-06-01');
    return (
      <DatePicker
        label="Interview date"
        value={value}
        onChange={setValue}
        min="2026-05-01"
        max="2026-07-31"
        required
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('2020-01-01');
    return (
      <DatePicker
        label="Contract end date"
        value={value}
        onChange={setValue}
        error="End date must be in the future"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DatePicker label="Locked date" defaultValue="2026-03-15" disabled />
  ),
};

export const DarkMode: Story = {
  render: () => {
    const [value, setValue] = useState('2026-04-15');
    return <DatePicker label="Start date" value={value} onChange={setValue} />;
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
