import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hover/focus tooltip that appears via pure CSS. Wires aria-describedby on the trigger so screen readers announce the content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Save and publish',
    placement: 'top',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Publish</Button>
    </Tooltip>
  ),
};

export const Right: Story = {
  args: {
    content: 'Opens in a new tab',
    placement: 'right',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Open</Button>
    </Tooltip>
  ),
};

export const Bottom: Story = {
  args: {
    content: 'This action is irreversible',
    placement: 'bottom',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="danger">Delete</Button>
    </Tooltip>
  ),
};

export const Left: Story = {
  args: {
    content: 'Move to next stage',
    placement: 'left',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="success">Approve</Button>
    </Tooltip>
  ),
};

export const DarkMode: Story = {
  args: {
    content: 'Save and publish',
    placement: 'top',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Publish</Button>
    </Tooltip>
  ),
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
