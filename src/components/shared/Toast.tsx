"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import type { Toast as ToastItem, ToastStatus } from "@/hooks/useToast";

/* ─── Status → style map ─────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ToastStatus,
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    text: string;
    progress: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />,
    bg: "bg-emerald-600",
    border: "border-emerald-500/40",
    text: "text-white",
    progress: "bg-emerald-300/50",
  },
  error: {
    icon: <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />,
    bg: "bg-red-600",
    border: "border-red-500/40",
    text: "text-white",
    progress: "bg-red-300/50",
  },
  info: {
    icon: <Info className="w-5 h-5 shrink-0" aria-hidden="true" />,
    bg: "bg-blue-600",
    border: "border-blue-500/40",
    text: "text-white",
    progress: "bg-blue-300/50",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />,
    bg: "bg-amber-500",
    border: "border-amber-400/40",
    text: "text-white",
    progress: "bg-amber-200/50",
  },
};

/* ─── Single Toast item ──────────────────────────────────────────────────── */

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

/**
 * `Toast` — single notification card.
 *
 * Renders the icon, message, optional description, progress bar,
 * and dismiss button. Status drives all colour tokens.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, status, message, description, duration = 4000 } = toast;
  const cfg = STATUS_CONFIG[status];

  /* mount animation */
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    /* next frame so CSS transition fires */
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        "relative w-full max-w-sm rounded-lg border shadow-xl overflow-hidden",
        "transition-all duration-300 ease-out",
        cfg.bg,
        cfg.border,
        cfg.text,
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-3 scale-95",
      ].join(" ")}
    >
      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3 pr-10">
        {/* Status icon */}
        <span className="mt-0.5 opacity-90">{cfg.icon}</span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{message}</p>
          {description && (
            <p className="mt-0.5 text-xs opacity-80 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="absolute top-2.5 right-2.5 p-1 rounded-full opacity-70 hover:opacity-100 hover:bg-white/20 transition-all duration-150 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className="h-0.5 w-full">
        <div
          className={[
            "h-full origin-left",
            cfg.progress,
          ].join(" ")}
          style={{
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      {/* Keyframe injected inline — avoids global CSS pollution */}
      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
