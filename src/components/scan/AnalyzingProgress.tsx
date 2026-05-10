"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysisStore, type AnalysisStep } from "@/store/analysis.store";

interface AnalyzingProgressProps {
  onBack?: () => void;
}

/**
 * Step definitions — mapped to SSE step events.
 * Order matters: progress bar and checkmarks follow this sequence.
 */
const STEPS: { stepId: AnalysisStep; key: string; thinkingKey: string }[] = [
  {
    stepId: "extracting",
    key: "scan.loadingStep1",
    thinkingKey: "scan.thinking.extracting",
  },
  {
    stepId: "checking_tools",
    key: "scan.loadingStep4",
    thinkingKey: "scan.thinking.checking",
  },
  {
    stepId: "analyzing",
    key: "scan.loadingStep5",
    thinkingKey: "scan.thinking.analyzing",
  },
  {
    stepId: "scoring",
    key: "scan.loadingStep3",
    thinkingKey: "scan.thinking.scoring",
  },
];

/** AI "thinking" text bubbles — rotates through variations */
const THINKING_VARIANTS = {
  extracting: [
    "scan.thinking.extract1",
    "scan.thinking.extract2",
    "scan.thinking.extract3",
  ],
  checking_tools: [
    "scan.thinking.check1",
    "scan.thinking.check2",
    "scan.thinking.check3",
  ],
  analyzing: [
    "scan.thinking.analyze1",
    "scan.thinking.analyze2",
    "scan.thinking.analyze3",
  ],
  scoring: [
    "scan.thinking.score1",
    "scan.thinking.score2",
  ],
};

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
        fill="url(#gemini_gradient_prog)"
      />
      <defs>
        <linearGradient id="gemini_gradient_prog" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
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
  const realCurrentStep = useAnalysisStore((s) => s.currentStep);
  const searchParams = useSearchParams();
  const isMock = searchParams.get("mock_loading") === "true";

  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [mockStep, setMockStep] = useState<AnalysisStep | "complete" | "error">("extracting");
  const [mockProgress, setMockProgress] = useState(0);

  // Mock progress simulation for onboarding tour
  useEffect(() => {
    if (!isMock) return;
    let current = 0;
    const interval = setInterval(() => {
      // randomly increment progress by 1 to 3
      current += Math.floor(Math.random() * 3) + 1;
      if (current >= 100) {
        current = 100;
        setMockStep("complete");
        clearInterval(interval);
        window.dispatchEvent(new Event("mock_analysis_complete"));
      } else if (current >= 80) {
        setMockStep("scoring");
      } else if (current >= 40) {
        setMockStep("analyzing");
      } else if (current >= 15) {
        setMockStep("checking_tools");
      } else {
        setMockStep("extracting");
      }
      setMockProgress(current);
    }, 80); // Updates every 80ms, finishes in roughly 4-5 seconds
    
    return () => clearInterval(interval);
  }, [isMock]);

  const currentStep = isMock ? mockStep : realCurrentStep;

  // Map SSE step to index in our STEPS array
  const activeStepIndex = useMemo(() => {
    if (!currentStep) return 0;
    const idx = STEPS.findIndex((s) => s.stepId === currentStep);
    return idx >= 0 ? idx : STEPS.length;
  }, [currentStep]);

  // Progress percentage — driven by actual step position
  const progress = useMemo(() => {
    if (isMock) return mockProgress;
    if (currentStep === "complete") return 100;
    if (currentStep === "error") return 0;
    // Each step is ~25% of the total
    const base = (activeStepIndex / STEPS.length) * 90;
    return Math.round(base);
  }, [activeStepIndex, currentStep, isMock, mockProgress]);

  // Rotate AI thinking text every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingIndex((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Get current thinking text
  const thinkingText = useMemo(() => {
    if (!currentStep || currentStep === "complete" || currentStep === "error") return null;
    const stepKey = currentStep as keyof typeof THINKING_VARIANTS;
    const variants = THINKING_VARIANTS[stepKey];
    if (!variants || variants.length === 0) return null;
    return t(variants[thinkingIndex % variants.length]);
  }, [currentStep, thinkingIndex, t]);

  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (progress / 100) * circumference;
  const isGeminiStep = currentStep === "analyzing";

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

      <div id="analyzing-content" className="md:flex md:items-start md:gap-10">
        {/* LEFT COLUMN (desktop) / TOP (mobile): Circular progress */}
        <div className="flex flex-col items-center md:w-[200px] md:shrink-0 md:sticky md:top-24">
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
                  className="transition-all duration-500 ease-out"
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
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Gemini branding — shown below circle on desktop only */}
          <div className="hidden md:flex items-center justify-center gap-2 text-xs text-text-secondary mt-2">
            <GeminiLogo className="w-4 h-4" />
            <span className="font-medium">{t("common.poweredBy")}</span>
          </div>
        </div>

        {/* RIGHT COLUMN (desktop) / BOTTOM (mobile): Thinking bubble + Steps */}
        <div className="flex-1 space-y-6 mt-6 md:mt-0">
          {/* AI Thinking Bubble — Gemini-style */}
          <AnimatePresence mode="wait">
            {thinkingText && (
              <m.div
                key={thinkingText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mx-auto md:mx-0 max-w-sm"
              >
                <div className="relative bg-gradient-to-r from-[#f0f4ff] to-[#f5f0ff] border border-[#e0e7ff] rounded-2xl px-4 py-3 shadow-sm">
                  {/* Gemini sparkle icon */}
                  <div className="flex items-start gap-2.5">
                    <GeminiLogo className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-secondary leading-relaxed italic">
                        {thinkingText}
                      </p>
                      {/* Pulsing dots */}
                      <div className="flex gap-1 mt-1.5">
                        {[0, 1, 2].map((i) => (
                          <m.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#4285F4] to-[#9B72CB]"
                            animate={{
                              opacity: [0.3, 1, 0.3],
                              scale: [0.8, 1, 0.8],
                            }}
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Step indicators — driven by SSE events */}
          <div className="space-y-3 px-2 md:px-0">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStepIndex || currentStep === "complete";
              const isActive = index === activeStepIndex && currentStep !== "complete";
              const isGemini = step.stepId === "analyzing";

              return (
                <m.div
                  key={step.stepId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {isCompleted ? (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#2BB5E0] shrink-0" />
                    </m.div>
                  ) : isActive && isGemini ? (
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
                </m.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gemini branding footer */}
      <footer className="text-center space-y-3 pt-6">
        <div className="flex md:hidden items-center justify-center gap-2 text-xs text-text-secondary">
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
