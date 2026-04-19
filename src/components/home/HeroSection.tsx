"use client";

import { useLanguage } from "@/hooks/useLanguage";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="text-center space-y-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight tracking-tight">
        {t("home.hero")}
      </h1>
      <p className="text-[15px] text-text-secondary leading-relaxed max-w-md mx-auto">
        {t("home.heroSub")}
      </p>
    </section>
  );
}
