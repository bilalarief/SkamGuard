"use client";

import {
  ShieldCheck,
  ScanSearch,
  Link2,
  Phone,
  ChevronRight,
  TrendingDown,
  FileWarning,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const SCAM_STATS = [
  { key: "statsLoss", value: "RM2.7B", icon: TrendingDown },
  { key: "statsCases", value: "67,735", icon: FileWarning },
  { key: "statsDaily", value: "~185", icon: CalendarClock },
];

const FEATURE_CARDS = [
  {
    id: "scan-screenshot",
    icon: ScanSearch,
    labelKey: "home.ctaScan",
    descKey: "home.ctaScanDesc",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: "check-url",
    icon: Link2,
    labelKey: "home.ctaUrl",
    descKey: "home.ctaUrlDesc",
    iconBg: "bg-accent/10 text-accent-dark",
  },
  {
    id: "check-phone",
    icon: Phone,
    labelKey: "home.ctaPhone",
    descKey: "home.ctaPhoneDesc",
    iconBg: "bg-risk-low/10 text-risk-low",
  },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="container-app py-8 space-y-10">
      {/* Hero */}
      <section className="text-center space-y-5">

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight tracking-tight">
            {t("home.hero")}
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed max-w-md mx-auto">
            {t("home.heroSub")}
          </p>
        </div>
      </section>

      {/* Feature Cards */}
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

      {/* Stats */}
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

      {/* Footer */}
      <footer className="text-center space-y-2 pt-2">
        <p className="text-xs text-text-muted leading-relaxed">
          {t("footer.disclaimer")}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">{t("common.poweredBy")}</span>
        </div>
      </footer>
    </div>
  );
}
