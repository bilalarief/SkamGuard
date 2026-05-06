"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Compact language toggle — pill with two segments.
 * Only two locales (BM / EN), so a segmented toggle is cleaner than a dropdown.
 *
 * Refactoring-UI principles applied:
 * - Ghost-level emphasis (secondary action, not primary)
 * - No dropdown for binary choice
 * - Motion indicator for active state
 * - Adaptive styling for hero (transparent) vs inner pages
 */
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { locale, setLocale } = useLanguage();

  const options = [
    { code: "ms", label: "BM" },
    { code: "en", label: "EN" },
  ];

  return (
    <div
      id="language-switcher"
      className={`
        relative inline-flex items-center
        h-8 rounded-full p-0.5
        ${isHome
          ? "bg-white/10 border border-white/20"
          : "bg-gray-100 border border-gray-200/60"
        }
      `}
      role="radiogroup"
      aria-label="Select language"
    >
      {options.map((opt) => {
        const isActive = locale === opt.code;

        return (
          <button
            key={opt.code}
            role="radio"
            aria-checked={isActive}
            onClick={() => setLocale(opt.code)}
            className={`
              relative z-10 px-3 h-7 rounded-full
              text-xs font-semibold tracking-wide
              transition-colors duration-200 cursor-pointer
              ${isActive
                ? isHome
                  ? "text-white"
                  : "text-gray-900"
                : isHome
                  ? "text-white/50 hover:text-white/80"
                  : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {/* Sliding active indicator */}
            {isActive && (
              <motion.div
                layoutId="lang-indicator"
                className={`
                  absolute inset-0 rounded-full
                  ${isHome
                    ? "bg-white/20 shadow-sm"
                    : "bg-white shadow-sm"
                  }
                `}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
