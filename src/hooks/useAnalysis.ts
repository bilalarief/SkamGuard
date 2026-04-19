/**
 * Custom hook for submitting analysis requests and managing state.
 * Bridges the scan page to the API and Zustand store.
 *
 * @module hooks/useAnalysis
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/analysis.store'
import type { AnalyzeResponse } from '@/types/api'

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
 * Hook for analysis submission with loading/error states.
 *
 * Usage:
 *   const { submit, isLoading, error } = useAnalysis()
 *   await submit({ text: 'suspicious message', language: 'BM' })
 */
export function useAnalysis() {
  const { isLoading, error, setReport, setLoading, setError } = useAnalysisStore()
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

      const result: AnalyzeResponse = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Analysis failed')
      }

      setReport(result.data)
      router.push('/report')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    }
  }, [setReport, setLoading, setError, router])

  return { submit, isLoading, error }
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
