import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from './Button';
import './ExportButton.css';

export type ExportFormat = 'csv' | 'pdf' | 'xlsx';

const DEFAULT_FORMATS: ExportFormat[] = ['csv', 'pdf', 'xlsx'];

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV (.csv)',
  pdf: 'PDF (.pdf)',
  xlsx: 'Excel (.xlsx)',
};

export interface ExportButtonProps {
  /** Called with the chosen format. May return a promise; the button shows a loading state until it resolves. */
  onExport: (format: ExportFormat) => void | Promise<void>;
  /** Allowed export formats — defaults to all three */
  formats?: ExportFormat[];
  /** Visible label on the trigger button */
  label?: string;
  /** Disables the trigger button */
  disabled?: boolean;
}

/**
 * ExportButton — trigger button that opens a popover with format choices.
 *
 * Composes the base `Button` component. On format selection, calls `onExport`
 * with the chosen format and shows a transient loading state until the
 * promise resolves. Token-only styling, light + dark.
 */
export function ExportButton({
  onExport,
  formats = DEFAULT_FORMATS,
  label = 'Exporter',
  disabled = false,
}: ExportButtonProps) {
  const baseId = useId();
  const menuId = `${baseId}-menu`;
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (disabled || loading) return;
    setOpen((prev) => !prev);
  }, [disabled, loading]);

  const handleSelect = useCallback(
    async (format: ExportFormat) => {
      setOpen(false);
      setLoading(true);
      try {
        await onExport(format);
      } finally {
        setLoading(false);
      }
    },
    [onExport]
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  return (
    <div className="export-button" ref={containerRef}>
      <Button
        variant="secondary"
        size="medium"
        loading={loading}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      >
        {label}
      </Button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Choisir un format d'export"
          className="export-button-menu"
        >
          {formats.map((format) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              className="export-button-item"
              onClick={() => {
                void handleSelect(format);
              }}
            >
              {FORMAT_LABELS[format]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportButton;
