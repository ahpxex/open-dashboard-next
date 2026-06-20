"use client";

import {
  FileArrowUpIcon,
  FileIcon,
  SpinnerGapIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type DragEvent, type ReactNode, useId, useRef, useState } from "react";
import { type AnyForm, FormField } from "@/components/form";
import {
  dataUrlStorage,
  type StorageAdapter,
  type StoredFile,
} from "@/infra/storage/storage";
import { cn } from "@/lib/utils";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(file: StoredFile): boolean {
  return (
    file.url.startsWith("data:image/") ||
    /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(file.name)
  );
}

interface FileUploadProps {
  /** Stored files; controlled. */
  value: StoredFile[];
  onChange: (files: StoredFile[]) => void;
  /** Storage backend; defaults to zero-config browser data-URL storage. */
  storage?: StorageAdapter;
  /** Allow selecting / holding more than one file. */
  multiple?: boolean;
  /** `accept` attribute passed to the file input (e.g. "image/*"). */
  accept?: string;
  /** Hint shown under the drop zone (size/type guidance). */
  hint?: ReactNode;
  /** Render the preview as a single avatar tile (single-image use). */
  avatar?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Standalone drag-and-drop OR click-to-pick upload control. Renders an image
 * thumbnail for images and a file chip otherwise, each with a remove button.
 * Fully controlled via `value`/`onChange`; uploads each picked file through the
 * passed `StorageAdapter` (default `dataUrlStorage`) and reports the resulting
 * `StoredFile`s. Use directly, or via `FileField` to bind it to a form.
 */
export function FileUpload({
  value,
  onChange,
  storage = dataUrlStorage,
  multiple = false,
  accept,
  hint,
  avatar = false,
  disabled = false,
  id,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  async function ingest(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList);
    setBusy(true);
    try {
      const stored = await Promise.all(picked.map((f) => storage.upload(f)));
      onChange(multiple ? [...value, ...stored] : stored.slice(0, 1));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled || busy) return;
    void ingest(e.dataTransfer.files);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const empty = value.length === 0;
  const showDrop = empty || multiple;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => void ingest(e.target.files)}
      />

      {showDrop ? (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors outline-none hover:border-primary hover:bg-muted focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            avatar && "size-28 shrink-0 self-start p-2",
            dragging && "border-primary bg-primary/5",
          )}
        >
          {busy ? (
            <SpinnerGapIcon
              size={avatar ? 20 : 24}
              className="animate-spin text-muted-foreground"
            />
          ) : (
            <FileArrowUpIcon
              size={avatar ? 20 : 24}
              className="text-muted-foreground"
            />
          )}
          {!avatar && (
            <span className="text-xs text-foreground">
              <span className="font-medium text-primary">Click to upload</span>{" "}
              or drag and drop
            </span>
          )}
          {hint ? (
            <span className="text-[11px] text-muted-foreground">{hint}</span>
          ) : null}
        </button>
      ) : null}

      {!empty ? (
        <ul
          className={cn("flex flex-col gap-2", avatar && "flex-row flex-wrap")}
        >
          {value.map((file, index) => (
            <li
              key={`${file.url}-${index}`}
              className={cn(
                "group/file flex items-center gap-3 border border-border bg-card p-2",
                avatar && "relative size-28 shrink-0 p-0",
              )}
            >
              {isImage(file) ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className={cn(
                    "size-10 shrink-0 border border-border object-cover",
                    avatar && "size-full border-0",
                  )}
                />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center bg-muted text-muted-foreground">
                  <FileIcon size={18} />
                </span>
              )}

              {!avatar ? (
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatSize(file.size)}
                  </span>
                </div>
              ) : null}

              {!disabled ? (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${file.name}`}
                  className={cn(
                    "grid size-6 shrink-0 place-items-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                    avatar &&
                      "absolute top-1 right-1 bg-card/80 opacity-0 group-hover/file:opacity-100",
                  )}
                >
                  <XIcon size={14} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

interface FileFieldProps {
  form: AnyForm;
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  storage?: StorageAdapter;
  multiple?: boolean;
  accept?: string;
  hint?: ReactNode;
  avatar?: boolean;
}

/**
 * Form-bound file upload. Wraps `FileUpload` in the form system's `FormField`
 * (label + error + description), reading/writing the field value as a
 * `StoredFile[]`. Drop into a TanStack Form like any other bound field.
 */
export function FileField({
  form,
  name,
  label,
  description,
  required,
  storage,
  multiple,
  accept,
  hint,
  avatar,
}: FileFieldProps) {
  const fieldId = useId();
  return (
    <FormField
      form={form}
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <FileUpload
          id={fieldId}
          value={(field.state.value as StoredFile[] | undefined) ?? []}
          onChange={(files) => {
            field.handleChange(files);
            field.handleBlur();
          }}
          storage={storage}
          multiple={multiple}
          accept={accept}
          hint={hint}
          avatar={avatar}
        />
      )}
    </FormField>
  );
}
