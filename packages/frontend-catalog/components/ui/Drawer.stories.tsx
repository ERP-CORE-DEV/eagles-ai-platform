import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { Button } from './Button';

const meta: Meta<typeof Drawer> = {
  title: 'Layout/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Side sheet that slides in from the right with backdrop. role="dialog" aria-modal="true".',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

function DrawerDemo({ width, title }: { width?: 'sm' | 'md' | 'lg'; title?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="drawer-demo-wrap">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={title} width={width}>
        <p>This is the drawer body content.</p>
        <p>You can put forms, details, or any content here.</p>
      </Drawer>
    </div>
  );
}

export const Default: Story = {
  render: () => <DrawerDemo title="Drawer title" width="md" />,
};

export const Small: Story = {
  render: () => <DrawerDemo title="Small drawer" width="sm" />,
};

export const Large: Story = {
  render: () => <DrawerDemo title="Large drawer" width="lg" />,
};

export const NoTitle: Story = {
  render: () => <DrawerDemo width="md" />,
};

export const DarkMode: Story = {
  render: () => <DrawerDemo title="Drawer title" width="md" />,
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
