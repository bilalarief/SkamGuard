"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  ExternalLink,
  Flag,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysisStore } from "@/store/analysis.store";
import { getRiskBgColor, getRiskColor } from "@/lib/utils/formatters";
import RiskGauge from "@/components/report/RiskGauge";
import ActionButton from "@/components/report/ActionButton";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import type { RiskLevel } from "@/types/analysis";

export default function ReportPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { report } = useAnalysisStore();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!report) router.replace("/scan");
  }, [report, router]);

  if (!report) return null;

  const { overallScore, riskLevel, verdict, scamType, redFlags, explanation, actionPlan, phoneResult, semakMuleUrl } = report;

  function handleShareWhatsApp() {
    const verdictText = t(`report.verdicts.${riskLevel}`);
    const scamLine = scamType ? `${t("common.type")}: ${t(`scamTypes.${scamType}.name`)}\n` : "";

    const message = t("report.shareMessage")
      .replace("{{score}}", String(overallScore))
      .replace("{{verdict}}", verdictText)
      .replace("{{scamLine}}", scamLine)
      .replace("{{explanation}}", explanation)
      .replace("{{url}}", typeof window !== "undefined" ? window.location.origin : "");

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  function handleSemakMule() {
    if (semakMuleUrl) window.open(semakMuleUrl, "_blank");
  }

  async function handleReportPhone() {
    if (!phoneResult?.number || phoneResult.number === "UNKNOWN") return;

    setReportLoading(true);
    try {
      const response = await fetch("/api/report-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneResult.number,
          scamType: scamType || undefined,
          description: reportDescription.trim() || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setReportSubmitted(true);
        setTimeout(() => setShowReportModal(false), 2000);
      }
    } catch (error) {
      console.error("Report failed:", error);
    } finally {
      setReportLoading(false);
    }
  }

  // Verdict badge text
  const verdictBadgeText =
    riskLevel === "safe" || riskLevel === "low"
      ? t("report.verdictBadge.safe")
      : riskLevel === "medium"
      ? t("report.verdictBadge.medium")
      : t("report.verdictBadge.high");

  return (
    <div className="container-app py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/scan")}
        className="
          flex items-center gap-2 text-sm font-medium text-text-primary
          hover:text-primary active:scale-[0.98]
          transition-all duration-150 cursor-pointer
        "
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("common.back")}</span>
      </button>

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-text-primary leading-tight">
        {t("report.scoreTitle")}
      </h1>

      {/* Risk gauge & verdict badge */}
      <section className="text-center space-y-4">
        <div className="bg-gradient-to-b from-[#f8f9fa] to-[#ffffff] rounded-2xl p-6">
          <RiskGauge score={overallScore} level={riskLevel as RiskLevel} />
        </div>

        {/* Verdict badge */}
        <div className="flex justify-center">
          <div
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              text-xs font-semibold
              ${riskLevel === "safe" || riskLevel === "low"
                ? "bg-risk-low-bg text-risk-low"
                : riskLevel === "medium"
                ? "bg-risk-medium-bg text-risk-medium"
                : "bg-risk-high-bg text-risk-high"
              }
            `}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{verdictBadgeText}</span>
          </div>
        </div>
      </section>

      {/* Scam type */}
      {scamType && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            {t("report.scamType")}
          </h2>
          <div className="p-4 bg-surface rounded-2xl border border-border">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm text-text-primary">
                  {t(`scamTypes.${scamType}.name`)}
                </span>
                <span className="text-sm text-text-secondary">
                  {" – "}{t(`scamTypes.${scamType}.desc`)}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Red flags */}
      {redFlags.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            {t("report.redFlags")}
          </h2>
          <div className="p-4 bg-surface rounded-2xl border border-border space-y-3">
            {redFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary leading-snug">{flag}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action plan — Agent-style interactive buttons */}
      {actionPlan.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            {t("report.actionPlan")}
          </h2>
          <div className="space-y-2">
            {actionPlan.map((action, i) => (
              <ActionButton key={`action-${i}`} action={action} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Semak Mule + community report */}
      {phoneResult && phoneResult.number !== "UNKNOWN" && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
            {t("report.furtherVerification")}
          </h2>

          <button
            onClick={handleSemakMule}
            className="w-full flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-text-primary">{t("report.semakMuleTitle")}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {t("report.semakMuleDesc").replace("{{number}}", phoneResult.number)}
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-accent/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5 text-accent-dark" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-text-primary">{t("report.reportNumberTitle")}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{t("report.reportNumberDesc")}</p>
            </div>
          </button>
        </section>
      )}

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleShareWhatsApp}
          className="
            w-full h-12 rounded-xl
            bg-primary text-white text-base font-semibold
            hover:bg-primary-dark active:scale-[0.98]
            transition-all duration-200 cursor-pointer shadow-sm
            flex items-center justify-center gap-2
          "
        >
          {t("history.shareScore")}
        </button>

        <button
          onClick={() => router.push("/scan")}
          className="
            w-full h-12 rounded-xl
            bg-surface text-text-primary text-base font-semibold
            border border-border
            hover:bg-surface-hover active:scale-[0.98]
            transition-all duration-200 cursor-pointer
            flex items-center justify-center gap-2
          "
        >
          {t("history.scanAgain")}
        </button>
      </div>

      {/* Footer disclaimer */}
      <footer className="text-center space-y-2 pt-2">
        <p className="text-xs text-text-muted leading-relaxed">
          {t("footer.disclaimer")}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">{t("common.poweredBy")}</span>
        </div>
      </footer>

      {/* Community report modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title={t("report.reportModalTitle")}>
        {reportSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-risk-low mx-auto" />
            <p className="font-semibold text-text-primary">{t("common.thankYou")}</p>
            <p className="text-sm text-text-secondary">{t("report.reportSuccess")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-surface-hover rounded-xl">
              <p className="text-sm font-medium text-text-primary">
                {t("common.number")}: {phoneResult?.number}
              </p>
              {scamType && (
                <p className="text-xs text-text-secondary mt-1">
                  {t("common.type")}: {t(`scamTypes.${scamType}.name`)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">{t("report.reportDescription")}</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder={t("report.reportPlaceholder")}
                rows={3}
                maxLength={500}
                className="w-full p-3 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors duration-150 resize-none"
              />
            </div>

            <Button variant="primary" size="lg" fullWidth loading={reportLoading} onClick={handleReportPhone}>
              <Flag className="w-4 h-4" />
              {t("report.reportSubmit")}
            </Button>

            <p className="text-xs text-text-muted text-center">{t("report.reportAnonymous")}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
