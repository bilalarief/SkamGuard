"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showClose = true,
}: ModalProps) {
  const { t } = useLanguage();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className="
          relative w-full sm:max-w-md
          bg-surface rounded-t-radius-xl sm:rounded-radius-lg
          border border-border shadow-xl
          max-h-[85vh] overflow-y-auto
        "
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && (
              <h2 className="text-base font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="
                  h-8 w-8 rounded-radius-sm
                  flex items-center justify-center
                  text-text-muted hover:text-text-primary hover:bg-surface-hover
                  transition-colors duration-150 cursor-pointer
                "
                aria-label={t("common.close")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
