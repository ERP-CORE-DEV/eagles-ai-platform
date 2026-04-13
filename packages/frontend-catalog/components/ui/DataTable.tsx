import type { ReactNode } from 'react';
import './DataTable.css';

export type DataTableAlign = 'left' | 'right' | 'center';

export interface DataTableColumn<T> {
  /** Unique column key — used for header and React key */
  key: string;
  /** Column header text */
  header: string;
  /** Optional cell renderer — receives the row */
  render?: (row: T) => ReactNode;
  /** Cell text alignment */
  align?: DataTableAlign;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  rows: T[];
  /** Stable key extractor for each row */
  rowKey: (row: T) => string;
  /** Empty-state content (rendered when rows is empty) */
  empty?: ReactNode;
  /** Optional row click handler — wraps row in interactive semantics */
  onRowClick?: (row: T) => void;
  /** Additional CSS class names */
  className?: string;
}

function defaultCell<T>(row: T, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key];
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

/**
 * DataTable — typed generic table with semantic <table> markup.
 *
 * Token-only styling, light + dark via data-theme="dark".
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const classes = ['data-table', className].filter(Boolean).join(' ');
  const isClickable = Boolean(onRowClick);

  if (rows.length === 0) {
    return (
      <div className={classes}>
        <table className="data-table-table">
          <thead className="data-table-thead">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`data-table-th data-table-align-${col.align ?? 'left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="data-table-empty" role="status">
          {empty ?? 'Aucune donnée'}
        </div>
      </div>
    );
  }

  return (
    <div className={classes}>
      <table className="data-table-table">
        <thead className="data-table-thead">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`data-table-th data-table-align-${col.align ?? 'left'}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const rowClasses = [
              'data-table-tr',
              isClickable ? 'data-table-tr-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ');

            const handleClick = () => {
              if (onRowClick) onRowClick(row);
            };
            const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (!onRowClick) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRowClick(row);
              }
            };

            return (
              <tr
                key={key}
                className={rowClasses}
                onClick={isClickable ? handleClick : undefined}
                onKeyDown={isClickable ? handleKeyDown : undefined}
                tabIndex={isClickable ? 0 : undefined}
                role={isClickable ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`data-table-td data-table-align-${col.align ?? 'left'}`}
                  >
                    {col.render ? col.render(row) : defaultCell(row, col.key)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
