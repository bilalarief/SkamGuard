/**
 * LazyMotion provider — wraps the entire app to enable tree-shakeable
 * framer-motion animations via `m.*` components instead of `motion.*`.
 *
 * WHY LazyMotion + m:
 *   - `motion` imports ALL framer features (~69KB)
 *   - `m` + `LazyMotion(domAnimation)` splits features into a separate chunk
 *     and reduces parse-time JS (~17KB saved from initial parse)
 *   - `domAnimation` covers: animate, variants, gestures, drag, layout
 *
 * Must wrap ALL `m.*` component consumers.
 * Placed at root layout so Header, BottomNav, pages are all covered.
 *
 * @module components/providers/MotionProvider
 */

"use client";

import { LazyMotion, domAnimation } from "framer-motion";

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Root LazyMotion provider. Enables `m.*` components app-wide.
 * All `motion.*` imports replaced with `m.*` to activate tree-shaking.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
