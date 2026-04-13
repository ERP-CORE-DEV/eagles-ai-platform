import { useId, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import './FileUpload.css';

export interface FileUploadProps {
  /** Accepted MIME types or extensions (e.g. "image/*,.pdf") */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes — files larger than this are rejected */
  maxSize?: number;
  /** Callback fired with the validated file list */
  onFiles?: (files: File[]) => void;
  /** Visible label rendered above the dropzone */
  label?: string;
  /** Hint text rendered inside the dropzone */
  hint?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Stable id for label association (auto-generated when omitted) */
  id?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FileUpload — drag-drop + click file picker.
 *
 * Renders a real native file input visually hidden but kept in the
 * accessibility tree, paired with a label that doubles as the dropzone.
 * Selected file names are listed below the dropzone.
 */
export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onFiles,
  label,
  hint,
  disabled = false,
  id: providedId,
}: FileUploadProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateAndSet = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const list = Array.from(incoming);
    if (maxSize !== undefined) {
      const tooLarge = list.find((file) => file.size > maxSize);
      if (tooLarge) {
        setErrorMessage(
          `${tooLarge.name} exceeds the maximum size of ${formatBytes(maxSize)}`,
        );
        return;
      }
    }
    setErrorMessage('');
    setSelectedFiles(list);
    onFiles?.(list);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateAndSet(event.target.files);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndSet(event.dataTransfer.files);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const dropzoneClasses = [
    'file-upload-dropzone',
    isDragging ? 'file-upload-dropzone-dragging' : '',
    disabled ? 'file-upload-dropzone-disabled' : '',
    errorMessage ? 'file-upload-dropzone-invalid' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="file-upload">
      {label && (
        <span className="file-upload-label" id={`${id}-label`}>
          {label}
        </span>
      )}
      <label
        htmlFor={id}
        className={dropzoneClasses}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <span className="file-upload-prompt">
          <strong>Click to upload</strong>
          {' or drag and drop'}
        </span>
        {hint && <span className="file-upload-hint">{hint}</span>}
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="file-upload-input"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          onChange={handleInputChange}
        />
      </label>
      {errorMessage && (
        <p id={`${id}-error`} className="file-upload-error" role="alert">
          {errorMessage}
        </p>
      )}
      {selectedFiles.length > 0 && (
        <ul className="file-upload-list">
          {selectedFiles.map((file) => (
            <li key={`${file.name}-${file.size}`} className="file-upload-list-item">
              <span className="file-upload-file-name">{file.name}</span>
              <span className="file-upload-file-size">{formatBytes(file.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileUpload;
