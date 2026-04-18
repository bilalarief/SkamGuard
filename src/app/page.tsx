"use client";

import { useLanguage } from "@/hooks/useLanguage";

const SCAM_STATS = [
  { key: "statsLoss", value: "RM2.7B" },
  { key: "statsCases", value: "67,735" },
  { key: "statsDaily", value: "~185" },
];

const FEATURE_CARDS = [
  {
    id: "scan-screenshot",
    icon: "📸",
    labelKey: "home.ctaScan",
    descKey: "home.ctaScanDesc",
    gradient: "from-primary to-primary-light",
  },
  {
    id: "check-url",
    icon: "🔗",
    labelKey: "home.ctaUrl",
    descKey: "home.ctaUrlDesc",
    gradient: "from-accent-dark to-accent",
  },
  {
    id: "check-phone",
    icon: "📱",
    labelKey: "home.ctaPhone",
    descKey: "home.ctaPhoneDesc",
    gradient: "from-risk-low to-primary-light",
  },
];

export default function HomePage() {
  const { t, locale, toggleLocale } = useLanguage();

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar with language toggle */}
      <div className="container-app flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-primary">
            Skam<span className="text-accent">Guard</span>
          </span>
        </div>
        <button
          onClick={toggleLocale}
          className="
            flex items-center gap-1.5 px-3 py-2
            bg-surface border border-border rounded-radius-full
            text-sm font-medium text-text-primary
            shadow-sm hover:shadow-md
            active:scale-95 transition-all duration-200
            cursor-pointer touch-target
          "
        >
          <span className="text-base leading-none">
            {locale === "ms" ? "🇬🇧" : "🇲🇾"}
          </span>
          <span>{locale === "ms" ? "EN" : "BM"}</span>
        </button>
      </div>

      <main className="container-app pb-12 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-5 pt-6 pb-2">
          <div
            className="
              w-20 h-20 mx-auto
              bg-gradient-to-br from-primary to-primary-light
              rounded-radius-xl
              flex items-center justify-center
              shadow-lg
            "
          >
            <span className="text-4xl">🛡️</span>
          </div>

          <h1 className="text-3xl font-extrabold text-text-primary leading-tight tracking-tight">
            {t("home.hero")}
          </h1>

          <p className="text-base text-text-secondary leading-relaxed max-w-sm mx-auto">
            {t("home.heroSub")}
          </p>
        </section>

        {/* Feature Cards */}
        <section className="space-y-3">
          {FEATURE_CARDS.map((card) => (
            <button
              key={card.id}
              className="
                w-full flex items-center gap-4 p-4
                bg-surface border border-border rounded-radius-md
                shadow-sm hover:shadow-md
                active:scale-[0.98] transition-all duration-200
                text-left cursor-pointer
                group
              "
            >
              <div
                className={`
                  w-14 h-14 shrink-0 rounded-radius-md
                  bg-gradient-to-br ${card.gradient}
                  flex items-center justify-center
                  shadow-sm group-hover:shadow-md transition-shadow duration-200
                `}
              >
                <span className="text-2xl">{card.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary text-base">
                  {t(card.labelKey)}
                </h3>
                <p className="text-sm text-text-secondary mt-0.5 leading-snug">
                  {t(card.descKey)}
                </p>
              </div>

              <span
                className="
                  text-text-muted text-lg shrink-0
                  group-hover:text-primary group-hover:translate-x-0.5
                  transition-all duration-200
                "
              >
                →
              </span>
            </button>
          ))}
        </section>

        {/* Stats Section */}
        <section>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
            {t("home.statsTitle")}
          </h2>

          <div
            className="
              bg-surface border border-border rounded-radius-md
              shadow-sm overflow-hidden
              grid grid-cols-3 divide-x divide-border
            "
          >
            {SCAM_STATS.map((stat) => (
              <div key={stat.key} className="text-center py-4 px-2">
                <div className="text-lg font-extrabold text-risk-high">
                  {stat.value}
                </div>
                <div className="text-[11px] text-text-muted mt-1 leading-tight">
                  {t(`home.${stat.key}`)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center space-y-2 pt-4">
          <p className="text-xs text-text-muted leading-relaxed">
            {t("footer.disclaimer")}
          </p>
          <p className="text-xs font-medium text-text-secondary">
            {t("common.poweredBy")}
          </p>
        </footer>
      </main>
    </div>
  );
}
