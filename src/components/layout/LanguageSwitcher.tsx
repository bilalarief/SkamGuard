"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t, locale, setLocale, localeLabels } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = t("common.currentLanguage");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="language-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-1.5
          h-9 px-3
          rounded-md transition-all duration-150
          touch-target cursor-pointer
          text-sm font-medium
          ${isHome 
            ? "bg-transparent border border-white/40 hover:bg-white/10 text-white" 
            : "bg-white hover:bg-gray-50 border border-transparent shadow-sm text-[#334155]"}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current language: ${currentLabel}. Click to change.`}
      >
        <Languages className={`w-4 h-4 ${isHome ? "text-white/80" : "text-[#64748b]"}`} />
        <span className="min-w-[50px] text-left">{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isHome ? "text-white/80" : "text-[#64748b]"}`} />
      </button>

      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-48
          bg-white rounded-lg shadow-xl border border-gray-100
          py-1.5 z-[100]
          origin-top-right
        ">
          {Object.entries(localeLabels).map(([code, label]) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between
                px-4 py-2 text-sm
                transition-colors duration-150
                ${locale === code 
                  ? "text-primary bg-primary/5 font-semibold" 
                  : "text-gray-700 hover:bg-gray-50"}
              `}
            >
              <span>{label}</span>
              {locale === code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
