import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    onClick: fn(),
    children: 'Bouton',
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { variant: 'primary', children: 'Ajouter un candidat' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Annuler' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Valider le CDI' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Supprimer' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Attention CDD' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'Voir le profil' },
};

export const Loading: Story = {
  args: { variant: 'primary', loading: true, children: 'Enregistrement...' },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, children: 'Indisponible' },
};

export const Sizes: Story = {
  render: () => (
    <div className="stories-row">
      <Button size="small">Petit</Button>
      <Button size="medium">Moyen</Button>
      <Button size="large">Grand</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="stories-row">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
    </div>
  ),
};

export const DarkMode: Story = {
  args: { variant: 'primary', children: 'Ajouter un candidat' },
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
