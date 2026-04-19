/**
 * @module store/analysis.store
 */

import { create } from 'zustand'
import type { RiskReport } from '@/types/analysis'

interface AnalysisState {
  report: RiskReport | null
  isLoading: boolean
  error: string | null
  setReport: (report: RiskReport) => void
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

  setReport: (report) => set({
    report,
    isLoading: false,
    error: null,
  }),

  clearReport: () => set({ report: null }),

  setLoading: (isLoading) => set({ isLoading, error: null }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set({
    report: null,
    isLoading: false,
    error: null,
  }),
}))
