"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import FeatureCardList from "@/components/home/FeatureCardList";
import StatsSection from "@/components/home/StatsSection";
import AppFooter from "@/components/home/AppFooter";
import { HomePageSkeleton } from "@/components/shared/Skeleton";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

function HomeContent() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Top Banner Area */}
      <div className="-mt-14 h-[420px] relative w-full">
        <HeroSection />
      </div>

      {/* White Container */}
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
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
