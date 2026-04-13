import './KanbanBoard.css';

export interface KanbanCard {
  /** Stable card id */
  id: string;
  /** Card title (primary) */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional tag label */
  tag?: string;
}

export interface KanbanColumn {
  /** Stable column id */
  id: string;
  /** Column title */
  title: string;
  /** Cards in this column */
  cards: KanbanCard[];
}

export interface KanbanBoardProps {
  /** Columns to render */
  columns: KanbanColumn[];
  /** Optional move handler — fired when a card is moved (no drag-drop wired in this baseline) */
  onCardMove?: (cardId: string, toColumn: string) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * KanbanBoard — column-based task board.
 *
 * Renders a horizontal scroll of columns; each column is a section with
 * an aria-label and contains article cards. onCardMove is exposed for
 * future drag-drop wiring but is intentionally a no-op stub here.
 */
export function KanbanBoard({ columns, onCardMove, className = '' }: KanbanBoardProps) {
  // onCardMove is part of the public API for future drag-drop wiring;
  // referenced here so consumers and lint see the prop is intentional.
  void onCardMove;

  const classes = ['kanban-board', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" aria-label="Tableau Kanban">
      {columns.map((column) => (
        <section
          key={column.id}
          className="kanban-board-column"
          aria-label={`Colonne ${column.title}`}
        >
          <header className="kanban-board-column-header">
            <h3 className="kanban-board-column-title">{column.title}</h3>
            <span className="kanban-board-column-count" aria-label={`${column.cards.length} cartes`}>
              {column.cards.length}
            </span>
          </header>
          <ul className="kanban-board-column-list">
            {column.cards.map((card) => (
              <li key={card.id} className="kanban-board-card-item">
                <article className="kanban-board-card" aria-label={card.title}>
                  <h4 className="kanban-board-card-title">{card.title}</h4>
                  {card.subtitle && <p className="kanban-board-card-subtitle">{card.subtitle}</p>}
                  {card.tag && <span className="kanban-board-card-tag">{card.tag}</span>}
                </article>
              </li>
            ))}
            {column.cards.length === 0 && (
              <li className="kanban-board-empty">Aucune carte</li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default KanbanBoard;
