'use client'

import { m } from 'framer-motion'

interface FakeAnalyzeButtonProps {
  /** Bounding rect of the real "Analyse Now" button */
  analyzeBtnRect: DOMRect
  /** Translated button label */
  label: string
}

/**
 * Fake blue "Analyse Now" button overlay shown during Step 5.
 * Sits on top of the real disabled button to make it look active/tappable.
 */
export default function FakeAnalyzeButton({ analyzeBtnRect, label }: FakeAnalyzeButtonProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute bg-sky-500 text-white flex items-center justify-center rounded-sm font-semibold text-base shadow-sm pointer-events-auto"
      style={{
        top: analyzeBtnRect.top,
        left: analyzeBtnRect.left,
        width: analyzeBtnRect.width,
        height: analyzeBtnRect.height,
        zIndex: 50,
      }}
    >
      {label}
    </m.div>
  )
}
