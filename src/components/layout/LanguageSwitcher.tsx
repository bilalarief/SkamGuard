"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { Languages, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { scaleIn } from "@/lib/motion";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { code: "ms", label: "Bahasa Melayu", short: "BM" },
    { code: "en", label: "English", short: "EN" },
  ];

  const currentOption = options.find((opt) => opt.code === locale) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      id="language-switcher"
      className="relative inline-flex items-center"
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 h-8 px-2.5 md:rounded-sm rounded-md border text-xs font-semibold
          transition-colors duration-200 cursor-pointer
          ${isHome 
            ? "border-white/20 text-white bg-white/10 hover:bg-white/20 md:border-gray-200/60 md:text-gray-700 md:bg-gray-50 md:hover:bg-gray-100" 
            : "border-gray-200/60 text-gray-700 bg-gray-50 hover:bg-gray-100"}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Languages className="w-3.5 h-3.5" />
        <span className="inline">{currentOption.short}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            className="absolute right-0 top-10 z-50 bg-surface rounded-md shadow-lg border border-border min-w-[140px] py-1"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top right" }}
            role="listbox"
          >
            {options.map((opt) => (
              <button
                key={opt.code}
                role="option"
                aria-selected={locale === opt.code}
                onClick={() => {
                  setLocale(opt.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer
                  ${locale === opt.code 
                    ? "bg-[#E0F2FE] text-[#00A6F4] font-semibold" 
                    : "text-text-primary hover:bg-surface-hover font-medium"}
                `}
              >
                {opt.label}
              </button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
