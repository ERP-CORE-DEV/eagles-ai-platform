import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Toggle switch with custom track + thumb styling. Renders a real native checkbox with role="switch" for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    size: { control: 'radio', options: ['small', 'medium'] },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch label="Enable notifications" checked={checked} onChange={setChecked} />;
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Auto-save drafts" checked={checked} onChange={setChecked} />;
  },
};

export const Small: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Compact mode" checked={checked} onChange={setChecked} size="small" />;
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="stories-stack">
      <Switch label="Disabled off" checked={false} onChange={() => undefined} disabled />
      <Switch label="Disabled on" checked onChange={() => undefined} disabled />
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch label="Enable notifications" checked={checked} onChange={setChecked} />;
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
