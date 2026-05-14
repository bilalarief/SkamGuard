/**
 * Scan route error boundary — catches errors thrown inside /scan.
 * Uses createTranslator directly (not useLanguage hook) because error boundaries
 * render outside the React context provider tree.
 *
 * @module app/scan/error
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { createTranslator } from '@/i18n'
import { getStoredLocale } from '@/lib/utils/get-locale'

interface ScanErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error fallback for the /scan route.
 * Offers retry (reset boundary) or navigate home.
 */
export default function ScanError({ error, reset }: ScanErrorProps) {
  const router = useRouter()
  const t = createTranslator(getStoredLocale())

  useEffect(() => {
    console.error('[SkamGuard][scan] Error:', error)
  }, [error])

  return (
    <div className="container-app py-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-risk-high-bg flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-risk-high" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-extrabold text-text-primary mb-2">
        {t('errors.scanTitle')}
      </h2>
      <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-6">
        {t('errors.scanDesc')}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="
            flex items-center justify-center gap-2
            w-full h-12 rounded-xl
            bg-primary text-white
            text-sm font-semibold
            hover:bg-primary-dark active:scale-[0.98]
            transition-all duration-150
          "
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          {t('errors.tryAgain')}
        </button>

        <button
          onClick={() => router.push('/')}
          className="
            flex items-center justify-center gap-2
            w-full h-12 rounded-xl
            bg-surface-hover text-text-primary
            text-sm font-semibold
            hover:bg-surface-active active:scale-[0.98]
            transition-all duration-150
          "
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          {t('errors.goHome')}
        </button>
      </div>
    </div>
  )
}
