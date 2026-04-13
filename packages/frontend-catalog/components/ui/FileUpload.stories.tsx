import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Drag-drop + click file picker. Wraps a real native file input behind a label dropzone. Lists selected files and validates max size.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  render: () => (
    <FileUpload
      label="Resume"
      hint="PDF or DOCX, up to 5 MB"
      accept=".pdf,.doc,.docx"
      maxSize={5 * 1024 * 1024}
    />
  ),
};

export const Multiple: Story = {
  render: () => (
    <FileUpload
      label="Supporting documents"
      hint="Images and PDFs accepted"
      accept="image/*,.pdf"
      multiple
      maxSize={10 * 1024 * 1024}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <FileUpload label="Locked upload" hint="Submission window closed" disabled />
  ),
};

export const DarkMode: Story = {
  render: () => (
    <FileUpload
      label="Resume"
      hint="PDF or DOCX, up to 5 MB"
      accept=".pdf,.doc,.docx"
      maxSize={5 * 1024 * 1024}
    />
  ),
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
