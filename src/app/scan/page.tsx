"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScanSearch, Link2, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = (searchParams.get("mode") as ScanMode) || "screenshot";
  const [activeMode, setActiveMode] = useState<ScanMode>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);

    // TODO: Replace with actual API calls in Phase 8 (AI integration)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    router.push("/report");
    setLoading(false);
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
          <UrlChecker onSubmit={setUrlInput} />
        )}

        {activeMode === "phone" && (
          <PhoneChecker onSubmit={setPhoneInput} />
        )}
      </div>

      {/* Submit */}
      {loading ? (
        <LoadingSpinner size="md" message={t("scan.analyzing")} className="py-8" />
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
