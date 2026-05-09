'use client'

import { useEffect, useRef, useState } from 'react'

interface UseTrackRectOptions {
  /** Whether tracking is active */
  active: boolean
  /** CSS selector, element id, or data-tour attribute to find the element */
  selector: string
  /** Strategy for finding the element */
  strategy?: 'querySelector' | 'id' | 'dataTour'
  /** Delay (ms) before first measurement — defaults to 50 */
  delay?: number
  /** Polling interval (ms) — 0 = no polling — defaults to 0 */
  pollInterval?: number
  /** Whether to scroll the element into view — defaults to false */
  scrollIntoView?: boolean
  /** Callback fired after the first successful measurement */
  onReady?: () => void
  /** Callback fired on cleanup */
  onCleanup?: () => void
}

/**
 * Tracks the bounding rect of a DOM element reactively.
 * Handles resize/scroll listeners, optional polling, and delayed init.
 */
export function useTrackRect({
  active,
  selector,
  strategy = 'querySelector',
  delay = 50,
  pollInterval = 0,
  scrollIntoView = false,
  onReady,
  onCleanup,
}: UseTrackRectOptions): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const onReadyRef = useRef(onReady)
  const onCleanupRef = useRef(onCleanup)
  onReadyRef.current = onReady
  onCleanupRef.current = onCleanup

  useEffect(() => {
    if (!active) { setRect(null); return }

    const findEl = (): Element | null => {
      if (strategy === 'id') return document.getElementById(selector)
      if (strategy === 'dataTour') return document.querySelector(`[data-tour="${selector}"]`)
      return document.querySelector(selector)
    }

    const updateRect = () => {
      const el = findEl()
      if (el) setRect(el.getBoundingClientRect())
    }

    const initialTimeout = setTimeout(() => {
      const el = findEl()
      if (el && scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      updateRect()
      onReadyRef.current?.()
    }, delay)

    let interval: ReturnType<typeof setInterval> | null = null
    if (pollInterval > 0) interval = setInterval(updateRect, pollInterval)

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect)
    return () => {
      clearTimeout(initialTimeout)
      if (interval) clearInterval(interval)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
      onCleanupRef.current?.()
    }
  }, [active, selector, strategy, delay, pollInterval, scrollIntoView])

  return rect
}
