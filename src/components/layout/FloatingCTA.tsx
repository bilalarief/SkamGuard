"use client";

import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div 
      className="fixed z-[60] right-4 sm:right-6 bottom-24 md:bottom-8 flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <m.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-3 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none"
          >
            {t("common.faq")}
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-slate-900" />
          </m.div>
        )}
      </AnimatePresence>

      <Link 
        href="https://skamguard-landing-page-710868323753.asia-southeast1.run.app/#faq"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <m.div
          className="w-12 h-12 md:w-11 md:h-11 flex items-center justify-center bg-[#00A6F4] text-white rounded-full shadow-lg cursor-pointer border border-white/20 transition-colors hover:bg-[#008DD1]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MessageCircleQuestion strokeWidth={2.5} className="w-5 h-5 md:w-6 md:h-6" />
        </m.div>
      </Link>
    </div>
  );
}
