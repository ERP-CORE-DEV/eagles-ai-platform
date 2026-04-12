import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import StatusBadge, { STATE_COLORS, FRENCH_LABELS } from '../../components/ui/StatusBadge';

const ALL_STATUSES = Object.keys(STATE_COLORS);

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ALL_STATUSES,
      description: 'Status key — maps to STATE_COLORS and FRENCH_LABELS',
    },
    size: {
      control: 'select',
      options: ['small', 'default'],
    },
    showDot: { control: 'boolean' },
  },
  args: {
    status: 'Active',
    showDot: true,
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

/** Draft — Brouillon (default/gray) */
export const Draft: Story = { args: { status: 'Draft' } };

/** PendingReview — En révision (processing/blue) */
export const PendingReview: Story = { args: { status: 'PendingReview' } };

/** Approved — Approuvé (success/green) */
export const Approved: Story = { args: { status: 'Approved' } };

/** Rejected — Rejeté (error/red) */
export const Rejected: Story = { args: { status: 'Rejected' } };

/** Published — Publié (success/green) */
export const Published: Story = { args: { status: 'Published' } };

/** Active — Actif (success/green) */
export const Active: Story = { args: { status: 'Active' } };

/** Paused — En pause (warning/orange) */
export const Paused: Story = { args: { status: 'Paused' } };

/** Completed — Terminé (default/gray) */
export const Completed: Story = { args: { status: 'Completed' } };

/** Closed — Fermé (default/gray) */
export const Closed: Story = { args: { status: 'Closed' } };

/** Archived — Archivé (default/gray) */
export const Archived: Story = { args: { status: 'Archived' } };

/** Open — Ouvert (success/green) */
export const Open: Story = { args: { status: 'Open' } };

/** Expired — Expiré (warning/orange) */
export const Expired: Story = { args: { status: 'Expired' } };

/** Scheduled — Planifié (processing/blue) */
export const Scheduled: Story = { args: { status: 'Scheduled' } };

/** Cancelled — Annulé (error/red) */
export const Cancelled: Story = { args: { status: 'Cancelled' } };

/** InProgress — En cours (processing/blue) */
export const InProgress: Story = { args: { status: 'InProgress' } };

/** All 15 states in a grid — visual regression baseline */
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ALL_STATUSES.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const status of ALL_STATUSES) {
      const label = FRENCH_LABELS[status];
      const element = canvas.getByText(label);
      await expect(element).toBeInTheDocument();
    }
  },
};

/** Small size variant */
export const SmallSize: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ALL_STATUSES.map((status) => (
        <StatusBadge key={status} status={status} size="small" />
      ))}
    </div>
  ),
};

/** Without dot indicator */
export const NoDot: Story = {
  args: { status: 'Active', showDot: false },
};
