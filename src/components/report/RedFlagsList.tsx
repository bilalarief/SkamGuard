"use client";

import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface RedFlagsListProps {
  flags: string[];
}

export default function RedFlagsList({ flags }: RedFlagsListProps) {
  const { t } = useLanguage();

  if (flags.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
        {t("report.redFlags")}
      </h2>

      <div className="space-y-2">
        {flags.map((flag, i) => (
          <div
            key={i}
            className="
              flex items-start gap-3 p-3
              bg-risk-high-bg/50 border border-risk-high/10
              rounded-radius-sm
            "
          >
            <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
            <span className="text-sm text-text-primary leading-snug">{flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
