"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScanSearch, Link2, Phone, MessageSquareText, ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysis, fileToBase64 } from "@/hooks/useAnalysis";
import ScreenshotUploader from "@/components/scan/ScreenshotUploader";
import UrlChecker from "@/components/scan/UrlChecker";
import PhoneChecker from "@/components/scan/PhoneChecker";
import AnalyzingProgress from "@/components/scan/AnalyzingProgress";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type ScanMode = "screenshot" | "message" | "url" | "phone";

interface ModeCard {
  mode: ScanMode;
  icon: typeof ScanSearch;
  labelKey: string;
  descKey: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  recommended?: boolean;
}

const MODE_CARDS: ModeCard[] = [
  {
    mode: "screenshot",
    icon: ScanSearch,
    labelKey: "home.ctaScan",
    descKey: "home.ctaScanDesc",
    gradient: "from-[#E8F4FD] via-[#F0F8FF] to-[#FFFFFF]",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    recommended: true,
  },
  {
    mode: "message",
    icon: MessageSquareText,
    labelKey: "scan.checkMessage",
    descKey: "scan.checkMessageDesc",
    gradient: "from-[#F0EAFF] via-[#F5F0FF] to-[#FFFFFF]",
    iconBg: "bg-[#8B5CF6]/10",
    iconColor: "text-[#8B5CF6]",
  },
  {
    mode: "url",
    icon: Link2,
    labelKey: "home.ctaUrl",
    descKey: "home.ctaUrlDesc",
    gradient: "from-[#FEF9E7] via-[#FFFDF0] to-[#FFFFFF]",
    iconBg: "bg-[#F59E0B]/10",
    iconColor: "text-[#D97706]",
  },
  {
    mode: "phone",
    icon: Phone,
    labelKey: "home.ctaPhone",
    descKey: "home.ctaPhoneDesc",
    gradient: "from-[#ECFDF5] via-[#F0FFF4] to-[#FFFFFF]",
    iconBg: "bg-[#10B981]/10",
    iconColor: "text-[#059669]",
  },
];

function ScanContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const { submit, isLoading, error } = useAnalysis();

  const initialMode = searchParams.get("mode") as ScanMode | null;
  const [activeMode, setActiveMode] = useState<ScanMode | null>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  async function handleAnalyze() {
    const language = locale === "ms" ? "BM" : "EN";

    if (activeMode === "screenshot") {
      let imageData: string | undefined;

      if (file) {
        imageData = await fileToBase64(file);
      }

      await submit({
        image: imageData,
        text: text.trim() || undefined,
        language,
      });
    } else if (activeMode === "message") {
      await submit({
        text: text.trim(),
        language,
      });
    } else if (activeMode === "url") {
      await submit({
        text: urlInput.trim(),
        language,
      });
    } else if (activeMode === "phone") {
      await submit({
        phoneNumber: phoneInput.trim(),
        language,
      });
    }
  }

  const canSubmit =
    (activeMode === "screenshot" && (file !== null || text.trim().length > 0)) ||
    (activeMode === "message" && text.trim().length > 0) ||
    (activeMode === "url" && urlInput.trim().length > 0) ||
    (activeMode === "phone" && phoneInput.trim().length > 0);

  function handleBack() {
    setActiveMode(null);
    setFile(null);
    setText("");
    setUrlInput("");
    setPhoneInput("");
  }

  // ──────────────────────────────────────────────
  //  Loading / Analyzing View
  // ──────────────────────────────────────────────
  if (isLoading) {
    return <AnalyzingProgress />;
  }

  // ──────────────────────────────────────────────
  //  Card Selection View (no mode selected yet)
  // ──────────────────────────────────────────────
  if (!activeMode) {
    return (
      <div className="container-app py-6 space-y-6">
        <h1 className="text-2xl font-extrabold text-text-primary leading-tight">
          {t("scan.title")}
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {MODE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.mode}
                onClick={() => setActiveMode(card.mode)}
                className={`
                  relative text-left p-4 rounded-2xl border border-border
                  bg-gradient-to-br ${card.gradient}
                  hover:shadow-md active:scale-[0.98]
                  transition-all duration-200 cursor-pointer
                  flex flex-col gap-3 min-h-[160px]
                `}
              >
                {/* Recommend badge */}
                {card.recommended && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {t("scan.recommended")}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${card.iconBg}
                  `}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>

                {/* Text */}
                <div className="mt-auto">
                  <h3 className="font-bold text-sm text-text-primary leading-tight">
                    {t(card.labelKey)}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-snug">
                    {t(card.descKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  //  Active Mode View (feature interface)
  // ──────────────────────────────────────────────
  const currentCard = MODE_CARDS.find((c) => c.mode === activeMode);

  return (
    <div className="container-app py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="
          flex items-center gap-2 text-sm font-medium text-text-primary
          hover:text-primary active:scale-[0.98]
          transition-all duration-150 cursor-pointer
        "
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("common.back")}</span>
      </button>

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-text-primary leading-tight">
        {currentCard ? t(currentCard.labelKey) : t("scan.title")}
      </h1>

      {/* Mode Content */}
      <div className="space-y-4">
        {activeMode === "screenshot" && (
          <ScreenshotUploader onFileSelect={setFile} />
        )}

        {activeMode === "message" && (
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("scan.pastePlaceholder")}
              rows={6}
              className="
                w-full p-4
                bg-surface border-2 border-dashed border-border rounded-2xl
                text-sm text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-primary focus:border-solid focus:ring-1 focus:ring-primary/20
                transition-colors duration-150 resize-none
              "
            />
          </div>
        )}

        {activeMode === "url" && (
          <UrlChecker onSubmit={setUrlInput} onChange={setUrlInput} />
        )}

        {activeMode === "phone" && (
          <PhoneChecker onSubmit={setPhoneInput} onChange={setPhoneInput} />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-risk-high-bg/50 border border-risk-high/20 rounded-xl">
          <p className="text-sm text-risk-high">{error}</p>
        </div>
      )}

      {/* Submit button — gray when disabled, blue when enabled */}
      <button
        disabled={!canSubmit}
        onClick={handleAnalyze}
        className={`
          w-full h-12 rounded-xl
          text-base font-semibold
          transition-all duration-200
          ${canSubmit
            ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.98] cursor-pointer shadow-sm"
            : "bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed"
          }
        `}
      >
        {t("scan.analyzeButton")}
      </button>

      {/* Footer disclaimer */}
      <footer className="text-center space-y-2 pt-4">
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

export default function ScanPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="md" className="py-20" />}>
      <ScanContent />
    </Suspense>
  );
}
