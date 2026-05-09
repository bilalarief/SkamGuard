"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Flag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysisStore } from "@/store/analysis.store";
import { getRiskBgColor, getRiskColor } from "@/lib/utils/formatters";
import RiskGauge from "@/components/report/RiskGauge";
import ActionButton from "@/components/report/ActionButton";
import ShareDrawer from "@/components/report/ShareDrawer";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import ScamTypeCard from "@/components/report/ScamTypeCard";
import RedFlagsCard from "@/components/report/RedFlagsCard";
import VerdictBadge from "@/components/report/VerdictBadge";
import CommunityReportButtons from "@/components/report/CommunityReportButtons";
import FooterDisclaimer from "@/components/shared/FooterDisclaimer";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { useToast } from "@/hooks/useToast";
import type { RiskLevel } from "@/types/analysis";
import { ReportPageSkeleton } from "@/components/shared/Skeleton";

function ReportContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { report, source, setReport } = useAnalysisStore();
  const { user } = useAuth();

  const [showReportModal, setShowReportModal] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [reportType, setReportType] = useState<"phone" | "url">("phone");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const { toasts, dismissToast, success: toastSuccess, error: toastError } = useToast();

  // Use authenticated user's uid if available, otherwise 'guest'
  const userId = user?.uid || "guest";

  // Back destination depends on where the user came from
  const backPath = source === "history" ? "/history" : "/scan";

  useEffect(() => {
    if (!report) {
      if (searchParams.get("debug") === "true") {
        setReport({
          overallScore: 80,
          riskLevel: "high",
          verdict: "DANGEROUS",
          scamType: "macauScam",
          redFlags: [
            "Mengaku sebagai pihak berkuasa (polis/mahkamah)",
            "Mendesak untuk tindakan segera",
          ],
          explanation: "This message is likely a scam.",
          actionPlan: [
            { type: "do_not_pay", label: "JANGAN pindahkan wang ke mana-mana akaun" },
            { type: "call_nsrc", label: "Hubungi NSRC 997 segera (8 pagi - 8 malam)", phone: "997" },
          ],
          extractedContent: {
            messageText: "Mock analysis content",
            urls: [],
            phoneNumbers: [],
            sender: "Unknown",
          },
          phoneResult: null,
          urlResults: [],
          semakMuleUrl: null,
          timestamp: new Date().toISOString(),
        });
      } else {
        router.replace(backPath);
      }
    }
  }, [report, router, backPath, searchParams, setReport]);

  if (!report) return null;

  const { overallScore, riskLevel, verdict, scamType, redFlags, explanation, actionPlan, phoneResult, urlResults, semakMuleUrl } = report;
  const firstUrl = urlResults?.[0]?.url;

  function handleSemakMule() {
    if (semakMuleUrl) window.open(semakMuleUrl, "_blank");
  }

  async function handleReportSubmit() {
    setReportLoading(true);

    try {
      const endpoint = reportType === "phone" ? "/api/report-phone" : "/api/report-url";
      const payload =
        reportType === "phone"
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
        /* Close modal immediately — toast carries the confirmation. */
        setShowReportModal(false);
        setReportDescription("");
        toastSuccess(
          "toast.reportSuccess",
          "toast.reportSuccessDesc"
        );
      } else {
        toastError(
          "toast.reportFailed",
          "toast.reportFailedDesc"
        );
      }
    } catch {
      toastError(
        "toast.networkError",
        "toast.networkErrorDesc"
      );
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
      {/* Toast portal — top-center, responsive */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {/* Back button */}
      <button
        onClick={() => router.push(backPath)}
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
      <h1 className="text-2xl sm:text-[25px] md:text-[26px] font-extrabold text-text-primary leading-tight">
        {t("report.scoreTitle")}
      </h1>

      {/* Risk gauge & verdict badge */}
      <section id="report-risk-card" className="bg-white p-3 rounded-sm space-y-4">
        <div className=" p-6">
          <RiskGauge score={overallScore} level={riskLevel as RiskLevel} />
        </div>
        <div className=" pb-6">
        {/* Verdict badge */}
        <VerdictBadge level={riskLevel as any} text={verdictBadgeText} />
        </div>

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
            {actionPlan.map((action: any, i: number) => (
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
        </section>  

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          data-tour="share-score-btn"
          onClick={() => setIsShareOpen(true)}
          className="
            w-full h-12 rounded-sm
            bg-[#00A6F4] text-white text-base font-semibold
            active:scale-[0.98]
            hover:scale-101
            transition-all duration-200 cursor-pointer shadow-sm
            flex items-center justify-center gap-2
          "
        >
          {t("history.shareScore")}
        </button>

        <button
          data-tour="scan-again-btn"
          onClick={() => router.push("/scan")}
          className="
            w-full h-12 rounded-sm
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
        <div className="space-y-4">
          {/* Reporting target preview */}
          <div className="p-3 bg-surface-hover rounded-sm">
            <p className="text-sm font-medium text-text-primary truncate">
              {reportType === "phone"
                ? `${t("common.number")}: ${phoneResult?.number}`
                : `${t("common.link")}: ${firstUrl}`}
            </p>
            {scamType && (
              <p className="text-xs text-text-secondary mt-1">
                {t("common.type")}: {t(`scamTypes.${scamType}.name`)}
              </p>
            )}
          </div>

          {/* Optional description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              {t("report.reportDescription")}
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder={t("report.reportPlaceholder")}
              rows={3}
              maxLength={500}
              className="w-full p-3 bg-surface border border-border rounded-sm text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors duration-150 resize-none"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={reportLoading}
            onClick={handleReportSubmit}
          >
            <Flag className="w-4 h-4" />
            {t("report.reportSubmit")}
          </Button>

          <p className="text-xs text-text-muted text-center">
            {t("report.reportAnonymous")}
          </p>
        </div>
      </Modal>

      <ShareDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        score={overallScore}
        verdict={riskLevel as any}
      />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <ReportContent />
    </Suspense>
  );
}
