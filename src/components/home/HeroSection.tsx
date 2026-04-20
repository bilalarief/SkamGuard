"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">
        {t("home.statsTitle")}
      </h2>
      <div className="w-full">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="w-full h-[200px] rounded-2xl overflow-hidden"
        >
          <SwiperSlide>
            <div className="relative w-full h-full">
              <img
                src="/banner1.jpg"
                className="w-full h-full object-cover"
                alt="Scam news"
              />
              {/* Dark gradient overlay on left */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B4965]/90 via-[#1B4965]/60 to-transparent" />
              {/* News content overlay */}
              <div className="absolute inset-0 flex flex-col justify-center px-5 py-4 max-w-[60%]">
                <span className="inline-flex items-center self-start bg-risk-high text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                  News
                </span>
                <h3 className="text-white text-sm font-extrabold leading-tight mb-1.5">
                  Police: RM1.47 Billion Lost To Investment Scams Last Year
                </h3>
                <p className="text-white/70 text-[9px] leading-snug">
                  Malaysians lost RM1.47 billion to investment scams in 2025 across 9,603 cases, according to police, who warned of increasingly sophisticated online fraud tactics.
                </p>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-[#1B4965] to-[#5FA8D3] flex items-center px-5">
              <div className="max-w-[70%]">
                <span className="inline-flex items-center self-start bg-accent text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                  Alert
                </span>
                <h3 className="text-white text-sm font-extrabold leading-tight mb-1.5">
                  Stay Vigilant Against Online Scams
                </h3>
                <p className="text-white/70 text-[9px] leading-snug">
                  Always verify sender identity before sharing personal information or making payments.
                </p>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-[#0D2B3E] to-[#1B4965] flex items-center px-5">
              <div className="max-w-[70%]">
                <span className="inline-flex items-center self-start bg-risk-low text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                  Tip
                </span>
                <h3 className="text-white text-sm font-extrabold leading-tight mb-1.5">
                  Use SkamGuard to Verify Suspicious Messages
                </h3>
                <p className="text-white/70 text-[9px] leading-snug">
                  Upload screenshots of WhatsApp, SMS, or email messages and let our AI analyze them for scam patterns.
                </p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Custom Swiper pagination styling */}
        <style jsx global>{`
          .swiper-pagination {
            bottom: 10px !important;
          }

          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background: #94a3b8;
            opacity: 1;
            border-radius: 999px;
            margin: 0 3px !important;
            transition: all 0.3s ease;
          }

          .swiper-pagination-bullet-active {
            width: 24px;
            background: #334155;
          }
        `}</style>
      </div>
    </section>
  );
}