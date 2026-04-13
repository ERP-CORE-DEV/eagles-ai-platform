import { useMemo } from 'react';
import './Pagination.css';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Number of sibling pages to show on each side of the current page */
  siblingCount?: number;
  /** Additional CSS class names */
  className?: string;
}

const ELLIPSIS = 'ellipsis' as const;
type PageItem = number | typeof ELLIPSIS;

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => index + start);
}

function buildPages(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] {
  // Total slots = first + last + current + 2 * siblings + 2 * ellipsis
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftItemCount);
    return [...leftRange, ELLIPSIS, lastPage];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = range(totalPages - rightItemCount + 1, totalPages);
    return [firstPage, ELLIPSIS, ...rightRange];
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex);
  return [firstPage, ELLIPSIS, ...middleRange, ELLIPSIS, lastPage];
}

/**
 * Pagination — page navigation control with prev/next + numeric buttons.
 *
 * Uses smart truncation with sibling count and ellipsis. Prev/Next buttons are
 * icon-only with explicit aria-label. The current page button uses
 * aria-current="page".
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}: PaginationProps) {
  const pages = useMemo<PageItem[]>(
    () => buildPages(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  const classes = ['pagination', className].filter(Boolean).join(' ');

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav aria-label="Pagination" className={classes}>
      <ul className="pagination-list">
        <li className="pagination-item">
          <button
            type="button"
            className="pagination-button pagination-button-icon"
            aria-label="Page précédente"
            disabled={isFirst}
            onClick={() => goTo(currentPage - 1)}
          >
            <span className="pagination-icon" aria-hidden="true">
              ‹
            </span>
          </button>
        </li>
        {pages.map((item, index) => {
          if (item === ELLIPSIS) {
            const key = `ellipsis-${index}`;
            return (
              <li key={key} className="pagination-item">
                <span
                  className="pagination-ellipsis"
                  aria-hidden="true"
                  role="presentation"
                >
                  …
                </span>
              </li>
            );
          }
          const isCurrent = item === currentPage;
          return (
            <li key={item} className="pagination-item">
              <button
                type="button"
                className={[
                  'pagination-button',
                  isCurrent ? 'pagination-button-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Page ${item}`}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => goTo(item)}
              >
                {item}
              </button>
            </li>
          );
        })}
        <li className="pagination-item">
          <button
            type="button"
            className="pagination-button pagination-button-icon"
            aria-label="Page suivante"
            disabled={isLast}
            onClick={() => goTo(currentPage + 1)}
          >
            <span className="pagination-icon" aria-hidden="true">
              ›
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
