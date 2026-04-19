import type { RiskLevel } from "@/data/redFlags";

export function formatRiskScore(score: number): string {
  return Math.round(Math.max(0, Math.min(100, score))).toString();
}

export function getRiskColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    safe: "text-risk-low",
    low: "text-risk-low",
    medium: "text-risk-medium",
    high: "text-risk-high",
    critical: "text-risk-critical",
  };
  return map[level];
}

export function getRiskBgColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    safe: "bg-risk-low-bg border-risk-low/30",
    low: "bg-risk-low-bg border-risk-low/30",
    medium: "bg-risk-medium-bg border-risk-medium/30",
    high: "bg-risk-high-bg border-risk-high/30",
    critical: "bg-risk-critical-bg border-risk-critical/30",
  };
  return map[level];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
