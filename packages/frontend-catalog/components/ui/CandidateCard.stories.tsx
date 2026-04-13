import type { Meta, StoryObj } from '@storybook/react';
import { CandidateCard } from './CandidateCard';

const meta: Meta<typeof CandidateCard> = {
  title: 'ERP/CandidateCard',
  component: CandidateCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'French HR candidate card. Renders identity, contract preference, experience, and an optional matching score.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    contractType: {
      control: 'select',
      options: ['CDI', 'CDD', 'CDIC', 'Freelance', 'Interim', 'Portage', 'Auto'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof CandidateCard>;

export const Default: Story = {
  args: {
    name: 'Amélie Dubois',
    role: 'Développeuse Full-Stack Senior',
    experience: '8 ans',
    contractType: 'CDI',
    location: 'Paris, Île-de-France',
    score: 92,
    onView: () => undefined,
  },
};

export const Freelance: Story = {
  args: {
    name: 'Mathieu Lefèvre',
    role: 'Consultant DevOps',
    experience: '12 ans',
    contractType: 'Freelance',
    location: 'Lyon, Auvergne-Rhône-Alpes',
    score: 86,
    onView: () => undefined,
  },
};

export const WithoutScore: Story = {
  args: {
    name: 'Sophie Marchand',
    role: 'Chargée de recrutement',
    experience: '4 ans',
    contractType: 'CDD',
    location: 'Bordeaux, Nouvelle-Aquitaine',
    onView: () => undefined,
  },
};

export const ContractTypes: Story = {
  render: () => (
    <div className="stories-row">
      <CandidateCard
        name="Léa Martin"
        role="Data Scientist"
        experience="6 ans"
        contractType="CDI"
        location="Paris"
        score={94}
      />
      <CandidateCard
        name="Hugo Bernard"
        role="Ingénieur QA"
        experience="3 ans"
        contractType="Interim"
        location="Marseille"
        score={71}
      />
      <CandidateCard
        name="Inès Petit"
        role="Designer UX"
        experience="5 ans"
        contractType="Portage"
        location="Nantes"
        score={88}
      />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    name: 'Amélie Dubois',
    role: 'Développeuse Full-Stack Senior',
    experience: '8 ans',
    contractType: 'CDI',
    location: 'Paris, Île-de-France',
    score: 92,
    onView: () => undefined,
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
