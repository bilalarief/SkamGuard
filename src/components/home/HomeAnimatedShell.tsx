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

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import StatsSection from "./StatsSection";
import FeatureCardList from "./FeatureCardList";
import AppFooter from "./AppFooter";

export default function HomeAnimatedShell() {
  return (
    <motion.div
      className="flex-1 bg-[#F8FAFC] rounded-t-[32px] -mt-6 relative z-10 px-5 pt-8 pb-6 space-y-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="container-app">
        <motion.div className="mb-4" variants={staggerItem}>
          <StatsSection />
        </motion.div>
        <motion.div variants={staggerItem}>
          <FeatureCardList />
        </motion.div>
        <motion.div variants={staggerItem}>
          <AppFooter />
        </motion.div>
      </div>
    </motion.div>
  );
}
