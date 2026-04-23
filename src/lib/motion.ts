/**
 * Shared Framer Motion animation variants.
 * Import these in components instead of writing inline animations.
 *
 * @module lib/motion
 */

import type { Variants, Transition } from 'framer-motion'

/** Standard spring transition for most animations */
export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

/** Smooth ease-out for fades */
export const easeOut: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
}

// ═══════════════════════════════════════
// PAGE / SECTION ENTRANCE
// ═══════════════════════════════════════

/** Fade in with subtle upward drift */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/** Slide up from below (page-level) */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ═══════════════════════════════════════
// STAGGERED LIST
// ═══════════════════════════════════════

/** Parent container that staggers children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

/** Child item for staggered lists */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ═══════════════════════════════════════
// MODAL / DRAWER
// ═══════════════════════════════════════

/** Bottom-sheet drawer slide up */
export const drawerUp: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

/** Backdrop overlay fade */
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// ═══════════════════════════════════════
// INTERACTIVE
// ═══════════════════════════════════════

/** Scale-in pop for dropdowns/menus */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

/** Hover/tap interaction for cards */
export const cardHover = {
  whileHover: { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' },
  whileTap: { scale: 0.985 },
  transition: { type: 'spring', stiffness: 400, damping: 25 } as Transition,
}
