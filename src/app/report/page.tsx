"use client";

import { useRouter } from "next/navigation";
import { Share2, MessageCircle, RotateCcw, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getRiskLevel } from "@/data/redFlags";
import { ACTION_PLANS } from "@/data/actionPlans";
import { getRiskBgColor, getRiskColor } from "@/lib/utils/formatters";
import RiskGauge from "@/components/report/RiskGauge";
import RedFlagsList from "@/components/report/RedFlagsList";
import ActionPlan from "@/components/report/ActionPlan";
import Button from "@/components/shared/Button";

// TODO: Replace with real data from AI analysis response
const MOCK_REPORT = {
  riskScore: 85,
  scamTypeId: "macauScam",
  redFlags: [
    "Mengaku sebagai pihak berkuasa (polis/mahkamah)",
    "Mendesak untuk tindakan segera",
    "Meminta pindahan wang ke akaun peribadi",
    "Mengancam dengan tindakan undang-undang",
  ],
};

export default function ReportPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const { riskScore, scamTypeId, redFlags } = MOCK_REPORT;
  const riskLevel = getRiskLevel(riskScore);
  const actions = ACTION_PLANS[riskLevel === "critical" ? "high" : riskLevel] ?? ACTION_PLANS.low;

  return (
    <div className="container-app py-6 space-y-6">
      {/* Risk Gauge */}
      <section className="text-center space-y-3">
        <h1 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          {t("report.riskScore")}
        </h1>
        <RiskGauge score={riskScore} level={riskLevel} />
        <div
          className={`
            inline-block px-4 py-2 rounded-radius-full
            text-sm font-semibold border
            ${getRiskBgColor(riskLevel)} ${getRiskColor(riskLevel)}
          `}
        >
          {t(`report.verdicts.${riskLevel}`)}
        </div>
      </section>

      {/* Scam Type */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          {t("report.scamType")}
        </h2>
        <div className="flex items-start gap-3 p-4 bg-surface rounded-radius-md border border-border">
          <ShieldAlert className="w-5 h-5 text-risk-high shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text-primary">
              {t(`scamTypes.${scamTypeId}.name`)}
            </h3>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              {t(`scamTypes.${scamTypeId}.desc`)}
            </p>
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <RedFlagsList flags={redFlags} />

      {/* Action Plan */}
      <ActionPlan steps={actions} />

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button variant="accent" size="lg" fullWidth>
          <MessageCircle className="w-4 h-4" />
          {t("report.shareWhatsApp")}
        </Button>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => router.push("/scan")}
        >
          <RotateCcw className="w-4 h-4" />
          {t("report.newScan")}
        </Button>
      </div>
    </div>
  );
}
