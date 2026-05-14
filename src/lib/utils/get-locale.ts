/**
 * Reads the persisted locale from localStorage for use in error boundaries.
 * Error boundaries cannot use React hooks or context, so they read locale
 * directly from storage. Falls back to the default locale if unavailable.
 *
 * @module lib/utils/get-locale
 */

import { DEFAULT_LOCALE } from '@/i18n'

/**
 * Returns the current locale string from localStorage, or the default locale.
 * Safe to call in any client-side context including error boundaries.
 */
export function getStoredLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    return localStorage.getItem('skamguard-locale') ?? DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}
