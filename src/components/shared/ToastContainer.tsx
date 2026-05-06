"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import type { ResolvedToast } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: ResolvedToast[];
  onDismiss: (id: string) => void;
}

/**
 * `ToastContainer` — fixed overlay at top-center of viewport.
 *
 * - Renders via React portal (escapes overflow-hidden parents)
 * - `AnimatePresence` drives enter/exit animations for each `<Toast>`
 * - Position: top-center, responsive padding, max-width mirrors app shell
 * - Stacks vertically; new toasts push older ones down
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
        /* Safe-area padding + below fixed Header (56px) */
        "pt-[calc(env(safe-area-inset-top,0px)+60px)]",
        "px-3 sm:px-4",
        /* Stack gap */
        "gap-2",
        /* Pass-through clicks in empty space */
        "pointer-events-none",
      ].join(" ")}
    >
      {/*
        AnimatePresence enables exit animations.
        mode="sync" keeps toasts visible during their exit motion.
      */}
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
