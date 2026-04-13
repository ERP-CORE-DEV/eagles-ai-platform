import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Scrollable wrapper with optional max-height and max-width and token-styled scrollbars.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

const longText = Array.from({ length: 30 }, (_, i) => (
  <p key={i}>
    Line {i + 1} — scrollable content rendered inside the ScrollArea wrapper to
    demonstrate token-styled scrollbars and overflow handling.
  </p>
));

const wideContent = (
  <div className="scroll-area-demo-wide">
    {Array.from({ length: 20 }, (_, i) => (
      <span key={i} className="scroll-area-demo-wide-cell">
        Column {i + 1}
      </span>
    ))}
  </div>
);

export const Default: Story = {
  args: {
    maxHeight: 240,
    children: longText,
  },
};

export const FixedHeightString: Story = {
  args: {
    maxHeight: '320px',
    children: longText,
  },
};

export const HorizontalScroll: Story = {
  args: {
    maxWidth: 400,
    children: wideContent,
  },
};

export const BothAxes: Story = {
  args: {
    maxHeight: 200,
    maxWidth: 400,
    children: (
      <div className="scroll-area-demo-grid">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className="scroll-area-demo-grid-cell">
            Cell {i + 1}
          </span>
        ))}
      </div>
    ),
  },
};

export const DarkMode: Story = {
  args: {
    maxHeight: 240,
    children: longText,
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
