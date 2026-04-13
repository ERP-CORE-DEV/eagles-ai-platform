import './FilterBar.css';

export interface FilterItem {
  /** Stable filter id */
  id: string;
  /** Display label */
  label: string;
  /** Whether the filter is currently active */
  active: boolean;
}

export interface FilterBarProps {
  /** Filter list */
  filters: FilterItem[];
  /** Toggle handler — called with the filter id */
  onToggle: (id: string) => void;
  /** Optional clear-all handler — when present a clear button is rendered */
  onClearAll?: () => void;
  /** Accessible label for the toolbar */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * FilterBar — horizontal toolbar of filter pills.
 *
 * Each filter is a button with aria-pressed state. Optional clear-all
 * button when at least one filter is active.
 */
export function FilterBar({
  filters,
  onToggle,
  onClearAll,
  ariaLabel = 'Filtres',
  className = '',
}: FilterBarProps) {
  const classes = ['filter-bar', className].filter(Boolean).join(' ');
  const hasActive = filters.some((filter) => filter.active);

  return (
    <div className={classes} role="toolbar" aria-label={ariaLabel}>
      <div className="filter-bar-list">
        {filters.map((filter) => {
          const buttonClasses = [
            'filter-bar-pill',
            filter.active ? 'filter-bar-pill-active' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={filter.id}
              type="button"
              className={buttonClasses}
              aria-pressed={filter.active}
              onClick={() => onToggle(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      {onClearAll && hasActive && (
        <button
          type="button"
          className="filter-bar-clear"
          onClick={onClearAll}
          aria-label="Effacer tous les filtres"
        >
          Effacer
        </button>
      )}
    </div>
  );
}

export default FilterBar;
