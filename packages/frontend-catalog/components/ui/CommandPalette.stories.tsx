import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette } from './CommandPalette';
import type { CommandPaletteCommand } from './CommandPalette';
import { Button } from './Button';

const meta: Meta<typeof CommandPalette> = {
  title: 'Feedback/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Modal-style command launcher (Cmd+K UX). Filters commands by case-insensitive substring. ArrowUp/Down navigate, Enter runs, Escape closes.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CommandPalette>;

function buildCommands(setLast: (v: string) => void): CommandPaletteCommand[] {
  const run = (label: string) => () => setLast(label);
  return [
    {
      id: 'new-candidate',
      label: 'Créer un nouveau candidat',
      hint: 'Ctrl+N',
      group: 'Candidats',
      onRun: run('Créer un nouveau candidat'),
    },
    {
      id: 'import-cv',
      label: 'Importer un CV (PDF / DOCX)',
      hint: 'Ctrl+I',
      group: 'Candidats',
      onRun: run('Importer un CV'),
    },
    {
      id: 'new-job',
      label: 'Publier une offre d\u2019emploi',
      hint: 'Ctrl+J',
      group: 'Offres',
      onRun: run('Publier une offre'),
    },
    {
      id: 'matching-run',
      label: 'Lancer un matching candidat \u2192 offre',
      hint: 'Ctrl+M',
      group: 'Matching',
      onRun: run('Lancer un matching'),
    },
    {
      id: 'export-csv',
      label: 'Exporter le pipeline (CSV)',
      hint: 'Ctrl+E',
      group: 'Export',
      onRun: run('Exporter en CSV'),
    },
    {
      id: 'open-gdpr',
      label: 'Ouvrir le journal RGPD',
      hint: 'Ctrl+G',
      group: 'Conformit\u00e9',
      onRun: run('Ouvrir le journal RGPD'),
    },
  ];
}

function PaletteDemo() {
  const [open, setOpen] = useState<boolean>(true);
  const [last, setLast] = useState<string>('');
  const commands = buildCommands(setLast);
  return (
    <div className="command-palette-demo-wrap">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Ouvrir la palette (Cmd+K)
      </Button>
      <p>Dernière commande exécutée : <strong>{last || '(aucune)'}</strong></p>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={commands}
        placeholder="Tapez une commande…"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <PaletteDemo />,
};

export const Empty: Story = {
  render: () => {
    const PaletteEmpty = () => {
      const [open, setOpen] = useState<boolean>(true);
      return (
        <div className="command-palette-demo-wrap">
          <Button variant="primary" onClick={() => setOpen(true)}>
            Ouvrir la palette
          </Button>
          <CommandPalette
            open={open}
            onClose={() => setOpen(false)}
            commands={[]}
            placeholder="Aucune commande disponible…"
          />
        </div>
      );
    };
    return <PaletteEmpty />;
  },
};

export const DarkMode: Story = {
  render: () => <PaletteDemo />,
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
