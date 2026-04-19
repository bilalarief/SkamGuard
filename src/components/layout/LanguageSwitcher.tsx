"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLanguage();

  const label = locale === "ms" ? "EN" : "BM";

  return (
    <button
      id="language-switcher"
      onClick={toggleLocale}
      className="
        inline-flex items-center gap-1.5
        h-9 px-3
        bg-surface hover:bg-surface-hover
        border border-border rounded-radius-sm
        text-sm font-medium text-text-primary
        transition-colors duration-150
        touch-target cursor-pointer
      "
      aria-label={`Switch language to ${label}`}
    >
      <Languages className="w-4 h-4 text-text-secondary" />
      <span>{label}</span>
    </button>
  );
}
