"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { SCAM_STATS } from "@/data/scamStats";
import { staggerContainer, staggerItem, cardHover } from "@/lib/motion";

export default function StatsSection() {
  const { t } = useLanguage();

  // Show only statsCases and statsLoss
  const displayStats = SCAM_STATS.filter(
    (stat) => stat.key === "statsCases" || stat.key === "statsLoss"
  );

  return (
    <section className="space-y-3">
      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {displayStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.key}
              variants={staggerItem}
              whileHover={cardHover.whileHover}
              whileTap={cardHover.whileTap}
              className="
                rounded-2xl border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                p-5 space-y-4
                bg-white
              "
            >
              <Icon className="w-8 h-8 text-[#E11D48]" />
              <div className="space-y-1">
                <div className="text-[13px] font-medium text-[#475569] leading-snug">
                  {t(`home.${stat.key}Title`)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap mt-auto pt-2">
                <span className="text-2xl font-bold text-[#E11D48]">
                  {stat.value}
                </span>
                <span className="text-[11px] text-text-secondary whitespace-nowrap">
                  {t(`home.${stat.key}Subtext`)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
