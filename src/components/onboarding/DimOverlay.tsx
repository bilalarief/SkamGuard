'use client'

import { m } from 'framer-motion'

interface DimOverlayProps {
  /** Bounding rect of the element to cut out. When null, renders a full-screen dim. */
  highlightRect: DOMRect | null
  /** Border-radius Tailwind class for the cutout shape (e.g. "rounded-2xl", "rounded-full") */
  borderRadius?: string
  /** Padding around the highlight rect (px) — defaults to 0 */
  padding?: number
  /** Click handler on the overlay container */
  onClick?: () => void
  /** Show cursor-pointer on the overlay — defaults to false */
  cursor?: boolean
  /** Extra classes on the outer container */
  className?: string
  /** Content rendered on top of the dim (e.g. tooltips, fake cards) */
  children?: React.ReactNode
}

/**
 * Full-screen dim overlay with an optional transparent cutout.
 * Children are rendered on top for absolute-positioned tooltips etc.
 */
export default function DimOverlay({
  highlightRect,
  borderRadius = 'rounded-2xl',
  padding = 0,
  onClick,
  cursor = false,
  className = '',
  children,
}: DimOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] ${cursor ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {highlightRect ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute bg-transparent ${borderRadius} pointer-events-none`}
          style={{
            top: highlightRect.top - padding,
            left: highlightRect.left - padding,
            width: highlightRect.width + padding * 2,
            height: highlightRect.height + padding * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/60 pointer-events-none" />
      )}
      {children}
    </div>
  )
}
