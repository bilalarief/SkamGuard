/**
 * @module store/analysis.store
 */

import { create } from 'zustand'
import type { RiskReport } from '@/types/analysis'

/** Source of navigation to the report page */
export type ReportSource = 'scan' | 'history'

interface AnalysisState {
  report: RiskReport | null
  isLoading: boolean
  error: string | null
  /** Tracks where the user came from when viewing a report */
  source: ReportSource
  setReport: (report: RiskReport, source?: ReportSource) => void
  clearReport: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

/**
 * Global analysis state store.
 */
export const useAnalysisStore = create<AnalysisState>((set) => ({
  report: null,
  isLoading: false,
  error: null,
  source: 'scan',

  setReport: (report, source = 'scan') => set({
    report,
    isLoading: false,
    error: null,
    source,
  }),

  clearReport: () => set({ report: null }),

  setLoading: (isLoading) => set({ isLoading, error: null }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set({
    report: null,
    isLoading: false,
    error: null,
    source: 'scan',
  }),
}))
