/**
 * Report route error boundary — catches errors thrown inside /report.
 * Most likely cause: Zustand store is empty (user navigated directly to /report
 * without completing a scan). Uses createTranslator directly (not useLanguage hook)
 * because error boundaries render outside the React context provider tree.
 *
 * @module app/report/error
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileWarning, ScanSearch } from 'lucide-react'
import { createTranslator } from '@/i18n'
import { getStoredLocale } from '@/lib/utils/get-locale'

interface ReportErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error fallback for the /report route.
 * Guides the user back to /scan to start a new analysis.
 */
export default function ReportError({ error, reset: _reset }: ReportErrorProps) {
  const router = useRouter()
  const t = createTranslator(getStoredLocale())

  useEffect(() => {
    console.error('[SkamGuard][report] Error:', error)
  }, [error])

  return (
    <div className="container-app py-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-risk-medium-bg flex items-center justify-center mb-4">
        <FileWarning className="w-7 h-7 text-risk-medium" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-extrabold text-text-primary mb-2">
        {t('errors.reportTitle')}
      </h2>
      <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-6">
        {t('errors.reportDesc')}
      </p>

      <button
        onClick={() => router.push('/scan')}
        className="
          flex items-center justify-center gap-2
          w-full max-w-xs h-12 rounded-xl
          bg-primary text-white
          text-sm font-semibold
          hover:bg-primary-dark active:scale-[0.98]
          transition-all duration-150
        "
      >
        <ScanSearch className="w-4 h-4" aria-hidden="true" />
        {t('errors.startNewScan')}
      </button>
    </div>
  )
}
