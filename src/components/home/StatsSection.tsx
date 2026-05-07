"use client";

import { m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { SCAM_STATS } from "@/data/scamStats";
import { staggerContainer, staggerItem, cardHover } from "@/lib/motion";

export default function StatsSection() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  // Show only statsCases and statsLoss
  const displayStats = SCAM_STATS.filter(
    (stat) => stat.key === "statsCases" || stat.key === "statsLoss"
  );

  return (
    <section className="space-y-3">
      <m.div
        className="grid grid-cols-2 gap-4"
        variants={prefersReducedMotion ? undefined : staggerContainer}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
      >
        {displayStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <m.div
              key={stat.key}
              variants={prefersReducedMotion ? undefined : staggerItem}
              whileHover={cardHover.whileHover}
              whileTap={cardHover.whileTap}
              className="
                rounded-2xl border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                p-5 space-y-4
                bg-white
              "
            >
              <Icon className=" size-8 text-[#E11D48]" />
              <div className="space-y-1">
                <div className="text-[13px] sm:text-[14px] md:text-[15px] font-medium text-[#475569] leading-snug">
                  {t(`home.${stat.key}Title`)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap mt-auto pt-2">
                <span className="text-2xl sm:text-[25px] md:text-[26px] font-bold text-[#E11D48]">
                  {stat.value}
                </span>
                <span className="text-[11px] sm:text-xs md:text-[13px] text-text-secondary whitespace-nowrap">
                  {t(`home.${stat.key}Subtext`)}
                </span>
              </div>
            </m.div>
          );
        })}
      </m.div>
    </section>
  );
}
