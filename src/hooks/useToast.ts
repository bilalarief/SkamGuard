"use client";

import { useState, useCallback, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

/** Status variants for toast notification. */
export type ToastStatus = "success" | "error" | "info" | "warning";

/** Shape of a single toast item. */
export interface Toast {
  /** Unique identifier — used as React key and for dismissal. */
  id: string;
  /** Visual variant controls background colour. */
  status: ToastStatus;
  /**
   * i18n key (e.g. "toast.reportSuccess") **or** a pre-resolved string.
   * The hook resolves keys through `t()` at call time so the message
   * always reflects the active locale.
   */
  messageKey: string;
  /** Optional i18n key or pre-resolved description. */
  descriptionKey?: string;
  /** Duration in ms before auto-dismiss. Default 4000. */
  duration?: number;
}

/** Resolved toast — what components receive after key lookup. */
export interface ResolvedToast extends Omit<Toast, "messageKey" | "descriptionKey"> {
  message: string;
  description?: string;
}

export interface UseToastReturn {
  /** Resolved toasts ready for rendering. */
  toasts: ResolvedToast[];
  /**
   * Fire a new toast. Accepts an i18n key or pre-resolved string.
   * Returns the generated id.
   */
  showToast: (opts: Omit<Toast, "id">) => string;
  /** Manually dismiss a toast by id. */
  dismissToast: (id: string) => void;
  /**
   * Convenience wrappers — pass either an i18n key or a literal string.
   * Both `message` and `description` are resolved through `t()`.
   * If the key is not found, the raw string is used as-is.
   */
  success: (messageKey: string, descriptionKey?: string) => string;
  error: (messageKey: string, descriptionKey?: string) => string;
  info: (messageKey: string, descriptionKey?: string) => string;
  warning: (messageKey: string, descriptionKey?: string) => string;
}

const DEFAULT_DURATION = 4000;

/**
 * `useToast` — locale-aware, self-contained toast queue.
 *
 * Pass i18n keys or pre-resolved strings — both work.
 * Messages are resolved via `t()` at call time so they always match
 * the active locale, including mid-session language switches.
 *
 * Mount `<ToastContainer>` once per page (or root layout) and consume
 * this hook anywhere inside the same React tree.
 *
 * @example
 * ```tsx
 * const { success, error } = useToast();
 * success("toast.reportSuccess", "toast.reportSuccessDesc");
 * error("toast.reportFailed", "toast.reportFailedDesc");
 * ```
 */
export function useToast(): UseToastReturn {
  const { t } = useLanguage();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
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

  /**
   * Resolve stored keys on every render — ensures language switches
   * already-visible toasts also re-render in the new locale.
   */
  const resolvedToasts: ResolvedToast[] = toasts.map(
    ({ messageKey, descriptionKey, ...rest }) => ({
      ...rest,
      message: t(messageKey),
      description: descriptionKey ? t(descriptionKey) : undefined,
    })
  );

  const success = useCallback(
    (messageKey: string, descriptionKey?: string) =>
      showToast({ status: "success", messageKey, descriptionKey }),
    [showToast]
  );

  const error = useCallback(
    (messageKey: string, descriptionKey?: string) =>
      showToast({ status: "error", messageKey, descriptionKey }),
    [showToast]
  );

  const info = useCallback(
    (messageKey: string, descriptionKey?: string) =>
      showToast({ status: "info", messageKey, descriptionKey }),
    [showToast]
  );

  const warning = useCallback(
    (messageKey: string, descriptionKey?: string) =>
      showToast({ status: "warning", messageKey, descriptionKey }),
    [showToast]
  );

  return {
    toasts: resolvedToasts,
    showToast,
    dismissToast,
    success,
    error,
    info,
    warning,
  };
}
