"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { validateImageFile } from "@/lib/validators/input";

interface ScreenshotUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function ScreenshotUploader({ onFileSelect }: ScreenshotUploaderProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const result = validateImageFile(file);
    if (!result.valid) {
      setError(result.error ? t(result.error) : t("errors.invalidFormat"));
      return;
    }
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed
          p-8 text-center cursor-pointer
          transition-colors duration-150
          ${isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-surface-hover"
          }
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded-radius-sm object-contain"
          />
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Choose a file or drag & drop it here.
              </p>
              <p className="text-xs text-text-muted mt-1">
                JPEG, PNG, JPG, and other image formats, max 5 MB.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="
                inline-flex items-center justify-center
                px-5 py-2 rounded-lg
                border border-border bg-surface
                text-sm font-medium text-text-primary
                hover:bg-surface-hover active:scale-[0.98]
                transition-all duration-150 cursor-pointer
              "
            >
              Browse File
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-risk-high">{error}</p>
      )}
    </div>
  );
}
