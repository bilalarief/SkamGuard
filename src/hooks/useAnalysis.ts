/**
 * Custom hook for submitting analysis requests via SSE stream.
 * Consumes Server-Sent Events from /api/analyze and updates
 * Zustand store with real-time step progress.
 *
 * @module hooks/useAnalysis
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/analysis.store'
import { useHistoryStore } from '@/store/history.store'
import type { RiskReport } from '@/types/analysis'
import type { AnalysisStep } from '@/store/analysis.store'

interface SubmitParams {
  /** Base64 encoded image (with or without data URI prefix) */
  image?: string
  /** Plain text message */
  text?: string
  /** Phone number to check */
  phoneNumber?: string
  /** Language preference */
  language: 'BM' | 'EN'
}

/**
 * Hook for analysis submission with real-time SSE step tracking.
 *
 * Usage:
 *   const { submit, isLoading, error, currentStep } = useAnalysis()
 *   await submit({ text: 'suspicious message', language: 'BM' })
 */
export function useAnalysis() {
  const { isLoading, error, currentStep, setReport, setLoading, setError, setCurrentStep } =
    useAnalysisStore()
  const addHistoryItem = useHistoryStore((s) => s.addItem)
  const router = useRouter()

  const submit = useCallback(async (params: SubmitParams) => {
    setLoading(true)

    try {
      // Strip data URI prefix from image if present
      const imageData = params.image?.includes(',')
        ? params.image.split(',')[1]
        : params.image

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          text: params.text,
          phoneNumber: params.phoneNumber,
          language: params.language,
        }),
      })

      // Non-SSE error response (rate limit, validation, etc.)
      if (!response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response stream available')
      }

      // Parse SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE events (delimited by double newline)
        const events = buffer.split('\n\n')
        buffer = events.pop() || '' // Keep incomplete chunk in buffer

        for (const event of events) {
          const dataLine = event
            .split('\n')
            .find((line) => line.startsWith('data: '))

          if (!dataLine) continue

          try {
            const data = JSON.parse(dataLine.slice(6))

            if (data.step && data.step !== 'complete' && data.step !== 'error') {
              // Progress step event
              setCurrentStep(data.step as AnalysisStep)
            } else if (data.step === 'complete' && data.success && data.data) {
              // Final result
              const report = data.data as RiskReport
              addHistoryItem(report)
              setReport(report)
              router.push('/report')
              return
            } else if (data.step === 'error' || data.success === false) {
              throw new Error(data.error?.message || 'Analysis failed')
            }
          } catch (parseError) {
            // JSON parse error in SSE data — skip malformed event
            if (parseError instanceof SyntaxError) continue
            throw parseError
          }
        }
      }

      // If stream ended without a complete event
      throw new Error('Analysis stream ended unexpectedly')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    }
  }, [setReport, setLoading, setError, setCurrentStep, router, addHistoryItem])

  return { submit, isLoading, error, currentStep }
}

/**
 * Hook for converting a File to base64.
 * Used by the ScreenshotUploader component.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
