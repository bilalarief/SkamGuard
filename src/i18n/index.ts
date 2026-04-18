import ms from "./ms.json";
import en from "./en.json";

type TranslationData = typeof ms;

const translations: Record<string, TranslationData> = { ms, en };

export const DEFAULT_LOCALE = "ms";
export const SUPPORTED_LOCALES = Object.keys(translations);

export const LOCALE_LABELS: Record<string, string> = {
  ms: "Bahasa Malaysia",
  en: "English",
};

/**
 * Resolves a dot-separated key path against a translation object.
 * Falls back to the key itself if the path doesn't exist.
 *
 * Example: getNestedValue(ms, "home.hero") → "Tak pasti sama ada ini scam?"
 */
function getNestedValue(obj: unknown, keyPath: string): string | undefined {
  const result = keyPath.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof result === "string" ? result : undefined;
}

/**
 * Builds a translator function for the given locale.
 *
 * Usage:
 *   const t = createTranslator("ms");
 *   t("home.hero")  → "Tak pasti sama ada ini scam?"
 *   t("missing.key") → "missing.key" (graceful fallback)
 */
export function createTranslator(locale: string): (key: string) => string {
  const pack = translations[locale] || translations[DEFAULT_LOCALE];

  return function t(keyPath: string): string {
    const value = getNestedValue(pack, keyPath);

    if (value === undefined && locale !== DEFAULT_LOCALE) {
      const fallback = getNestedValue(translations[DEFAULT_LOCALE], keyPath);
      return fallback !== undefined ? fallback : keyPath;
    }

    return value !== undefined ? value : keyPath;
  };
}

export default translations;
