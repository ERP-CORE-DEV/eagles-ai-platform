import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelect } from './MultiSelect';

const meta: Meta<typeof MultiSelect> = {
  title: 'Forms/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Checkbox list dropdown. Trigger uses aria-haspopup="listbox", panel uses role="listbox" with role="option" items.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

const SKILL_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'node', label: 'Node.js' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubernetes', label: 'Kubernetes' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelect
        label="Required skills"
        placeholder="Pick skills…"
        options={SKILL_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Preselected: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['react', 'typescript']);
    return (
      <MultiSelect
        label="Required skills"
        placeholder="Pick skills…"
        options={SKILL_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Invalid: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelect
        label="Required skills"
        placeholder="At least one required"
        options={SKILL_OPTIONS}
        value={value}
        onChange={setValue}
        invalid
      />
    );
  },
};

export const DarkMode: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['react']);
    return (
      <MultiSelect
        label="Required skills"
        placeholder="Pick skills…"
        options={SKILL_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
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
