import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import Button from '../../components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Visual variant — maps to design token color families',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
  },
  args: {
    onClick: fn(),
    children: 'Bouton',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Default primary button — violet (#7c3aed) */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Ajouter un candidat',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Secondary variant — subtle background for non-primary actions */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Annuler',
  },
};

/** Success variant — emerald green for confirmations */
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Valider le CDI',
  },
};

/** Danger variant — rose for destructive actions */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Supprimer',
  },
};

/** Warning variant — amber for caution states */
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Attention CDD',
  },
};

/** Info variant — blue for informational actions */
export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Voir le profil',
  },
};

/** Loading state — spinner + disabled interaction */
export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Enregistrement...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

/** Disabled state */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Indisponible',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
  },
};

/** All sizes side by side */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="small">Petit</Button>
      <Button size="medium">Moyen</Button>
      <Button size="large">Grand</Button>
    </div>
  ),
};

/** All 6 variants in a row — visual regression baseline */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
    </div>
  ),
};
