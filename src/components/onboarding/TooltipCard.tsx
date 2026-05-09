'use client'

import { m } from 'framer-motion'
import type { NotchPosition } from './onboarding-steps'

interface TooltipCardProps {
  headline: string
  subtext: string
  tip?: string
  notchPosition: NotchPosition
  children?: React.ReactNode
}

/** CSS classes for the triangle notch per position */
const NOTCH_CLASSES: Record<NotchPosition, string> = {
  'top-left':
    'absolute -top-[12px] left-8 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-white',
  'top-center':
    'absolute -top-[12px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-white',
  'top-right':
    'absolute -top-[10px] right-5 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-white',
  'bottom-left':
    'absolute -bottom-[11px] left-6 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white',
  'bottom-center':
    'absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white',
  'bottom-right':
    'absolute -bottom-[11px] right-6 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white',
}

/** Whether a notch position refers to the top edge (text centred) */
function isTopNotch(pos: NotchPosition): boolean {
  return pos.startsWith('top')
}

/**
 * Reusable white speech-bubble tooltip used across every onboarding step.
 * Accepts a notch position to render the pointer triangle and optional
 * children for CTA buttons (e.g. the "Got it! 🎉" button on the final step).
 */
export default function TooltipCard({
  headline,
  subtext,
  tip,
  notchPosition,
  children,
}: TooltipCardProps) {
  const centred = isTopNotch(notchPosition) || notchPosition === 'bottom-center'

  return (
    <m.div
      initial={{ opacity: 0, y: isTopNotch(notchPosition) ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl p-5 shadow-xl w-[calc(100vw-2rem)] mx-auto"
    >
      {/* Triangle notch */}
      <div className={NOTCH_CLASSES[notchPosition]} />

      <h3
        className={`font-bold text-slate-900 text-[17px] mb-1 tracking-tight ${centred ? 'text-center' : ''}`}
      >
        {headline}
      </h3>
      <p
        className={`text-slate-600 text-sm ${centred ? 'text-center' : ''} ${children ? 'mb-4' : ''}`}
      >
        {subtext}
      </p>

      {tip && (
        <div className="bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-[13px] leading-snug mt-3">
          <span className="mr-1">💡</span>
          {tip}
        </div>
      )}

      {children}
    </m.div>
  )
}
