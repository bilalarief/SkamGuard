"use client";

import { Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";

export default function FeatureCardList() {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      {/* Single "Check Now" card that navigates to /scan (feature selection) */}
      <Link href="/scan" className="block no-underline">
        <div
          className="
            relative overflow-hidden
            rounded-2xl border-none
            p-6
            bg-[#009bf3]
            hover:shadow-md active:scale-[0.99]
            transition-all duration-200
            cursor-pointer
          "
        >
          <div className="relative z-10 text-white space-y-1 pr-16">
            <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              Analyze
            </h2>
            <h3 className="font-bold text-[22px] leading-tight">
              Check The <br /> Message Now
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
        </div>
      </Link>
    </section>
  );
}
