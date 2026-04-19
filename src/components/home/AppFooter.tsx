"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function AppFooter() {
  const { t } = useLanguage();

  return (
    <footer className="text-center space-y-2 pt-2">
      <p className="text-xs text-text-muted leading-relaxed">
        {t("footer.disclaimer")}
      </p>
      <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
        <Sparkles className="w-3 h-3" />
        <span className="font-medium">{t("common.poweredBy")}</span>
      </div>
    </footer>
  );
}
