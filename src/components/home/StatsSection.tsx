"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { SCAM_STATS } from "@/data/scamStats";

export default function StatsSection() {
  const { t } = useLanguage();

  // Show only statsCases and statsDaily (2 cards as per design)
  const displayStats = SCAM_STATS.filter(
    (stat) => stat.key === "statsCases" || stat.key === "statsDaily"
  );

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {displayStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.key}
              className="
                rounded-2xl border border-border
                p-4 space-y-3
                bg-gradient-to-b from-[#FBE8DF] to-[#FFFFFF]
              "
            >
              <Icon className="w-8 h-8 p-1.5 rounded-full text-risk-high bg-[#FFE4E6]" />
              <div className="text-xs text-text-secondary">
                {t(`home.${stat.key}`)}
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
