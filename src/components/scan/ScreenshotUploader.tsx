"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, Camera } from "lucide-react";
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
          relative rounded-radius-md border-2 border-dashed
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
            <Upload className="w-8 h-8 text-text-muted mx-auto" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {t("scan.uploadTitle")}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {t("scan.uploadDesc")}
              </p>
            </div>
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

      <button
        onClick={() => inputRef.current?.click()}
        className="
          w-full flex items-center justify-center gap-2
          h-10 rounded-radius-sm
          bg-surface border border-border
          text-sm font-medium text-text-primary
          hover:bg-surface-hover transition-colors duration-150
          cursor-pointer
        "
      >
        <Camera className="w-4 h-4" />
        {t("scan.cameraButton")}
      </button>

      {error && (
        <p className="text-sm text-risk-high">{error}</p>
      )}
    </div>
  );
}
