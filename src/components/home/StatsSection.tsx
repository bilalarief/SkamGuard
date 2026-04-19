"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { SCAM_STATS } from "@/data/scamStats";

export default function StatsSection() {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
        {t("home.statsTitle")}
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {SCAM_STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.key}
              className="
                bg-surface rounded-radius-md border border-border
                p-4 text-center space-y-2
              "
            >
              <Icon className="w-4 h-4 text-text-muted mx-auto" />
              <div className="text-lg font-bold text-risk-high">
                {stat.value}
              </div>
              <div className="text-[11px] text-text-muted leading-tight">
                {t(`home.${stat.key}`)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
