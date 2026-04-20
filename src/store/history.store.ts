/**
 * History store — persists scan results to localStorage.
 * @module store/history.store
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RiskReport, ScamTypeId, RiskLevel, ActionItem } from '@/types/analysis'

export interface HistoryItem {
  id: string
  scamType: ScamTypeId
  riskLevel: RiskLevel
  overallScore: number
  explanation: string
  verdict: string
  redFlags: string[]
  actionPlan: ActionItem[]
  timestamp: string
}

interface HistoryState {
  items: HistoryItem[]
  addItem: (report: RiskReport) => void
  removeItem: (id: string) => void
  clearAll: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (report) =>
        set((state) => ({
          items: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              scamType: report.scamType,
              riskLevel: report.riskLevel,
              overallScore: report.overallScore,
              explanation: report.explanation,
              verdict: report.verdict,
              redFlags: report.redFlags,
              actionPlan: report.actionPlan,
              timestamp: report.timestamp || new Date().toISOString(),
            },
            ...state.items,
          ].slice(0, 50), // Keep max 50 items
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'skamguard-history',
    }
  )
)
