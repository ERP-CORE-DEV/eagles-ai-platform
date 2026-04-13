import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Data/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Progress — linear progress bar with optional label, percentage, and tone variants. Token-only.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 60,
    label: 'Profil complété',
    showValue: true,
  },
};

export const Small: Story = {
  args: {
    value: 35,
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    value: 80,
    size: 'large',
    label: 'Téléchargement',
    showValue: true,
  },
};

export const Success: Story = {
  args: {
    value: 100,
    tone: 'success',
    label: 'Validation',
    showValue: true,
  },
};

export const Warning: Story = {
  args: {
    value: 65,
    tone: 'warning',
    label: 'Quota utilisé',
    showValue: true,
  },
};

export const ErrorTone: Story = {
  args: {
    value: 92,
    tone: 'error',
    label: 'Espace disque',
    showValue: true,
  },
};

export const Indeterminate: Story = {
  args: {
    value: 0,
    label: 'En attente',
  },
};

export const CustomMax: Story = {
  args: {
    value: 7,
    max: 10,
    label: 'Étapes',
    showValue: true,
  },
};

export const DarkMode: Story = {
  args: {
    value: 60,
    label: 'Profil complété',
    showValue: true,
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
