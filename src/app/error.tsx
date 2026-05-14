/**
 * Global error boundary — catches any unhandled React error in the app tree.
 * Uses createTranslator directly (not useLanguage hook) because error boundaries
 * render outside the React context provider tree.
 *
 * @module app/error
 */

'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { createTranslator } from '@/i18n'
import { getStoredLocale } from '@/lib/utils/get-locale'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root-level error fallback UI.
 * Shown when an unhandled error occurs anywhere in the app.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const t = createTranslator(getStoredLocale())

  useEffect(() => {
    console.error('[SkamGuard] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-bg">
      <div className="w-16 h-16 rounded-2xl bg-risk-high-bg flex items-center justify-center mb-5">
        <AlertTriangle className="w-8 h-8 text-risk-high" aria-hidden="true" />
      </div>

      <h1 className="text-xl font-extrabold text-text-primary mb-2">
        {t('errors.globalTitle')}
      </h1>
      <p className="text-sm text-text-secondary mb-1 max-w-xs leading-relaxed">
        {t('errors.globalDesc')}
      </p>

      {/* Show digest in dev only — never expose raw error messages to users */}
      {process.env.NODE_ENV !== 'production' && error.digest && (
        <p className="text-xs text-text-muted font-mono mt-1 mb-4">
          {t('errors.globalDigest')}: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="
          mt-6 flex items-center gap-2
          px-6 py-3 rounded-xl
          bg-primary text-white
          text-sm font-semibold
          hover:bg-primary-dark active:scale-[0.98]
          transition-all duration-150
        "
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        {t('errors.tryAgain')}
      </button>
    </div>
  )
}
