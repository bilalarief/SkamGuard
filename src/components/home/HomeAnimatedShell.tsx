/**
 * Client-side animated shell for the home page.
 * Wraps the content sections with stagger animation.
 *
 * Isolated as a Client Component so that the parent page.tsx
 * can remain a Server Component (faster FCP, server-side HTML).
 *
 * UI and behaviour unchanged — only the rendering boundary moves.
 *
 * @module components/home/HomeAnimatedShell
 */

"use client";

import { m, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import StatsSection from "./StatsSection";
import FeatureCardList from "./FeatureCardList";
import AppFooter from "./AppFooter";

export default function HomeAnimatedShell() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <m.div
      className="flex-1 bg-[#F8FAFC] md:bg-transparent rounded-t-[32px] md:rounded-none -mt-6 md:mt-0 relative z-10 px-5 md:px-0 pt-8 md:pt-6 pb-6 space-y-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="container-app">
        <m.div className="mb-4" variants={staggerItem}>
          <StatsSection />
        </m.div>
        <m.div variants={staggerItem}>
          <FeatureCardList />
        </m.div>
        <m.div variants={staggerItem}>
          <AppFooter />
        </m.div>
      </div>
    </m.div>
  );
}
