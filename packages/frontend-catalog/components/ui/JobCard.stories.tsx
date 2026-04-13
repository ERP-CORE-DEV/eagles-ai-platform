import type { Meta, StoryObj } from '@storybook/react';
import { JobCard } from './JobCard';

const meta: Meta<typeof JobCard> = {
  title: 'ERP/JobCard',
  component: JobCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'French job posting card. Renders title, company, location, contract pill, salary range, and an optional matching score.',
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

type Story = StoryObj<typeof JobCard>;

export const Default: Story = {
  args: {
    title: 'Lead Développeur React',
    company: 'OptimERP SAS',
    location: 'Paris, Île-de-France',
    contractType: 'CDI',
    salaryMin: 55,
    salaryMax: 70,
    postedAgo: 'il y a 3 jours',
    matchScore: 91,
    onApply: () => undefined,
  },
};

export const FreelanceMission: Story = {
  args: {
    title: 'Architecte Cloud Azure',
    company: 'Banque Lambert & Fils',
    location: 'Lyon, Auvergne-Rhône-Alpes',
    contractType: 'Freelance',
    salaryMin: 650,
    salaryMax: 750,
    postedAgo: 'il y a 1 jour',
    matchScore: 84,
    onApply: () => undefined,
  },
};

export const WithoutSalary: Story = {
  args: {
    title: 'Chargé de mission RH',
    company: 'Mairie de Bordeaux',
    location: 'Bordeaux, Nouvelle-Aquitaine',
    contractType: 'CDD',
    postedAgo: 'il y a 1 semaine',
    onApply: () => undefined,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="stories-row">
      <JobCard
        title="Ingénieur DevOps"
        company="StartCloud"
        location="Toulouse"
        contractType="CDI"
        salaryMin={50}
        salaryMax={65}
        postedAgo="il y a 2 jours"
        matchScore={88}
      />
      <JobCard
        title="Consultant SAP"
        company="Conseil Plus"
        location="Nantes"
        contractType="Portage"
        salaryMin={500}
        salaryMax={600}
        postedAgo="il y a 5 jours"
        matchScore={76}
      />
      <JobCard
        title="Technicien support"
        company="Industrie Métallique"
        location="Lille"
        contractType="Interim"
        salaryMin={28}
        salaryMax={32}
        postedAgo="il y a 6 heures"
        matchScore={62}
      />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    title: 'Lead Développeur React',
    company: 'OptimERP SAS',
    location: 'Paris, Île-de-France',
    contractType: 'CDI',
    salaryMin: 55,
    salaryMax: 70,
    postedAgo: 'il y a 3 jours',
    matchScore: 91,
    onApply: () => undefined,
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
