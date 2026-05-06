"use client";

import { useState, useCallback, useRef } from "react";

/** Status variants for toast notification. */
export type ToastStatus = "success" | "error" | "info" | "warning";

/** Shape of a single toast item. */
export interface Toast {
  /** Unique identifier — used as React key and for dismissal. */
  id: string;
  /** Visual variant controls background colour. */
  status: ToastStatus;
  /** i18n-resolved message string (already translated by caller). */
  message: string;
  /** Optional sub-message / description line. */
  description?: string;
  /** Duration in ms before auto-dismiss. Default 4000. */
  duration?: number;
}

export interface UseToastReturn {
  toasts: Toast[];
  /** Fire a new toast. Returns the generated id. */
  showToast: (opts: Omit<Toast, "id">) => string;
  /** Manually dismiss a toast by id. */
  dismissToast: (id: string) => void;
  /** Convenience wrappers. */
  success: (message: string, description?: string) => string;
  error: (message: string, description?: string) => string;
  info: (message: string, description?: string) => string;
  warning: (message: string, description?: string) => string;
}

const DEFAULT_DURATION = 4000;

/**
 * `useToast` — lightweight, self-contained toast queue.
 *
 * Mount `<ToastContainer>` once (in layout or page root) and consume
 * this hook anywhere inside the same React tree.
 *
 * @example
 * ```tsx
 * const { success, error } = useToast();
 * success(t("toast.reportSuccess"));
 * error(t("toast.reportFailed"));
 * ```
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (opts: Omit<Toast, "id">): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = opts.duration ?? DEFAULT_DURATION;

      setToasts((prev) => [...prev, { ...opts, id, duration }]);

      const timer = setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, description?: string) =>
      showToast({ status: "success", message, description }),
    [showToast]
  );

  const error = useCallback(
    (message: string, description?: string) =>
      showToast({ status: "error", message, description }),
    [showToast]
  );

  const info = useCallback(
    (message: string, description?: string) =>
      showToast({ status: "info", message, description }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, description?: string) =>
      showToast({ status: "warning", message, description }),
    [showToast]
  );

  return { toasts, showToast, dismissToast, success, error, info, warning };
}
