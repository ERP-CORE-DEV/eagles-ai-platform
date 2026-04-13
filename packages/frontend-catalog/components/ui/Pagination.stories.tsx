import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Page navigation with smart truncation, prev/next icon buttons, and aria-current="page" on the active page.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Pagination>;

function InteractivePagination(props: {
  totalPages: number;
  initialPage?: number;
  siblingCount?: number;
}) {
  const [page, setPage] = useState<number>(props.initialPage ?? 1);
  return (
    <Pagination
      currentPage={page}
      totalPages={props.totalPages}
      onPageChange={setPage}
      siblingCount={props.siblingCount}
    />
  );
}

export const Default: Story = {
  render: () => <InteractivePagination totalPages={10} initialPage={1} />,
};

export const Middle: Story = {
  render: () => <InteractivePagination totalPages={20} initialPage={10} />,
};

export const LastPage: Story = {
  render: () => <InteractivePagination totalPages={15} initialPage={15} />,
};

export const FewPages: Story = {
  render: () => <InteractivePagination totalPages={3} initialPage={2} />,
};

export const ManyPages: Story = {
  render: () => <InteractivePagination totalPages={100} initialPage={50} siblingCount={2} />,
};

export const DarkMode: Story = {
  render: () => <InteractivePagination totalPages={10} initialPage={3} />,
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
