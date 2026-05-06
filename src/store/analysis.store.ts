/**
 * @module store/analysis.store
 */

import { create } from 'zustand'
import type { RiskReport } from '@/types/analysis'

/** Source of navigation to the report page */
export type ReportSource = 'scan' | 'history'

/** Pipeline steps emitted by SSE stream */
export type AnalysisStep =
  | 'extracting'
  | 'checking_tools'
  | 'analyzing'
  | 'scoring'
  | 'complete'
  | 'error'
  | null

interface AnalysisState {
  report: RiskReport | null
  isLoading: boolean
  error: string | null
  /** Current pipeline step — drives AnalyzingProgress UI */
  currentStep: AnalysisStep
  /** Tracks where the user came from when viewing a report */
  source: ReportSource
  setReport: (report: RiskReport, source?: ReportSource) => void
  clearReport: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentStep: (step: AnalysisStep) => void
  reset: () => void
}

/**
 * Global analysis state store.
 */
export const useAnalysisStore = create<AnalysisState>((set) => ({
  report: null,
  isLoading: false,
  error: null,
  currentStep: null,
  source: 'scan',

  setReport: (report, source = 'scan') => set({
    report,
    isLoading: false,
    error: null,
    currentStep: 'complete',
    source,
  }),

  clearReport: () => set({ report: null }),

  setLoading: (isLoading) => set({
    isLoading,
    error: null,
    currentStep: isLoading ? 'extracting' : null,
  }),

  setError: (error) => set({ error, isLoading: false, currentStep: 'error' }),

  setCurrentStep: (currentStep) => set({ currentStep }),

  reset: () => set({
    report: null,
    isLoading: false,
    error: null,
    currentStep: null,
    source: 'scan',
  }),
}))
