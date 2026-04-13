import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { Button } from './Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Page-level header with title, subtitle, optional breadcrumb, and optional actions slot.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Candidates',
    subtitle: 'Manage your active candidate pipeline',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Candidates',
    subtitle: 'Manage your active candidate pipeline',
    actions: (
      <>
        <Button variant="secondary">Export</Button>
        <Button variant="primary">New candidate</Button>
      </>
    ),
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: 'Edit candidate',
    subtitle: 'Update profile information',
    breadcrumb: <span>Candidates / Jane Doe / Edit</span>,
  },
};

export const Full: Story = {
  args: {
    title: 'Edit candidate',
    subtitle: 'Update profile information',
    breadcrumb: <span>Candidates / Jane Doe / Edit</span>,
    actions: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </>
    ),
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Candidates',
    subtitle: 'Manage your active candidate pipeline',
    actions: (
      <>
        <Button variant="secondary">Export</Button>
        <Button variant="primary">New candidate</Button>
      </>
    ),
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
