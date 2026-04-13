import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top-level page shell with sidebar slot, header slot, and main content area.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AppShell>;

const sidebarContent = (
  <nav className="app-shell-demo-nav">
    <span className="app-shell-demo-brand">EAGLES</span>
    <a className="app-shell-demo-link" href="#dashboard">
      Dashboard
    </a>
    <a className="app-shell-demo-link" href="#candidates">
      Candidates
    </a>
    <a className="app-shell-demo-link" href="#jobs">
      Jobs
    </a>
  </nav>
);

const headerContent = (
  <div className="app-shell-demo-header">
    <span className="app-shell-demo-title">Recruitment Console</span>
    <span className="app-shell-demo-user">Hatim H.</span>
  </div>
);

const mainContent = (
  <div className="app-shell-demo-main">
    <h1>Welcome</h1>
    <p>This is the main content area of the AppShell.</p>
  </div>
);

export const Default: Story = {
  args: {
    sidebar: sidebarContent,
    header: headerContent,
    children: mainContent,
  },
};

export const HeaderOnly: Story = {
  args: {
    header: headerContent,
    children: mainContent,
  },
};

export const SidebarOnly: Story = {
  args: {
    sidebar: sidebarContent,
    children: mainContent,
  },
};

export const DarkMode: Story = {
  args: {
    sidebar: sidebarContent,
    header: headerContent,
    children: mainContent,
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
