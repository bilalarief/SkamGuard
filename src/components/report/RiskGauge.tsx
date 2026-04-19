"use client";

import type { RiskLevel } from "@/types/analysis";
import { getRiskColor } from "@/lib/utils/formatters";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = getRiskColor(level);

  const strokeColorMap: Record<RiskLevel, string> = {
    safe: "#2ECC71",
    low: "#2ECC71",
    medium: "#F39C12",
    high: "#E74C3C",
    critical: "#8E1B1B",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-extrabold ${colorClass}`}>
            {Math.round(score)}
          </span>
        </div>
      </div>
    </div>
  );
}
