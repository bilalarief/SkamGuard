"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScanSearch, Link2, Phone, MessageSquareText, ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysis, fileToBase64 } from "@/hooks/useAnalysis";
import ScreenshotUploader from "@/components/scan/ScreenshotUploader";
import UrlChecker from "@/components/scan/UrlChecker";
import PhoneChecker from "@/components/scan/PhoneChecker";
import ScanModeCard from "@/components/scan/ScanModeCard";
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
    gradient: "bg-white",
    iconBg: "bg-[#DDEBFF]",
    iconColor: "text-[#3B82F6]",
    recommended: true,
  },
  {
    mode: "message",
    icon: MessageSquareText,
    labelKey: "scan.checkMessage",
    descKey: "scan.checkMessageDesc",
    gradient: "bg-white",
    iconBg: "bg-[#F3E8FF]",
    iconColor: "text-[#A855F7]",
  },
  {
    mode: "url",
    icon: Link2,
    labelKey: "home.ctaUrl",
    descKey: "home.ctaUrlDesc",
    gradient: "bg-white",
    iconBg: "bg-[#FFF9C4]",
    iconColor: "text-[#FACC15]",
  },
  {
    mode: "phone",
    icon: Phone,
    labelKey: "home.ctaPhone",
    descKey: "home.ctaPhoneDesc",
    gradient: "bg-white",
    iconBg: "bg-[#E8F5E9]",
    iconColor: "text-[#4CAF50]",
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

        <div className="space-y-4">
          {MODE_CARDS.map((card) => (
            <ScanModeCard
              key={card.mode}
              icon={card.icon}
              labelKey={card.labelKey}
              descKey={card.descKey}
              iconBg={card.iconBg}
              iconColor={card.iconColor}
              recommended={card.recommended}
              onClick={() => setActiveMode(card.mode)}
            />
          ))}
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
