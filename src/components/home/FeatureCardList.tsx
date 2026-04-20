"use client";

import { ScanSearch } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";

export default function FeatureCardList() {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
        Feature
      </h2>

      {/* Single "Check Now" card that navigates to /scan (feature selection) */}
      <Link href="/scan" className="block no-underline">
        <div
          className="
            rounded-2xl border border-border
            p-5 space-y-3
            bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#FFFFFF]
            hover:shadow-md active:scale-[0.99]
            transition-all duration-200
            cursor-pointer
          "
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ScanSearch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">
              {t("home.ctaScan")}
            </h3>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              {t("home.ctaScanDesc")}
            </p>
          </div>
        </div>
      </Link>
    </section>
  );
}
