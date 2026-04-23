"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface AnalyzingProgressProps {
  onBack?: () => void;
}

const STEPS = [
  { key: "scan.loadingStep1", duration: 2000 },
  { key: "scan.loadingStep2", duration: 3500 },
  { key: "scan.loadingStep3", duration: 5500 },
  { key: "scan.loadingStep4", duration: 7500 },
  { key: "scan.loadingStep5", duration: 10000 },
];

/** Gemini AI logo as inline SVG */
function GeminiLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 28C14 21.75 9.25 16.5 3 15.75C2 15.65 1 15.5 0 15.5V12.5C1 12.5 2 12.35 3 12.25C9.25 11.5 14 6.25 14 0C14 6.25 18.75 11.5 25 12.25C26 12.35 27 12.5 28 12.5V15.5C27 15.5 26 15.65 25 15.75C18.75 16.5 14 21.75 14 28Z"
        fill="url(#gemini_gradient)"
      />
      <defs>
        <linearGradient id="gemini_gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AnalyzingProgress({ onBack }: AnalyzingProgressProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    // Eased progress: fast start, slows near 90%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        // Logarithmic easing — slows down as it approaches 90
        const remaining = 90 - prev;
        const increment = Math.max(0.3, remaining * 0.04);
        return Math.min(90, prev + increment);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = STEPS.map((step, index) =>
      setTimeout(() => {
        setCompletedSteps(index + 1);
      }, step.duration)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (progress / 100) * circumference;

  // Check if we're on the last step (Gemini AI analysis)
  const isGeminiStep = completedSteps === STEPS.length - 1;

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

      {/* Circular progress with Gemini branding */}
      <div className="flex justify-center py-4">
        <div
          className="relative w-40 h-40 bg-surface rounded-2xl flex items-center justify-center p-4"
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
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4285F4" />
                <stop offset="50%" stopColor="#9B72CB" />
                <stop offset="100%" stopColor="#D96570" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            {isGeminiStep && (
              <GeminiLogo className="w-5 h-5 animate-gentle-pulse" />
            )}
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
          const isGemini = step.key === "scan.loadingStep5";

          return (
            <div
              key={step.key}
              className="flex items-center gap-3"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#2BB5E0] shrink-0" />
              ) : isActive && isGemini ? (
                /* Gemini AI step — show Gemini logo + pulsing dots */
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <GeminiLogo className="w-4 h-4 animate-gentle-pulse" />
                </div>
              ) : (
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center ${isActive ? 'animate-spin-slow' : ''}`}>
                  <Sparkles className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted/40'}`} />
                </div>
              )}

              <div className="flex items-center gap-2">
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

                {/* Gemini pulsing dots on active Gemini step */}
                {isActive && isGemini && (
                  <div className="gemini-dots ml-1">
                    <div className="gemini-dot" />
                    <div className="gemini-dot" />
                    <div className="gemini-dot" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gemini branding footer */}
      <footer className="text-center space-y-3 pt-6">
        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
          <GeminiLogo className="w-4 h-4" />
          <span className="font-medium">{t("common.poweredBy")}</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          {t("footer.disclaimer")}
        </p>
      </footer>
    </div>
  );
}
