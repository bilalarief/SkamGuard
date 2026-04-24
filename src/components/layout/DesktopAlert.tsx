"use client";

import { useState, useEffect } from "react";
import { Smartphone, X, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Elegant floating alert shown only on large screens (lg+).
 * Matches the app's blue/dark theme and recommends using a smartphone.
 */
export default function DesktopAlert() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Slight delay before showing so it feels intentional
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="hidden lg:block fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-auto max-w-[520px]"
        >
          <div
            className="
              relative flex items-center gap-4 px-5 py-3.5
              bg-gradient-to-r from-[#0D2B3E] to-[#1B4965]
              border border-white/10
              rounded-2xl shadow-2xl
              backdrop-blur-md
            "
          >
            {/* Animated phone icon */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="
                shrink-0 w-10 h-10 rounded-xl
                bg-[#00A6F4]/20 border border-[#00A6F4]/30
                flex items-center justify-center
              "
            >
              <Smartphone className="w-5 h-5 text-[#00A6F4]" />
            </motion.div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/95 leading-snug">
                {t("common.desktopAlert")}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowDown className="w-3 h-3 text-[#00A6F4]" />
                <span className="text-[11px] text-white/50 font-medium">
                  SkamGuard
                </span>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => setDismissed(true), 300);
              }}
              className="
                shrink-0 w-7 h-7 rounded-lg
                flex items-center justify-center
                bg-white/10 hover:bg-white/20
                transition-colors duration-150 cursor-pointer
              "
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
