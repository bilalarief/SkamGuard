"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  CheckCircle,
  Flag,
} from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysisStore } from "@/store/analysis.store";
import { getRiskBgColor, getRiskColor } from "@/lib/utils/formatters";
import RiskGauge from "@/components/report/RiskGauge";
import ActionButton from "@/components/report/ActionButton";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import ScamTypeCard from "@/components/report/ScamTypeCard";
import RedFlagsCard from "@/components/report/RedFlagsCard";
import VerdictBadge from "@/components/report/VerdictBadge";
import CommunityReportButtons from "@/components/report/CommunityReportButtons";
import FooterDisclaimer from "@/components/shared/FooterDisclaimer";
import type { RiskLevel } from "@/types/analysis";

export default function ReportPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { report } = useAnalysisStore();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"phone" | "url">("phone");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Initialize anonymous auth session for spam prevention
  useEffect(() => {
    const auth = getFirebaseAuth();
    signInAnonymously(auth)
      .then((cred) => setUserId(cred.user.uid))
      .catch((err) => console.warn("Firebase Auth failed:", err));
  }, []);

  useEffect(() => {
    if (!report) router.replace("/scan");
  }, [report, router]);

  if (!report) return null;

  const { overallScore, riskLevel, verdict, scamType, redFlags, explanation, actionPlan, phoneResult, urlResults, semakMuleUrl } = report;
  const firstUrl = urlResults?.[0]?.url;

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

  async function handleReportSubmit() {
    setReportLoading(true);
    
    try {
      const endpoint = reportType === "phone" ? "/api/report-phone" : "/api/report-url";
      const payload = reportType === "phone" 
        ? { phoneNumber: phoneResult?.number }
        : { url: firstUrl };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          scamType: scamType || undefined,
          description: reportDescription.trim() || undefined,
          uid: userId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSubmitted(false); // Reset for next time
          setReportDescription('');
        }, 2000);
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
        <VerdictBadge level={riskLevel as any} text={verdictBadgeText} />
      </section>

      {/* Scam type */}
      {scamType && <ScamTypeCard scamType={scamType} />}

      {/* Red flags */}
      <RedFlagsCard flags={redFlags} />

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

      {/* Community Report Buttons */}
      <CommunityReportButtons 
        phoneResult={phoneResult} 
        firstUrl={firstUrl} 
        semakMuleUrl={semakMuleUrl} 
        onOpenModal={(type) => {
          setReportType(type);
          setShowReportModal(true);
        }}
      />

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
      <FooterDisclaimer />

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
              <p className="text-sm font-medium text-text-primary truncate">
                {reportType === "phone" ? `${t("common.number")}: ${phoneResult?.number}` : `${t("common.link")}: ${firstUrl}`}
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

            <Button variant="primary" size="lg" fullWidth loading={reportLoading} onClick={handleReportSubmit}>
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
