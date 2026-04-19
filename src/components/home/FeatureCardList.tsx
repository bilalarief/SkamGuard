"use client";

import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { FEATURE_CARDS } from "@/data/featureCards";

export default function FeatureCardList() {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      {FEATURE_CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.id}
            className="
              w-full flex items-center gap-4 p-4
              bg-surface rounded-radius-md
              border border-border
              hover:border-primary/30 hover:shadow-sm
              active:scale-[0.99]
              transition-all duration-150
              text-left cursor-pointer group
            "
          >
            <div
              className={`
                w-11 h-11 shrink-0 rounded-radius-sm
                flex items-center justify-center
                ${card.iconBg}
                transition-colors duration-150
              `}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] text-text-primary">
                {t(card.labelKey)}
              </h3>
              <p className="text-sm text-text-secondary mt-0.5 leading-snug">
                {t(card.descKey)}
              </p>
            </div>

            <ChevronRight
              className="
                w-4 h-4 text-text-muted shrink-0
                group-hover:text-primary group-hover:translate-x-0.5
                transition-all duration-150
              "
            />
          </button>
        );
      })}
    </section>
  );
}
