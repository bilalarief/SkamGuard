"use client";

import { CircleCheck, CircleAlert, OctagonAlert } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ActionStep } from "@/data/actionPlans";

interface ActionPlanProps {
  steps: ActionStep[];
}

const priorityConfig = {
  critical: { icon: OctagonAlert, color: "text-risk-high", bg: "bg-risk-high-bg/50" },
  high: { icon: CircleAlert, color: "text-risk-medium", bg: "bg-risk-medium-bg/50" },
  normal: { icon: CircleCheck, color: "text-primary", bg: "bg-primary-50" },
};

export default function ActionPlan({ steps }: ActionPlanProps) {
  const { t } = useLanguage();

  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
        {t("report.actionPlan")}
      </h2>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const config = priorityConfig[step.priority];
          const Icon = config.icon;

          return (
            <div
              key={step.id}
              className={`
                flex items-start gap-3 p-3
                ${config.bg} border border-transparent
                rounded-radius-sm
              `}
            >
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                <span className="text-xs font-bold text-text-muted w-4 text-center">
                  {i + 1}
                </span>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <span className="text-sm text-text-primary leading-snug">
                {t(step.labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
