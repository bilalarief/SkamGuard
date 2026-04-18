"use client";

import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";

/**
 * Hook to access the translation system from any component.
 *
 * Usage:
 *   const { t, locale, toggleLocale } = useLanguage();
 *   <h1>{t("home.hero")}</h1>
 */
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within a <LanguageProvider>. " +
        "Wrap your app with <LanguageProvider> in the root layout."
    );
  }

  return context;
}
