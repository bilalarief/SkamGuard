"use client";

import { LucideIcon, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { cardHover } from "@/lib/motion";

interface ScanModeCardProps {
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
  iconBg: string;
  iconColor: string;
  recommended?: boolean;
  onClick: () => void;
}

export default function ScanModeCard({
  icon: Icon,
  labelKey,
  descKey,
  iconBg,
  iconColor,
  recommended,
  onClick,
}: ScanModeCardProps) {
  const { t } = useLanguage();

  return (
    <motion.button
      onClick={onClick}
      whileHover={cardHover.whileHover}
      whileTap={cardHover.whileTap}
      transition={cardHover.transition}
      className="
        w-full text-left p-5 rounded-2xl border border-[#E2E8F0]
        bg-white
        transition-colors duration-200 cursor-pointer
        flex flex-col gap-4 group relative
      "
    >
      <div className="flex justify-between items-start w-full">
        {/* Icon Container */}
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${iconBg}
          `}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        <div className="flex items-center gap-3">
          {recommended && (
            <span className="text-[10px] font-bold text-[#3B82F6] bg-[#DBEAFE] px-2 py-0.5 rounded-md">
              {t("scan.recommended")}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#64748B] transition-colors" />
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-1">
        <h3 className="font-bold text-[16px] text-[#1E293B]">
          {t(labelKey)}
        </h3>
        <p className="text-[13px] text-[#64748B] leading-snug">
          {t(descKey)}
        </p>
      </div>
    </motion.button>
  );
}
