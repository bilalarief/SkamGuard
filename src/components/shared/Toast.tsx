"use client";

import { m } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import type { ResolvedToast, ToastStatus } from "@/hooks/useToast";

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

/* ─── Animation variants ─────────────────────────────────────────────────── */

/**
 * Slide in from above the viewport with a spring bounce when landing.
 * On exit, slides back up cleanly (no bounce — already gone).
 */
const toastVariants = {
  /** Start: above the screen, fully transparent */
  hidden: {
    opacity: 0,
    y: -60,
    scale: 0.95,
  },
  /** Visible: spring physics give the settling bounce */
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 380,
      damping: 22,
      mass: 0.9,
    },
  },
  /** Exit: slide back up fast, fade out */
  exit: {
    opacity: 0,
    y: -40,
    scale: 0.95,
    transition: {
      duration: 0.22,
      ease: "easeIn" as const,
    },
  },
};

/* ─── Component ──────────────────────────────────────────────────────────── */

interface ToastProps {
  toast: ResolvedToast;
  onDismiss: (id: string) => void;
}

/**
 * `Toast` — animated single notification card.
 *
 * Uses framer-motion for:
 * - Slide-in from top with spring bounce on landing
 * - Slide-out back to top on dismiss / auto-expire
 *
 * Status drives all colour tokens. Icon sourced from lucide-react.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, status, message, description, duration = 4000 } = toast;
  const cfg = STATUS_CONFIG[status];

  return (
    <m.div
      layout
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={[
        "relative w-full max-w-sm rounded-lg border shadow-xl overflow-hidden",
        cfg.bg,
        cfg.border,
        cfg.text,
      ].join(" ")}
    >
      {/* Content row */}
      <div className="flex items-start gap-3 px-4 py-3 pr-10">
        {/* Status icon */}
        <span className="mt-0.5 opacity-90">{cfg.icon}</span>

        {/* Text block */}
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
          className={["h-full origin-left", cfg.progress].join(" ")}
          style={{
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </m.div>
  );
}
