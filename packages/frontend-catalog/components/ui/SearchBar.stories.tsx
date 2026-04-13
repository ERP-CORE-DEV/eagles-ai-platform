import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'ERP/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Debounced search input with leading icon and optional clear button. Supports controlled and uncontrolled modes.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SearchBar>;

function ControlledDemo({ placeholder }: { placeholder?: string }) {
  const [value, setValue] = useState<string>('');
  const [lastSearch, setLastSearch] = useState<string>('');
  return (
    <div className="search-bar-demo">
      <SearchBar
        value={value}
        onChange={setValue}
        onSearch={setLastSearch}
        placeholder={placeholder}
        debounceMs={300}
      />
      <p className="search-bar-demo-debug">
        Valeur en cours : <strong>{value || '(vide)'}</strong>
      </p>
      <p className="search-bar-demo-debug">
        Dernière recherche (debounced) : <strong>{lastSearch || '(aucune)'}</strong>
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <ControlledDemo placeholder="Rechercher un candidat (nom, compétence, ville)…" />,
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'Marie Dupont',
    placeholder: 'Rechercher un candidat…',
    onSearch: (q) => {
      // eslint-disable-next-line no-console
      console.log('search:', q);
    },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Rechercher un candidat…',
    disabled: true,
  },
};

export const DarkMode: Story = {
  render: () => <ControlledDemo placeholder="Rechercher un candidat (nom, compétence, ville)…" />,
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
