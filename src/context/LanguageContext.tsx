"use client";

import { createContext, useState, useCallback, useMemo, type ReactNode } from "react";
import {
  createTranslator,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
} from "@/i18n";

interface LanguageContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
  localeLabels: Record<string, string>;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "skamguard-lang";

function getSavedLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch {
    // localStorage blocked in some privacy browsers — fail silently
  }

  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(getSavedLocale);

  const setLocale = useCallback((newLocale: string) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // fail silently
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ms" ? "en" : "ms");
  }, [locale, setLocale]);

  const t = useMemo(() => createTranslator(locale), [locale]);

  const contextValue = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, toggleLocale, t, localeLabels: LOCALE_LABELS }),
    [locale, setLocale, toggleLocale, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
