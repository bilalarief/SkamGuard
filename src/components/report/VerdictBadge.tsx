import { AlertTriangle } from "lucide-react";

interface VerdictBadgeProps {
  level: "safe" | "low" | "medium" | "high" | "critical";
  text: string;
}

export default function VerdictBadge({ level, text }: VerdictBadgeProps) {
  const isLowRisk = level === "safe" || level === "low";
  const isMediumRisk = level === "medium";

  const colorClass = isLowRisk
    ? "bg-risk-low-bg text-risk-low"
    : isMediumRisk
    ? "bg-risk-medium-bg text-risk-medium"
    : "bg-risk-high-bg text-risk-high";

  return (
    <div className="flex justify-center">
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${colorClass}`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{text}</span>
      </div>
    </div>
  );
}
