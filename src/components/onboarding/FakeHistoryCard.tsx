'use client'

import { AlertTriangle, ChevronRight } from 'lucide-react'

interface FakeHistoryCardProps {
  /** Translation function */
  t: (key: string) => string
}

/**
 * Static fake history card rendered during onboarding Step 12.
 * Shows a realistic-looking "Macau Scam" entry so the user
 * understands what the History page will look like.
 */
export default function FakeHistoryCard({ t }: FakeHistoryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-3">
          <h3 className="font-bold text-[16px] text-slate-800">Macau Scam</h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('onboarding.fakeHistory.dangerous')} · 94/100</span>
          </div>
          <p className="text-[12px] text-slate-400">{t('onboarding.fakeHistory.date')}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
      </div>
    </div>
  )
}
