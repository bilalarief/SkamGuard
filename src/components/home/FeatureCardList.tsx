"use client";

import { ArrowRight } from "lucide-react";
import { m } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { cardHover } from "@/lib/motion";
import Link from "next/link";

export default function FeatureCardList() {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      <Link href="/scan" className="block no-underline">
        <m.div
          whileHover={cardHover.whileHover}
          whileTap={cardHover.whileTap}
          transition={cardHover.transition}
          className="
            relative overflow-hidden
            rounded-2xl border-none
            p-6
            bg-gradient-to-r from-[#00A6F4] to-[#29BBFF]
            cursor-pointer
          "
        >
          <div className="relative z-10 text-white space-y-1 pr-16">
            <h2 className="text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-widest opacity-80">
              {t("home.ctaAnalyze")}
            </h2>
            <h3 className="font-bold text-[22px] sm:text-[23px] md:text-2xl leading-tight whitespace-pre-line">
              {t("home.ctaCheckNow")}
            </h3>
            <div className="pt-2">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Search Icon Background — fill inside positioned container */}
          <div className="absolute right-[-15px] top-1/2 -translate-y-5/9 w-35 h-35 opacity-100 pointer-events-none">
            <Image
              src="/icons/IconSearchWhite.png"
              alt=""
              fill
              className="object-contain"
              aria-hidden="true"
            />
          </div>
        </m.div>
      </Link>
    </section>
  );
}
