"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MessageCircle, MessageSquare, ThumbsUp, Download, Share } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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

  const handleSaveToPhotos = () => {
    if (isTourActive) return;
    // Fallback since html2canvas is not installed
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
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
                  className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white border border-slate-200 text-slate-800 active:scale-95 transition-transform shadow-sm"
                >
                  <Download className="w-8 h-8" />
                </button>
                <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  {t("shareDrawer.saveToPhotos")}
                </span>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
