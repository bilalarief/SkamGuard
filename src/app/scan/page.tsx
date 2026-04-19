"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScanSearch, Link2, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalysis, fileToBase64 } from "@/hooks/useAnalysis";
import ScreenshotUploader from "@/components/scan/ScreenshotUploader";
import UrlChecker from "@/components/scan/UrlChecker";
import PhoneChecker from "@/components/scan/PhoneChecker";
import Button from "@/components/shared/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type ScanMode = "screenshot" | "url" | "phone";

const TABS: { mode: ScanMode; icon: typeof ScanSearch; labelKey: string }[] = [
  { mode: "screenshot", icon: ScanSearch, labelKey: "home.ctaScan" },
  { mode: "url", icon: Link2, labelKey: "home.ctaUrl" },
  { mode: "phone", icon: Phone, labelKey: "home.ctaPhone" },
];

function ScanContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const { submit, isLoading, error } = useAnalysis();

  const initialMode = (searchParams.get("mode") as ScanMode) || "screenshot";
  const [activeMode, setActiveMode] = useState<ScanMode>(initialMode);
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
    (activeMode === "url" && urlInput.trim().length > 0) ||
    (activeMode === "phone" && phoneInput.trim().length > 0);

  return (
    <div className="container-app py-6 space-y-6">
      <h1 className="text-xl font-bold text-text-primary">
        {t("scan.title")}
      </h1>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-surface-hover rounded-radius-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.mode;

          return (
            <button
              key={tab.mode}
              onClick={() => setActiveMode(tab.mode)}
              className={`
                flex-1 flex items-center justify-center gap-1.5
                py-2.5 rounded-radius-sm
                text-xs font-medium
                transition-all duration-150 cursor-pointer
                ${isActive
                  ? "bg-surface shadow-sm text-primary"
                  : "text-text-muted hover:text-text-primary"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Content */}
      <div className="space-y-4">
        {activeMode === "screenshot" && (
          <>
            <ScreenshotUploader onFileSelect={setFile} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {t("scan.pasteTitle")}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("scan.pastePlaceholder")}
                rows={4}
                className="
                  w-full p-3
                  bg-surface border border-border rounded-radius-sm
                  text-sm text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                  transition-colors duration-150 resize-none
                "
              />
            </div>
          </>
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
        <div className="p-3 bg-risk-high-bg/50 border border-risk-high/20 rounded-radius-sm">
          <p className="text-sm text-risk-high">{error}</p>
        </div>
      )}

      {/* Submit */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          <LoadingSpinner size="lg" message={t("scan.analyzing")} />
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{t("scan.loadingStep1")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
              <span>{t("scan.loadingStep2")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className="w-2 h-2 rounded-full bg-risk-medium animate-pulse" style={{ animationDelay: "1s" }} />
              <span>{t("scan.loadingStep3")}</span>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          onClick={handleAnalyze}
        >
          {t("scan.analyzeButton")}
        </Button>
      )}
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
