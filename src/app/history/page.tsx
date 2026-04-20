"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, AlertTriangle, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useHistoryStore, type HistoryItem } from "@/store/history.store";
import { useAnalysisStore } from "@/store/analysis.store";
import type { RiskLevel, RiskReport } from "@/types/analysis";

function formatRelativeTime(timestamp: string, t: (key: string) => string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) {
    return `${t("history.today")} – ${timeStr}`;
  } else if (diffDays === 1) {
    return `${t("history.yesterday")} – ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${dateStr} – ${timeStr}`;
  }
}

function getVerdictBadge(riskLevel: RiskLevel, t: (key: string) => string): { text: string; className: string } {
  if (riskLevel === "safe" || riskLevel === "low") {
    return {
      text: t("report.verdictBadge.safe"),
      className: "bg-risk-low-bg text-risk-low",
    };
  }
  if (riskLevel === "medium") {
    return {
      text: t("report.verdictBadge.medium"),
      className: "bg-risk-medium-bg text-risk-medium",
    };
  }
  return {
    text: t("report.verdictBadge.high"),
    className: "bg-risk-high-bg text-risk-high",
  };
}

function HistoryCard({
  item,
  onClick,
  t,
}: {
  item: HistoryItem;
  onClick: () => void;
  t: (key: string) => string;
}) {
  const badge = getVerdictBadge(item.riskLevel, t);
  const scamName = item.scamType ? t(`scamTypes.${item.scamType}.name`) : "Unknown";
  const scamDesc = item.scamType ? t(`scamTypes.${item.scamType}.desc`) : item.explanation?.slice(0, 60) || "";

  return (
    <button
      onClick={onClick}
      className="
        w-full text-left p-4
        bg-surface rounded-2xl border border-border
        hover:shadow-sm active:scale-[0.99]
        transition-all duration-150 cursor-pointer
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Scam type title */}
          <h3 className="font-bold text-sm text-text-primary">{scamName}</h3>
          <p className="text-xs text-text-secondary leading-snug line-clamp-2">{scamDesc}</p>

          {/* Verdict badge */}
          <div
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              text-[10px] font-semibold
              ${badge.className}
            `}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{badge.text}</span>
          </div>

          {/* Timestamp */}
          <p className="text-[11px] text-text-muted">
            {formatRelativeTime(item.timestamp, t)}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-text-muted shrink-0 mt-1" />
      </div>
    </button>
  );
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, clearAll } = useHistoryStore();
  const setReport = useAnalysisStore((s) => s.setReport);

  function handleItemClick(item: HistoryItem) {
    // Reconstruct a minimal RiskReport to view in the report page
    const report: RiskReport = {
      overallScore: item.overallScore,
      riskLevel: item.riskLevel,
      verdict: item.verdict as RiskReport["verdict"],
      scamType: item.scamType,
      redFlags: item.redFlags,
      explanation: item.explanation,
      actionPlan: item.actionPlan,
      extractedContent: { messageText: "", urls: [], phoneNumbers: [], sender: null },
      urlResults: [],
      phoneResult: null,
      semakMuleUrl: null,
      timestamp: item.timestamp,
    };

    setReport(report);
    router.push("/report");
  }

  return (
    <div className="container-app py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text-primary leading-tight">
          {t("history.title")}
        </h1>

        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="
              flex items-center gap-1.5 text-xs font-medium text-risk-high
              hover:text-risk-critical active:scale-[0.98]
              transition-all duration-150 cursor-pointer
              px-3 py-1.5 rounded-lg hover:bg-risk-high-bg/50
            "
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("history.clearAll")}</span>
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-hover flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
            {t("history.empty")}
          </p>
        </div>
      )}

      {/* History list */}
      <div className="space-y-3">
        {items.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
