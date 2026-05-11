"use client";

import { useEffect, useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MessageCircle, MessageSquare, ThumbsUp, Download, Share, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toPng } from "html-to-image";

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  verdict: "safe" | "low" | "medium" | "high" | "critical" | "SAFE" | "SUSPICIOUS" | "DANGEROUS";
  isTourActive?: boolean;
}

export default function ShareDrawer({ isOpen, onClose, score, verdict, isTourActive }: ShareDrawerProps) {
  const { t } = useLanguage();
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  const verdictLabel = t(`report.verdictLabels.${String(verdict).toLowerCase()}`) || String(verdict).toUpperCase();
  const shareUrl = "https://skamguard-710868323753.asia-southeast1.run.app";
  const shareText = `⚠️ SCAM ALERT! SkamGuard detected this message scored ${score}/100 — ${verdictLabel}. Don't fall for it. Check suspicious messages at ${shareUrl}`;

  const handleNativeShare = async () => {
    if (isTourActive) return;
    try {
      await navigator.share({
        title: "SkamGuard Scam Alert",
        text: shareText,
        // When text and URL are both provided, some platforms concatenate them.
        url: shareUrl,
      });
    } catch {
      // User cancelled or share API unavailable — no action needed
    }
  };

  const handleWhatsApp = () => {
    if (isTourActive) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleMessages = () => {
    if (isTourActive) return;
    window.open(`sms:?&body=${encodeURIComponent(shareText)}`, "_self");
  };

  const handleFacebook = () => {
    if (isTourActive) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleSaveToPhotos = useCallback(async () => {
    if (isTourActive || isSaving) return;

    const reportCard = document.getElementById("report-capture-area");
    if (!reportCard) return;

    setIsSaving(true);

    try {
      // Temporarily hide the drawer overlay so it doesn't obscure the capture
      const overlayEl = document.querySelector("[data-share-overlay]") as HTMLElement | null;
      if (overlayEl) overlayEl.style.display = "none";

      // Save original styles and apply temporary padding for capture whitespace
      const origPadding = reportCard.style.padding;
      const origBg = reportCard.style.backgroundColor;
      const origBorderRadius = reportCard.style.borderRadius;
      reportCard.style.padding = "28px 32px 0px 32px";
      reportCard.style.backgroundColor = "#ffffff";
      reportCard.style.borderRadius = "16px";

      // Small delay to let repaint happen
      await new Promise((r) => setTimeout(r, 150));

      const dataUrl = await toPng(reportCard, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });

      // Restore original styles
      reportCard.style.padding = origPadding;
      reportCard.style.backgroundColor = origBg;
      reportCard.style.borderRadius = origBorderRadius;

      // Restore overlay
      if (overlayEl) overlayEl.style.display = "";

      // Create download link
      const link = document.createElement("a");
      link.download = `SkamGuard-Report-${score}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to save report image:", err);
      // Restore original styles on error
      if (reportCard) {
        reportCard.style.padding = "";
        reportCard.style.backgroundColor = "";
        reportCard.style.borderRadius = "";
      }
      // Restore overlay on error
      const overlayEl = document.querySelector("[data-share-overlay]") as HTMLElement | null;
      if (overlayEl) overlayEl.style.display = "";
    } finally {
      setIsSaving(false);
    }
  }, [isTourActive, isSaving, score]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-share-overlay className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
          {/* Overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Drawer content */}
          <m.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[768px] mx-auto bg-white rounded-t-3xl shadow-2xl px-8 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl sm:mb-8"
          >
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />

            <div className="text-center mb-8">
              <h2 className="text-[20px] font-bold text-slate-900 mb-1">
                {t("shareDrawer.title")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("shareDrawer.subtext")}
              </p>
            </div>

            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-medium mb-6 transition-colors"
              >
                <Share className="w-4 h-4" />
                {t("shareDrawer.nativeShare")}
              </button>
            )}

            <div className="flex justify-center gap-6 sm:gap-10">
              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleWhatsApp}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#25D366] text-white active:scale-95 transition-transform shadow-sm"
                >
                  <MessageCircle className="w-8 h-8 fill-current" />
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  {t("shareDrawer.whatsapp")}
                </span>
              </div>

              {/* Messages */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleMessages}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#34C759] text-white active:scale-95 transition-transform shadow-sm"
                >
                  <MessageSquare className="w-8 h-8 fill-current" />
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  {t("shareDrawer.messages")}
                </span>
              </div>

              {/* Facebook */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleFacebook}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#1877F2] text-white active:scale-95 transition-transform shadow-sm"
                >
                  <ThumbsUp className="w-8 h-8 fill-current" />
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  {t("shareDrawer.facebook")}
                </span>
              </div>

              {/* Save to Photos */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleSaveToPhotos}
                  disabled={isSaving}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-800 active:scale-95 transition-all shadow-sm ${
                    isSaving ? "bg-slate-100 opacity-70" : "bg-white"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
                  ) : (
                    <Download className="w-8 h-8" />
                  )}
                </button>
                <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  {isSaving ? "Saving..." : t("shareDrawer.saveToPhotos")}
                </span>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
