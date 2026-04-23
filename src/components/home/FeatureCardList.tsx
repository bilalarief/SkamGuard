"use client";

import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { cardHover } from "@/lib/motion";
import Link from "next/link";

export default function FeatureCardList() {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      <Link href="/scan" className="block no-underline">
        <motion.div
          whileHover={cardHover.whileHover}
          whileTap={cardHover.whileTap}
          transition={cardHover.transition}
          className="
            relative overflow-hidden
            rounded-2xl border-none
            p-6
            bg-[#009bf3]
            cursor-pointer
          "
        >
          <div className="relative z-10 text-white space-y-1 pr-16">
            <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {t("home.ctaAnalyze")}
            </h2>
            <h3 className="font-bold text-[22px] leading-tight whitespace-pre-line">
              {t("home.ctaCheckNow")}
            </h3>
            <div className="pt-2">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Decorative concentric circles */}
          <div className="absolute right-[0px] top-1/2 -translate-y-1/2 translate-x-1/4 w-40 h-40">
            <div className="absolute inset-0 bg-white/10 rounded-full scale-100 flex items-center justify-center">
              <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-[#25b1f9] rounded-full flex items-center justify-center border-4 border-[#52c1f9]">
                  <Search className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </section>
  );
}
