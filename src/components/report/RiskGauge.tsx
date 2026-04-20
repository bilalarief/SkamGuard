"use client";

import type { RiskLevel } from "@/types/analysis";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const strokeColorMap: Record<RiskLevel, string> = {
    safe: "#2ECC71",
    low: "#2ECC71",
    medium: "#F39C12",
    high: "#E74C3C",
    critical: "#8E1B1B",
  };

  const labelMap: Record<RiskLevel, string> = {
    safe: "Safe",
    low: "Low Risk",
    medium: "Warning",
    high: "Danger",
    critical: "Critical",
  };

  const textColorMap: Record<RiskLevel, string> = {
    safe: "text-risk-low",
    low: "text-risk-low",
    medium: "text-risk-medium",
    high: "text-risk-high",
    critical: "text-risk-critical",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={strokeColorMap[level]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${textColorMap[level]}`}>
            {Math.round(score)}
          </span>
          <span className={`text-xs font-semibold ${textColorMap[level]}`}>
            {labelMap[level]}
          </span>
        </div>
      </div>
    </div>
  );
}
