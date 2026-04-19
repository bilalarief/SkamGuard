export interface RedFlag {
  id: string;
  labelKey: string;
  weight: number;
}

export const RED_FLAGS: RedFlag[] = [
  { id: "impersonation", labelKey: "report.actionItems.verifyIdentity", weight: 20 },
  { id: "urgency", labelKey: "report.verdicts.high", weight: 15 },
  { id: "money_request", labelKey: "report.actionItems.dontTransfer", weight: 25 },
  { id: "threats", labelKey: "report.actionItems.callNSRC", weight: 20 },
  { id: "suspicious_link", labelKey: "report.actionItems.dontClick", weight: 15 },
  { id: "otp_request", labelKey: "report.actionItems.dontShareOTP", weight: 25 },
  { id: "too_good", labelKey: "report.verdicts.medium", weight: 10 },
  { id: "unknown_sender", labelKey: "report.actionItems.blockSender", weight: 10 },
];

export function calculateRiskScore(flagIds: string[]): number {
  const total = flagIds.reduce((sum, id) => {
    const flag = RED_FLAGS.find((f) => f.id === id);
    return sum + (flag?.weight ?? 0);
  }, 0);

  return Math.min(100, total);
}

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 10) return "safe";
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  if (score <= 80) return "high";
  return "critical";
}
