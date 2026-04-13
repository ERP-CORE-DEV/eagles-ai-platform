import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Linear progress indicator for multi-step workflows. Marks current step with aria-current="step".',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Stepper>;

const baseSteps = [
  {
    id: 'identity',
    label: 'Identité',
    description: 'Informations personnelles',
  },
  {
    id: 'experience',
    label: 'Expérience',
    description: 'Parcours professionnel',
  },
  {
    id: 'skills',
    label: 'Compétences',
    description: 'Savoir-faire et certifications',
  },
  {
    id: 'review',
    label: 'Validation',
    description: 'Vérification finale',
  },
];

export const Default: Story = {
  args: {
    steps: baseSteps,
    currentIndex: 1,
  },
};

export const FirstStep: Story = {
  args: {
    steps: baseSteps,
    currentIndex: 0,
  },
};

export const LastStep: Story = {
  args: {
    steps: baseSteps,
    currentIndex: 3,
  },
};

export const Interactive: Story = {
  args: {
    steps: baseSteps,
    currentIndex: 2,
    onStepClick: (index: number) => {
      // eslint-disable-next-line no-console
      console.log('Step clicked', index);
    },
  },
};

export const DarkMode: Story = {
  args: {
    steps: baseSteps,
    currentIndex: 1,
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
