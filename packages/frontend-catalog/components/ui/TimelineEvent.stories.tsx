import type { Meta, StoryObj } from '@storybook/react';
import { TimelineEvent } from './TimelineEvent';

const meta: Meta<typeof TimelineEvent> = {
  title: 'ERP/TimelineEvent',
  component: TimelineEvent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Single event in a vertical timeline. Wrap multiple events in a <ol role="list"> to compose a full timeline.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'error'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof TimelineEvent>;

export const Default: Story = {
  render: () => (
    <ol role="list" className="timeline-demo-list">
      <TimelineEvent
        time="12 mars 2026 — 09:14"
        title="Candidature reçue"
        description="Marie Dupont a postulé au poste de Développeuse Full-Stack (CDI)."
        tone="info"
      />
      <TimelineEvent
        time="12 mars 2026 — 11:42"
        title="Pré-qualification téléphonique"
        description="Entretien de 30 min réalisé par Hatim Hajji. Score de matching : 87%."
        tone="default"
      />
      <TimelineEvent
        time="13 mars 2026 — 15:00"
        title="Entretien technique validé"
        description="Test technique React + .NET réussi avec 18/20."
        tone="success"
      />
      <TimelineEvent
        time="14 mars 2026 — 10:30"
        title="Proposition d'embauche envoyée"
        description="CDI, période d'essai 4 mois, salaire 48 000 € brut annuel."
        tone="success"
        isLast
      />
    </ol>
  ),
};

export const AllTones: Story = {
  render: () => (
    <ol role="list" className="timeline-demo-list">
      <TimelineEvent time="Étape 1" title="Default tone" tone="default" />
      <TimelineEvent time="Étape 2" title="Info tone" tone="info" />
      <TimelineEvent time="Étape 3" title="Success tone" tone="success" />
      <TimelineEvent time="Étape 4" title="Warning tone" tone="warning" />
      <TimelineEvent time="Étape 5" title="Error tone" tone="error" isLast />
    </ol>
  ),
};

export const SingleEvent: Story = {
  render: () => (
    <ol role="list" className="timeline-demo-list">
      <TimelineEvent
        time="14 mars 2026 — 10:30"
        title="Contrat signé"
        description="Date d'entrée prévue : 1er avril 2026."
        tone="success"
        isLast
      />
    </ol>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <ol role="list" className="timeline-demo-list">
      <TimelineEvent
        time="12 mars 2026 — 09:14"
        title="Candidature reçue"
        description="Marie Dupont a postulé au poste de Développeuse Full-Stack (CDI)."
        tone="info"
      />
      <TimelineEvent
        time="12 mars 2026 — 11:42"
        title="Pré-qualification téléphonique"
        description="Entretien de 30 min réalisé par Hatim Hajji. Score de matching : 87%."
        tone="default"
      />
      <TimelineEvent
        time="13 mars 2026 — 15:00"
        title="Entretien technique validé"
        description="Test technique React + .NET réussi avec 18/20."
        tone="success"
        isLast
      />
    </ol>
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
