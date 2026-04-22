"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { SCAM_STATS } from "@/data/scamStats";

export default function StatsSection() {
  const { t } = useLanguage();

  // Show only statsCases and statsLoss
  const displayStats = SCAM_STATS.filter(
    (stat) => stat.key === "statsCases" || stat.key === "statsLoss"
  );

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {displayStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.key}
              className="
                rounded-2xl border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                p-5 space-y-4
                bg-white
              "
            >
              <Icon className="w-8 h-8 text-[#E11D48]" />
              <div className="space-y-1">
                <div className="text-[13px] font-medium text-[#475569] leading-snug">
                  {stat.title || t(`home.${stat.key}`)}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap mt-auto pt-2">
                <span className="text-2xl font-bold text-[#E11D48]">
                  {stat.value}
                </span>
                {stat.subtext && (
                  <span className="text-[11px] text-text-secondary whitespace-nowrap">
                    {stat.subtext}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
