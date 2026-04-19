"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  ExternalLink,
  Flag,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysisStore } from "@/store/analysis.store";
import { getRiskBgColor, getRiskColor } from "@/lib/utils/formatters";
import RiskGauge from "@/components/report/RiskGauge";
import RedFlagsList from "@/components/report/RedFlagsList";
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

  return (
    <div className="container-app py-6 space-y-6">
      {/* Risk gauge & verdict */}
      <section className="text-center space-y-3">
        <h1 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          {t("report.riskScore")}
        </h1>
        <RiskGauge score={overallScore} level={riskLevel as RiskLevel} />
        <div
          className={`
            inline-block px-4 py-2 rounded-radius-full
            text-sm font-semibold border
            ${getRiskBgColor(riskLevel as RiskLevel)} ${getRiskColor(riskLevel as RiskLevel)}
          `}
        >
          {t(`report.verdicts.${riskLevel}`)}
        </div>
      </section>

      {/* AI explanation */}
      {explanation && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            {t("report.aiExplanation")}
          </h2>
          <div className="p-4 bg-surface rounded-radius-md border border-border">
            <p className="text-sm text-text-primary leading-relaxed">{explanation}</p>
          </div>
        </section>
      )}

      {/* Scam type */}
      {scamType && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            {t("report.scamType")}
          </h2>
          <div className="flex items-start gap-3 p-4 bg-surface rounded-radius-md border border-border">
            <ShieldAlert className="w-5 h-5 text-risk-high shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text-primary">
                {t(`scamTypes.${scamType}.name`)}
              </h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {t(`scamTypes.${scamType}.desc`)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Red flags */}
      {redFlags.length > 0 && <RedFlagsList flags={redFlags} />}

      {/* Action plan */}
      {actionPlan.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            {t("report.actionPlan")}
          </h2>
          <div className="space-y-2">
            {actionPlan.map((step, i) => (
              <div
                key={`step-${i}`}
                className={`
                  flex items-start gap-3 p-3 rounded-radius-sm
                  ${i < 2 ? "bg-risk-high-bg/50" : i < 4 ? "bg-risk-medium-bg/50" : "bg-primary-50"}
                `}
              >
                <span className="text-xs font-bold text-text-muted w-4 text-center mt-0.5">{i + 1}</span>
                <span className="text-sm text-text-primary leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Semak Mule + community report */}
      {phoneResult && phoneResult.number !== "UNKNOWN" && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
            {t("report.furtherVerification")}
          </h2>

          <button
            onClick={handleSemakMule}
            className="w-full flex items-center gap-3 p-4 bg-surface rounded-radius-md border border-border hover:border-primary/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-radius-sm bg-primary/10 flex items-center justify-center shrink-0">
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
            className="w-full flex items-center gap-3 p-4 bg-surface rounded-radius-md border border-border hover:border-accent/30 hover:shadow-sm active:scale-[0.99] transition-all duration-150 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-radius-sm bg-accent/10 flex items-center justify-center shrink-0">
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
        <Button variant="accent" size="lg" fullWidth onClick={handleShareWhatsApp}>
          <MessageCircle className="w-4 h-4" />
          {t("report.shareWhatsApp")}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={() => router.push("/scan")}>
          <RotateCcw className="w-4 h-4" />
          {t("report.newScan")}
        </Button>
      </div>

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
            <div className="p-3 bg-surface-hover rounded-radius-sm">
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
                className="w-full p-3 bg-surface border border-border rounded-radius-sm text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors duration-150 resize-none"
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
