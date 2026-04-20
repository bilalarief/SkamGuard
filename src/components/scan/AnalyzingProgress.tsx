"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface AnalyzingProgressProps {
  onBack?: () => void;
}

const STEPS = [
  { key: "scan.loadingStep1", duration: 2000 },
  { key: "scan.loadingStep2", duration: 3000 },
  { key: "scan.loadingStep3", duration: 4000 },
  { key: "scan.loadingStep4", duration: 5500 },
  { key: "scan.loadingStep5", duration: 7000 },
];

export default function AnalyzingProgress({ onBack }: AnalyzingProgressProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to ~90 over time (real completion comes from API)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Mark steps as completed based on time
    const timers = STEPS.map((step, index) =>
      setTimeout(() => {
        setCompletedSteps(index + 1);
      }, step.duration)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="container-app py-6 space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="
            flex items-center gap-2 text-sm font-medium text-text-primary
            hover:text-primary active:scale-[0.98]
            transition-all duration-150 cursor-pointer
          "
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("common.back")}</span>
        </button>
      )}

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-text-primary leading-tight">
        {t("scan.analyzing")}
      </h1>

      {/* Circular progress */}
      <div className="flex justify-center py-4">
        <div className="relative w-40 h-40 bg-surface rounded-2xl flex items-center justify-center p-4"
          style={{ background: "linear-gradient(145deg, #f8f9fa, #ffffff)" }}
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
            <circle
              cx="65" cy="65" r="60"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            <circle
              cx="65" cy="65" r="60"
              fill="none"
              stroke="#2BB5E0"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-extrabold text-text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="space-y-3 px-2">
        {STEPS.map((step, index) => {
          const isCompleted = index < completedSteps;
          const isActive = index === completedSteps;

          return (
            <div key={step.key} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#2BB5E0] shrink-0" />
              ) : (
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center ${isActive ? 'animate-spin' : ''}`}>
                  <Sparkles className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted/40'}`} />
                </div>
              )}
              <span
                className={`text-sm ${
                  isCompleted
                    ? "text-text-primary font-medium"
                    : isActive
                    ? "text-text-primary"
                    : "text-text-muted"
                }`}
              >
                {t(step.key)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer disclaimer */}
      <footer className="text-center space-y-2 pt-6">
        <p className="text-xs text-text-muted leading-relaxed">
          {t("footer.disclaimer")}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">{t("common.poweredBy")}</span>
        </div>
      </footer>
    </div>
  );
}
