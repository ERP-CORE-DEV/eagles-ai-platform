import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Layout/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Centered dialog with backdrop. role="dialog" aria-modal="true" aria-labelledby on title.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

function ModalDemo({ size, title }: { size?: 'sm' | 'md' | 'lg'; title?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="modal-demo-wrap">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} size={size}>
        <p>This is the modal body content.</p>
        <p>Use modals for confirmations, short forms, or focused decisions.</p>
      </Modal>
    </div>
  );
}

export const Default: Story = {
  render: () => <ModalDemo title="Confirm action" size="md" />,
};

export const Small: Story = {
  render: () => <ModalDemo title="Small modal" size="sm" />,
};

export const Large: Story = {
  render: () => <ModalDemo title="Large modal" size="lg" />,
};

export const NoTitle: Story = {
  render: () => <ModalDemo size="md" />,
};

export const DarkMode: Story = {
  render: () => <ModalDemo title="Confirm action" size="md" />,
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
