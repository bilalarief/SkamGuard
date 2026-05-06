"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Toast } from "./Toast";
import type { Toast as ToastItem } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

/**
 * `ToastContainer` — fixed overlay at top-center of viewport.
 *
 * Renders via React portal so it escapes any overflow-hidden parents.
 * Place this once per page (or in root layout) and pass in the `toasts`
 * + `onDismiss` from `useToast`.
 *
 * Position: top-center, responsive padding, max-width mirrors app shell.
 *
 * @example
 * ```tsx
 * const { toasts, dismissToast } = useToast();
 * <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 * ```
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  /* Avoid SSR mismatch — portal target is only available client-side. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className={[
        /* Fixed, top-center, high z-index */
        "fixed top-0 inset-x-0 z-[9999]",
        /* Responsive centering — matches app shell max-w */
        "flex flex-col items-center",
        /* Safe-area + spacing */
        "pt-[env(safe-area-inset-top,0px)]",
        "px-3 sm:px-4",
        /* Stack with gap */
        "gap-2",
        /* Push toasts below the fixed Header (56px) */
        "mt-[60px]",
        /* Allow clicks to pass through empty areas */
        "pointer-events-none",
      ].join(" ")}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}
